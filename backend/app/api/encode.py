from fastapi import APIRouter, UploadFile, File
from app.tasks.encode_task import encode_task
import uuid
router = APIRouter()
@router.post("/encode")
async def encode_file(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    content = await file.read()
    encode_task.delay(job_id, content, file.filename)
    return {"job_id": job_id, "status": "processing"}