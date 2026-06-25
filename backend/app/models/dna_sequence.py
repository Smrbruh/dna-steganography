from sqlalchemy import Column, String, DateTime, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import uuid
from datetime import datetime

class DNAJob(Base):
    __tablename__ = "dna_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    status = Column(String(50), default="processing")
    dna_sequence = Column(Text, nullable=True)
    gc_content = Column(Float, nullable=True)
    length = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
