import json
from app.models.dna_sequence import DNAJob
def generate_report(job: DNAJob) -> dict:
    return {
        "filename": job.filename,
        "status": job.status,
        "gc_content": job.gc_content,
        "length": job.length,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None
    }