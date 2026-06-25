#include "../include/dna_stats.h"
#include "../include/dna_compressor.h"
#include <cmath>
#include <stdexcept>
#include <cctype>

namespace dna {

static void validate_dna(const std::string& dna) {
    for (char c : dna) {
        if (c != 'A' && c != 'C' && c != 'G' && c != 'T') {
            throw DnaStatsError(std::string("Invalid DNA base: '") + c + "'");
        }
    }
}

double DnaStats::gc_content(const std::string& dna) {
    if (dna.empty()) return 0.0;
    validate_dna(dna);
    size_t gc = 0;
    for (char c : dna) {
        if (c == 'G' || c == 'C') ++gc;
    }
    return static_cast<double>(gc) / static_cast<double>(dna.size());
}

size_t DnaStats::length(const std::string& dna) {
    return dna.size();
}

std::map<char, int> DnaStats::base_count(const std::string& dna) {
    validate_dna(dna);
    std::map<char, int> counts = {{'A', 0}, {'C', 0}, {'G', 0}, {'T', 0}};
    for (char c : dna) {
        ++counts[c];
    }
    return counts;
}

double DnaStats::shannon_entropy(const std::string& dna) {
    if (dna.empty()) return 0.0;
    validate_dna(dna);
    auto counts = base_count(dna);
    double entropy = 0.0;
    double n = static_cast<double>(dna.size());
    for (auto& [base, cnt] : counts) {
        if (cnt > 0) {
            double p = static_cast<double>(cnt) / n;
            entropy -= p * std::log2(p);
        }
    }
    return entropy;
}

double DnaStats::homopolymer_run_max(const std::string& dna) {
    if (dna.empty()) return 0.0;
    validate_dna(dna);
    int max_run = 1, cur_run = 1;
    for (size_t i = 1; i < dna.size(); ++i) {
        if (dna[i] == dna[i-1]) {
            ++cur_run;
            if (cur_run > max_run) max_run = cur_run;
        } else {
            cur_run = 1;
        }
    }
    return static_cast<double>(max_run);
}

} // namespace dna