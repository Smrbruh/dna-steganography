#include "../include/dna_compressor.h"
#include <algorithm>
#include <vector>

namespace dna {

std::vector<uint8_t> DnaCompressor::compress(const std::vector<uint8_t>& data) {
    std::vector<uint8_t> result;
    result.reserve(data.size());
    for (size_t i = 0; i < data.size(); ) {
        size_t j = i + 1;
        while (j < data.size() && data[j] == data[i]) ++j;
        size_t run = j - i;
        if (run > 3) {
            result.push_back(0xFF);
            result.push_back(static_cast<uint8_t>(run));
            result.push_back(data[i]);
        } else {
            for (size_t k = i; k < j; ++k) result.push_back(data[k]);
        }
        i = j;
    }
    return result;
}

std::vector<uint8_t> DnaCompressor::decompress(const std::vector<uint8_t>& data) {
    std::vector<uint8_t> result;
    result.reserve(data.size() * 2);
    for (size_t i = 0; i < data.size(); ) {
        if (data[i] == 0xFF && i + 2 < data.size()) {
            size_t run = data[i+1];
            uint8_t value = data[i+2];
            for (size_t j = 0; j < run; ++j) result.push_back(value);
            i += 3;
        } else {
            result.push_back(data[i]);
            ++i;
        }
    }
    return result;
}

} // namespace dna