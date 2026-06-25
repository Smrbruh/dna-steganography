from app.celery_app import celery_app
from app.core.dna_core import DNAEncoder, DNACompressor, ReedSolomon, DNAStats
from app.database import SessionLocal
from app.models import DNAJob
from datetime import datetime
import uuid

@celery_app.task
def encode_large_file(job_id: str, content: bytes, filename: str):
    try:
        compressed = DNACompressor.compress(list(content))
        dna = DNAEncoder.encode(compressed)
        with_parity = ReedSolomon.add_parity(dna, 3)
        stats = DNAStats.analyze(with_parity, list(content))

        db = SessionLocal()
        job = db.query(DNAJob).filter(DNAJob.id == uuid.UUID(job_id)).first()
        if job:
            job.status = "completed"
            job.dna_sequence = with_parity
            job.gc_content = stats.gc_content
            job.length = stats.length
            job.completed_at = datetime.utcnow()
            db.commit()
        db.close()
        return {"job_id": job_id, "status": "completed"}
    except Exception as e:
        db = SessionLocal()
        job = db.query(DNAJob).filter(DNAJob.id == uuid.UUID(job_id)).first()
        if job:
            job.status = "failed"
            db.commit()
        db.close()
        raise e

# Заглушки для других задач
def decode_large_file(*args, **kwargs):
    return {"status": "not implemented"}

def generate_report(*args, **kwargs):
    return {"status": "not implemented"}
