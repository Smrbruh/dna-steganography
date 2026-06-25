#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "dna_encoder.h"
#include "reed_solomon.h"
#include "dna_compressor.h"
#include "dna_stats.h"
namespace py = pybind11;
PYBIND11_MODULE(dna_core, m) {
    m.doc() = "DNA Steganography core library - high-performance C++ backend";
    py::register_exception<dna::DnaEncodeError>(m, "DnaEncodeError");
    py::register_exception<dna::ReedSolomonError>(m, "ReedSolomonError");
    py::register_exception<dna::DnaCompressError>(m, "DnaCompressError");
    py::register_exception<dna::DnaStatsError>(m, "DnaStatsError");
    py::class_<dna::DnaEncoder>(m, "DnaEncoder")
        .def(py::init<>())
        .def_static("encode",
            [](const std::vector<uint8_t>& data) {
                return dna::DnaEncoder::encode(data);
            },
            py::arg("data"),
            "Encode bytes to DNA string (A=00, C=01, G=10, T=11)")
        .def_static("decode",
            [](const std::string& dna) {
                return dna::DnaEncoder::decode(dna);
            },
            py::arg("dna"),
            "Decode DNA string back to bytes")
        .def_static("validate",
            [](const std::string& dna) {
                return dna::DnaEncoder::validate(dna);
            },
            py::arg("dna"),
            "Validate that string contains only A, C, G, T");
    py::class_<dna::ReedSolomon>(m, "ReedSolomon")
        .def(py::init<>())
        .def_static("add_parity",
            [](const std::string& data, int level) {
                return dna::ReedSolomon::add_parity(data, level);
            },
            py::arg("data"),
            py::arg("level") = 4,
            "Add Reed-Solomon parity to DNA string (level 1-8)")
        .def_static("remove_parity",
            [](const std::string& data) {
                return dna::ReedSolomon::remove_parity(data);
            },
            py::arg("data"),
            "Remove parity symbols and recover original DNA")
        .def_static("verify",
            [](const std::string& data) {
                return dna::ReedSolomon::verify(data);
            },
            py::arg("data"),
            "Verify integrity of RS-encoded DNA string");
    py::class_<dna::DnaCompressor>(m, "DnaCompressor")
        .def(py::init<>())
        .def_static("compress",
            [](const std::vector<uint8_t>& data) {
                return dna::DnaCompressor::compress(data);
            },
            py::arg("data"),
            "Compress bytes using Zstandard")
        .def_static("decompress",
            [](const std::vector<uint8_t>& data) {
                return dna::DnaCompressor::decompress(data);
            },
            py::arg("data"),
            "Decompress bytes previously compressed with DnaCompressor::compress");
    py::class_<dna::DnaStats>(m, "DnaStats")
        .def(py::init<>())
        .def_static("gc_content",
            [](const std::string& dna) {
                return dna::DnaStats::gc_content(dna);
            },
            py::arg("dna"),
            "Compute GC content (ratio of G+C bases)")
        .def_static("length",
            [](const std::string& dna) {
                return dna::DnaStats::length(dna);
            },
            py::arg("dna"),
            "Return length of DNA string")
        .def_static("base_count",
            [](const std::string& dna) {
                return dna::DnaStats::base_count(dna);
            },
            py::arg("dna"),
            "Count occurrences of each base (A, C, G, T)")
        .def_static("shannon_entropy",
            [](const std::string& dna) {
                return dna::DnaStats::shannon_entropy(dna);
            },
            py::arg("dna"),
            "Compute Shannon entropy (bits per base, max 2.0)")
        .def_static("homopolymer_run_max",
            [](const std::string& dna) {
                return dna::DnaStats::homopolymer_run_max(dna);
            },
            py::arg("dna"),
            "Return length of the longest homopolymer run");
    m.attr("__version__") = "1.0.0";
    m.attr("__author__") = "DNA-Steganography Project";
}