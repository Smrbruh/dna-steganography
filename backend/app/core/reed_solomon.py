from app.core.dna_core import ReedSolomon
def add_parity(data: bytes, level: int = 1) -> bytes:
    return ReedSolomon.add_parity(data.decode(), level).encode()
def verify_parity(data: bytes) -> bool:
    return ReedSolomon.verify(data.decode())