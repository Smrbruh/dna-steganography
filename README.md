# 🧬 DNA Steganography

**Encode any file into DNA sequences and decode it back.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r152-000000.svg)](https://threejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-24-2496ED.svg)](https://www.docker.com/)

---

## 📖 About

**DNA Steganography** is a full-stack system that encodes any file into a DNA sequence (A, C, G, T) and decodes it back to the original file.

It combines a high-performance **C++ core** for encoding/decoding, a **FastAPI** backend, and a **React** frontend with interactive **3D DNA visualization**.

> 💡 **Why DNA?** DNA has enormous storage density — 1 gram of DNA can store up to 215 petabytes of data. While this project is a simulation, it demonstrates the principles of biological data storage.

---

## ✨ Features

- 🧬 **Encode any file** (text, image, PDF, video) into DNA sequence
- 🔬 **Decode DNA** back to the original file with error correction
- 🎨 **3D DNA helix visualization** built with Three.js
- 📊 **Real-time statistics**: GC-content, nucleotide distribution, file size
- ⚡ **Async processing** with Celery + Redis for large files
- 🗄️ **Persistent storage** in PostgreSQL
- 📖 **REST API** with Swagger documentation
- 🐳 **Dockerized** for easy deployment

---

## 🖥️ Screenshots

> *Interactive 3D DNA helix with real-time statistics and encoding history.*

![DNA Steganography UI](docs/images/screenshot.png)

*Coming soon — run the project locally to see it in action.*


---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core** | C++20, Pybind11 | High-performance DNA encoding/decoding |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy | REST API, database, business logic |
| **Queue** | Celery, Redis | Async task processing for large files |
| **Database** | PostgreSQL 15 | Persistent storage of jobs and sequences |
| **Frontend** | React 18, TypeScript, Three.js | UI, 3D visualization, interactivity |
| **Styling** | Tailwind CSS, Framer Motion | Modern, responsive, animated UI |
| **DevOps** | Docker, GitHub Actions | Containerization, CI/CD |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL and Redis)
- CMake 3.14+ (for C++ core)

### Clone the repository

```bash
git clone https://github.com/Smrbruh/dna-steganography
cd dna-steganography
```
1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run PostgreSQL and Redis in Docker
docker run -d --name dch-postgres \
  -e POSTGRES_USER=dch \
  -e POSTGRES_PASSWORD=dch_password \
  -e POSTGRES_DB=dch_analytics \
  -p 5432:5432 postgres:15-alpine

docker run -d --name dch-redis -p 6379:6379 redis:7-alpine

# Start Celery worker (in a separate terminal)
celery -A app.celery_app worker --loglevel=info

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

📡 API Endpoints
Method	Endpoint	Description
POST	/api/encode	Upload a file → returns job_id
GET	/api/status/{job_id}	Check encoding status and get DNA sequence
POST	/api/decode	Decode DNA sequence → returns file URL
GET	/api/download/{file_id}	Download the decoded file
GET	/api/health	Health check
Interactive API Documentation
Once the backend is running, visit:

👉 http://localhost:8000/docs

🔬 How It Works
Encoding Pipeline
text
File → Compress → Binary → DNA (A,C,G,T) → Error Correction → Save
Decoding Pipeline
text
DNA (A,C,G,T) → Error Correction → Binary → Decompress → Original File
The C++ core handles the heavy lifting with optimized algorithms and optional Reed-Solomon error correction.

📁 Project Structure
text
dna-steganography/
│   .gitignore
│
├───.github
│   └───workflows
│           ci.yml
│
├───backend
│   │   .dockerignore
│   │   docker-compose.yml
│   │   Dockerfile
│   │   requirements.txt
│   │
│   ├───alembic
│   │   └───versions
│   │           .keep
│   │
│   └───app
│       │   auth.py
│       │   celery_app.py
│       │   config.py
│       │   database.py
│       │   main.py
│       │   models.py
│       │   tasks.py
│       │   __init__.py
│       │
│       ├───api
│       │       decode.py
│       │       encode.py
│       │       health.py
│       │       reports.py
│       │       __init__.py
│       │
│       ├───core
│       │       compressor.py
│       │       dna_core.dll
│       │       dna_core.py
│       │       reed_solomon.py
│       │       __init__.py
│       │
│       ├───models
│       │       dna_sequence.py
│       │       file.py
│       │       report.py
│       │       session.py
│       │       user.py
│       │       __init__.py
│       │
│       ├───services
│       │       latex_generator.py
│       │       report_service.py
│       │       __init__.py
│       │
│       └───utils
│               file_utils.py
│               validators.py
│               __init__.py
│
├───core
│   │   CMakeLists.txt
│   │
│   ├───bindings
│   │       bindings.cpp
│   │
│   ├───include
│   │       dna_compressor.h
│   │       dna_encoder.h
│   │       dna_stats.h
│   │       reed_solomon.h
│   │
│   ├───src
│   │       dna_compressor.cpp
│   │       dna_encoder.cpp
│   │       dna_stats.cpp
│   │       reed_solomon.cpp
│   │
│   └───tests
│           test_dna_core.cpp
│
├───docs
│       api_reference.md
│       architecture.md
│       user_guide.md
│
├───frontend
│   │   index.html
│   │   package-lock.json
│   │   package.json
│   │   postcss.config.js
│   │   tailwind.config.js
│   │   tsconfig.json
│   │   tsconfig.node.json
│   │   vite-env.d.ts
│   │   vite.config.ts
│   │
│   ├───public
│   └───src
│       │   App.tsx
│       │   index.css
│       │   main.tsx
│       │
│       ├───components
│       │       DNAVisualizer.tsx
│       │       FileUploader.tsx
│       │       History.tsx
│       │       Stats.tsx
│       │       StatusBadge.tsx
│       │
│       ├───hooks
│       │       useDNAEncoder.ts
│       │       useFileUpload.ts
│       │
│       ├───types
│       │       index.ts
│       │
│       └───utils
│               api.ts
│               dnaUtils.ts
│               formatters.ts
│
└───scripts
        build_core.sh
        run_dev.sh
        test.sh
🧪 Testing
```bash
# Run Python tests
cd backend
pytest tests/

# Run C++ tests
cd core/build
ctest
```

---

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

---

📄 License
MIT — see LICENSE for details.

---

👨‍💻 Author
<div>Bakdaulet Sotsial (Smrbruh)</div>

GitHub: @Smrbruh

LinkedIn: Bakdaulet Sotsial

---

🙏 Acknowledgments
Inspired by research in DNA data storage

---

Built with ❤️ and a lot of code

Made with passion for bioinformatics and software engineering.
