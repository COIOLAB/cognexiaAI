import json
import os
import fcntl
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from threading import Lock

class FileDB:
    def __init__(self, collection_path: Path):
        self.collection_path = collection_path
        self.collection_path.mkdir(parents=True, exist_ok=True)
        self._cache = {}
        self._locks = {}
        self._memory_lock = Lock()

    def _get_file_path(self, doc_id: str) -> Path:
        return self.collection_path / f"{doc_id}.json"

    def _acquire_lock(self, doc_id: str) -> bool:
        if doc_id not in self._locks:
            self._locks[doc_id] = Lock()
        return self._locks[doc_id].acquire(timeout=30)

    def _release_lock(self, doc_id: str):
        if doc_id in self._locks:
            self._locks[doc_id].release()

    def create(self, data: Dict) -> str:
        """Create a new document in the collection."""
        doc_id = str(uuid.uuid4())
        data['_id'] = doc_id
        data['created_at'] = datetime.utcnow().isoformat()
        data['updated_at'] = data['created_at']
        data['_version'] = 1

        if self._acquire_lock(doc_id):
            try:
                file_path = self._get_file_path(doc_id)
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)
                self._cache[doc_id] = data
                return doc_id
            finally:
                self._release_lock(doc_id)
        raise TimeoutError("Could not acquire lock")

    def read(self, doc_id: str) -> Optional[Dict]:
        """Read a document from the collection."""
        # Check cache first
        if doc_id in self._cache:
            return self._cache[doc_id]

        file_path = self._get_file_path(doc_id)
        if not file_path.exists():
            return None

        if self._acquire_lock(doc_id):
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                self._cache[doc_id] = data
                return data
            finally:
                self._release_lock(doc_id)
        raise TimeoutError("Could not acquire lock")

    def update(self, doc_id: str, updates: Dict) -> bool:
        """Update a document in the collection."""
        if self._acquire_lock(doc_id):
            try:
                current_data = self.read(doc_id)
                if not current_data:
                    return False

                # Update the document
                current_data.update(updates)
                current_data['updated_at'] = datetime.utcnow().isoformat()
                current_data['_version'] += 1

                file_path = self._get_file_path(doc_id)
                with open(file_path, 'w') as f:
                    json.dump(current_data, f, indent=2)
                
                self._cache[doc_id] = current_data
                return True
            finally:
                self._release_lock(doc_id)
        raise TimeoutError("Could not acquire lock")

    def delete(self, doc_id: str) -> bool:
        """Delete a document from the collection."""
        file_path = self._get_file_path(doc_id)
        if not file_path.exists():
            return False

        if self._acquire_lock(doc_id):
            try:
                file_path.unlink()
                if doc_id in self._cache:
                    del self._cache[doc_id]
                return True
            finally:
                self._release_lock(doc_id)
        raise TimeoutError("Could not acquire lock")

    def query(self, filter_func=None, limit=None, skip=0) -> List[Dict]:
        """Query documents in the collection."""
        results = []
        for file_path in self.collection_path.glob("*.json"):
            doc_id = file_path.stem
            doc = self.read(doc_id)
            if doc and (filter_func is None or filter_func(doc)):
                results.append(doc)

        # Apply skip and limit
        return results[skip:limit] if limit else results[skip:]

    def create_index(self, field: str):
        """Create an index for faster querying (in-memory only)."""
        index = {}
        for file_path in self.collection_path.glob("*.json"):
            doc_id = file_path.stem
            doc = self.read(doc_id)
            if doc and field in doc:
                key = doc[field]
                if key not in index:
                    index[key] = []
                index[key].append(doc_id)
        return index
