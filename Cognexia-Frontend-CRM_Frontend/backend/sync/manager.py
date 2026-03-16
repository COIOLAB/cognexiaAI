import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import threading
import queue
from ..config import SYNC_DIR, SYNC_INTERVAL, MAX_SYNC_RETRIES

class SyncManager:
    def __init__(self):
        self.sync_queue = queue.Queue()
        self.sync_thread = None
        self.running = False
        self._ensure_sync_dir()

    def _ensure_sync_dir(self):
        SYNC_DIR.mkdir(parents=True, exist_ok=True)

    def start(self):
        """Start the sync manager thread."""
        if not self.running:
            self.running = True
            self.sync_thread = threading.Thread(target=self._sync_worker)
            self.sync_thread.daemon = True
            self.sync_thread.start()

    def stop(self):
        """Stop the sync manager thread."""
        self.running = False
        if self.sync_thread:
            self.sync_thread.join()

    def queue_change(self, collection: str, doc_id: str, operation: str, data: Optional[Dict] = None):
        """Queue a change for synchronization."""
        change = {
            'collection': collection,
            'doc_id': doc_id,
            'operation': operation,
            'data': data,
            'timestamp': datetime.utcnow().isoformat(),
            'attempts': 0
        }
        
        # Save change to disk
        change_file = SYNC_DIR / f"{doc_id}_{int(time.time())}.json"
        with open(change_file, 'w') as f:
            json.dump(change, f, indent=2)
        
        # Add to memory queue
        self.sync_queue.put(change)

    def _sync_worker(self):
        """Background worker that processes sync queue."""
        while self.running:
            try:
                # Process any pending changes from disk first
                self._process_pending_changes()
                
                # Process new changes from queue
                try:
                    change = self.sync_queue.get(timeout=SYNC_INTERVAL)
                    self._process_change(change)
                except queue.Empty:
                    continue
                
            except Exception as e:
                print(f"Sync error: {e}")
                time.sleep(SYNC_INTERVAL)

    def _process_pending_changes(self):
        """Process any pending changes from disk."""
        for change_file in SYNC_DIR.glob("*.json"):
            try:
                with open(change_file, 'r') as f:
                    change = json.load(f)
                
                if change['attempts'] < MAX_SYNC_RETRIES:
                    success = self._process_change(change)
                    if success:
                        change_file.unlink()
                    else:
                        # Update attempts and save back
                        change['attempts'] += 1
                        with open(change_file, 'w') as f:
                            json.dump(change, f, indent=2)
                else:
                    # Move to failed sync directory
                    failed_dir = SYNC_DIR / 'failed'
                    failed_dir.mkdir(exist_ok=True)
                    change_file.rename(failed_dir / change_file.name)
            
            except Exception as e:
                print(f"Error processing change file {change_file}: {e}")

    def _process_change(self, change: Dict) -> bool:
        """Process a single change. Returns True if successful."""
        try:
            # Here you would implement the actual sync logic
            # For example, sending to a remote server when online
            # For now, we'll just simulate success
            print(f"Processing change: {change}")
            return True
        
        except Exception as e:
            print(f"Error processing change: {e}")
            return False

# Global sync manager instance
sync_manager = SyncManager()
