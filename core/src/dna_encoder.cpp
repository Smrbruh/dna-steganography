#include "dna_encoder.h"
#include <sstream>
namespace dna {
constexpr char DnaEncoder::BASE_TABLE[4];
std::string DnaEncoder::encode(const std::vector<uint8_t>& data) {
    std::string result;
    result.reserve(data.size() * 4);
    for (const uint8_t byte : data) {
        result += BASE_TABLE[(byte >> 6) & 0x03];
        result += BASE_TABLE[(byte >> 4) & 0x03];
        result += BASE_TABLE[(byte >> 2) & 0x03];
        result += BASE_TABLE[(byte >> 0) & 0x03];
    }
    return result;
}
uint8_t DnaEncoder::base_to_bits(char base) {
    switch (base) {
        case 'A': return 0x00;
        case 'C': return 0x01;
        case 'G': return 0x02;
        case 'T': return 0x03;
        default:
            throw DnaEncodeError(std::string("Invalid base character: '") + base + "'");
    }
}
std::vector<uint8_t> DnaEncoder::decode(const std::string& dna) {
    if (dna.size() % 4 != 0) {
        throw DnaEncodeError("DNA string length must be a multiple of 4, got: " + std::to_string(dna.size()));
    }
    std::vector<uint8_t> result;
    result.reserve(dna.size() / 4);
    for (size_t i = 0; i < dna.size(); i += 4) {
        uint8_t byte = 0;
        byte |= base_to_bits(dna[i])     << 6;
        byte |= base_to_bits(dna[i + 1]) << 4;
        byte |= base_to_bits(dna[i + 2]) << 2;
        byte |= base_to_bits(dna[i + 3]) << 0;
        result.push_back(byte);
    }
    return result;
}
bool DnaEncoder::validate(const std::string& dna) {
    for (const char c : dna) {
        if (c != 'A' && c != 'C' && c != 'G' && c != 'T') {
            return false;
        }
    }
    return true;
}
}