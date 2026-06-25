from app.core.dna_core import DNACompressor
def compress_data(data: bytes) -> bytes:
    return DNACompressor.compress(list(data))
def decompress_data(data: bytes) -> bytes:
    return bytes(DNACompressor.decompress(list(data)))