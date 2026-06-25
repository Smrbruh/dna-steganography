from fastapi import APIRouter, HTTPException
from app.core.dna_core import DNAEncoder, DNACompressor
router = APIRouter()
@router.post("/decode")
async def decode_dna(dna: str):
    try:
        if not DNAEncoder.is_valid(dna):
            raise HTTPException(status_code=400, detail="Invalid DNA sequence")
        decoded = DNAEncoder.decode(dna)
        decompressed = DNACompressor.decompress(decoded)
        return {"decoded": decompressed.hex()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))