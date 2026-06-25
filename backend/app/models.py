import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")
    dna_sequences = relationship("DNASequence", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    user = relationship("User", back_populates="sessions")

class File(Base):
    __tablename__ = "files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String(255), unique=True, nullable=False, index=True)
    original_filename = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=False)
    content_type = Column(String(255), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="files")
    dna_sequence = relationship("DNASequence", back_populates="source_file", uselist=False)

class DNASequence(Base):
    __tablename__ = "dna_sequences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String(255), nullable=False, index=True)
    sequence_length = Column(Integer, nullable=False)
    gc_content = Column(Float, nullable=True)
    at_content = Column(Float, nullable=True)
    nucleotide_a = Column(Integer, default=0)
    nucleotide_c = Column(Integer, default=0)
    nucleotide_g = Column(Integer, default=0)
    nucleotide_t = Column(Integer, default=0)
    encoding_method = Column(String(50), default="binary_2bit")
    source_file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    source_file = relationship("File", back_populates="dna_sequence")
    user = relationship("User", back_populates="dna_sequences")
    reports = relationship("Report", back_populates="dna_sequence", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(String(255), nullable=False, index=True)
    report_job_id = Column(String(255), nullable=True, index=True)
    dna_sequence_id = Column(UUID(as_uuid=True), ForeignKey("dna_sequences.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    pdf_path = Column(String(1000), nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    dna_sequence = relationship("DNASequence", back_populates="reports")
    user = relationship("User", back_populates="reports")