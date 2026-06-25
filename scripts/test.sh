#!/bin/bash
set -e
echo "Running tests..."
cd backend
pytest tests/
echo "All tests passed!"