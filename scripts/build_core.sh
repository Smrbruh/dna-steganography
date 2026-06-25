#!/bin/bash
set -e
echo "Building C++ core..."
mkdir -p build
cd build
cmake ../core
make -j$(nproc)
echo "C++ core built successfully"