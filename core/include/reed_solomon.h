#pragma once
#include <string>
#include <vector>
#include <cstdint>
#include <stdexcept>
namespace dna {
class ReedSolomon {
public:
    static std::string add_parity(const std::string& data, int level);
    static std::string remove_parity(const std::string& data);
    static bool verify(const std::string& data);
    static constexpr int MAX_LEVEL = 8;
    static constexpr int MIN_LEVEL = 1;
private:
    static constexpr uint8_t GF_SIZE = 255;
    static constexpr uint8_t GF_POLY = 0x1D;
    static uint8_t gf_mul(uint8_t a, uint8_t b);
    static uint8_t gf_pow(uint8_t x, int power);
    static std::vector<uint8_t> compute_syndromes(const std::vector<uint8_t>& data, int nsym);
    static std::vector<uint8_t> rs_generate_poly(int nsym);
    static std::vector<uint8_t> gf_poly_mul(const std::vector<uint8_t>& p, const std::vector<uint8_t>& q);
    static std::vector<uint8_t> rs_encode_msg(const std::vector<uint8_t>& msg, int nsym);
    static uint8_t GF_EXP[512];
    static uint8_t GF_LOG[256];
    static bool tables_initialized;
    static void init_tables();
};
class ReedSolomonError : public std::runtime_error {
public:
    explicit ReedSolomonError(const std::string& msg) : std::runtime_error(msg) {}
};
}