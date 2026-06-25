#pragma once
#include <string>
#include <vector>
#include <stdexcept>
#include <cstdint>
namespace dna {
class DnaEncoder {
public:
    static std::string encode(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> decode(const std::string& dna);
    static bool validate(const std::string& dna);
private:
    static constexpr char BASE_TABLE[4] = {'A', 'C', 'G', 'T'};
    static uint8_t base_to_bits(char base);
};
class DnaEncodeError : public std::runtime_error {
public:
    explicit DnaEncodeError(const std::string& msg) : std::runtime_error(msg) {}
};
}