cmake_minimum_required(VERSION 3.14)
project(dna_core)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_library(dna_core SHARED
    src/dna_encoder.cpp
    src/dna_compressor.cpp
    src/dna_stats.cpp
    src/reed_solomon.cpp
)
target_include_directories(dna_core PRIVATE include)