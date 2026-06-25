from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import uuid
import tempfile
from app.core.dna_core import DNAEncoder, DNACompressor, ReedSolomon, DNAStats
from app.tasks import encode_large_file, decode_large_file, generate_report
from app.database import SessionLocal, get_db
from app.models import DNAJob
from sqlalchemy.orm import Session
import json

app = FastAPI(title="DNA Steganography API", version="1.0.0")

class EncodeResponse(BaseModel):
    job_id: str
    status: str

class DecodeResponse(BaseModel):
    file_url: str

@app.post("/api/encode", response_model=EncodeResponse)
async def encode_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    content = await file.read()
    job = DNAJob(id=job_id, filename=file.filename, status="processing")
    db.add(job)
    db.commit()
    encode_large_file(job_id, content, file.filename)
    return EncodeResponse(job_id=job_id, status="processing")

@app.get("/api/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(DNAJob).filter(DNAJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": str(job.id),
        "status": job.status,
        "dna_sequence": job.dna_sequence[:200] + "..." if job.dna_sequence else None,
        "gc_content": job.gc_content,
        "length": job.length
    }

@app.post("/api/decode")
async def decode_file(dna: str):
    if not DNAEncoder.is_valid(dna):
        raise HTTPException(status_code=400, detail="Invalid DNA sequence")
    decoded = DNAEncoder.decode(dna)
    decompressed = decoded
    file_id = str(uuid.uuid4())
    file_path = os.path.join(tempfile.gettempdir(), f"{file_id}.bin")
    with open(file_path, "wb") as f:
        f.write(bytes(decompressed))
    return {"file_url": f"/api/download/{file_id}"}

@app.get("/api/download/{file_id}")
async def download_file(file_id: str):
    file_path = os.path.join(tempfile.gettempdir(), f"{file_id}.bin")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=f"{file_id}.bin")

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "DNA Steganography API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)