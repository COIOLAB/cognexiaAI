import os
from pathlib import Path

# Base directory configuration
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'
BACKUP_DIR = BASE_DIR / 'backups'
SYNC_DIR = BASE_DIR / 'sync_queue'
LOG_DIR = BASE_DIR / 'logs'

# Create necessary directories if they don't exist
for directory in [DATA_DIR, BACKUP_DIR, SYNC_DIR, LOG_DIR]:
    directory.mkdir(exist_ok=True)

# Database configuration
DB_COLLECTIONS = {
    'machines': DATA_DIR / 'machines',
    'processes': DATA_DIR / 'processes',
    'analytics': DATA_DIR / 'analytics',
    'users': DATA_DIR / 'users',
    'iot_devices': DATA_DIR / 'iot_devices',
    'maintenance': DATA_DIR / 'maintenance',
    'inventory': DATA_DIR / 'inventory',
    'production': DATA_DIR / 'production',
}

# Create collection directories
for collection_dir in DB_COLLECTIONS.values():
    collection_dir.mkdir(exist_ok=True)

# Security configuration
ENCRYPTION_KEY_FILE = BASE_DIR / 'encryption.key'
ACCESS_LOG_FILE = LOG_DIR / 'access.log'
ERROR_LOG_FILE = LOG_DIR / 'error.log'

# Sync configuration
SYNC_INTERVAL = 300  # 5 minutes
MAX_SYNC_RETRIES = 3
SYNC_BATCH_SIZE = 100

# Performance configuration
MAX_CONNECTIONS = 100
CACHE_SIZE = 1000  # Number of records to keep in memory
FILE_LOCK_TIMEOUT = 30  # seconds
