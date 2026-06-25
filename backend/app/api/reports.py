from fastapi import APIRouter
from app.tasks.report_task import report_task
from app.tasks import get_job_status
router = APIRouter()
@router.get("/report/{job_id}")
async def get_report(job_id: str):
    return get_job_status(job_id)