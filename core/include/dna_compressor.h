#pragma once
#include <vector>
#include <cstdint>

namespace dna {

class DnaCompressor {
public:
    static std::vector<uint8_t> compress(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> decompress(const std::vector<uint8_t>& data);
};

} // namespace dna