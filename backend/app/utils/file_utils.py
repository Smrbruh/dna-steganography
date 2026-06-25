import os
import hashlib
def get_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()
def get_file_size(content: bytes) -> int:
    return len(content)
def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()