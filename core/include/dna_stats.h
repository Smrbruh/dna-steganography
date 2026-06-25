#pragma once
#include <string>
#include <map>
#include <cstdint>
#include <stdexcept>
namespace dna {
class DnaStats {
public:
    static double gc_content(const std::string& dna);
    static size_t length(const std::string& dna);
    static std::map<char, int> base_count(const std::string& dna);
    static double shannon_entropy(const std::string& dna);
    static double homopolymer_run_max(const std::string& dna);
};
class DnaStatsError : public std::runtime_error {
public:
    explicit DnaStatsError(const std::string& msg) : std::runtime_error(msg) {}
};
}