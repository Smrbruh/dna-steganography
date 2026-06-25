#include "reed_solomon.h"
#include <algorithm>
#include <numeric>
namespace dna {
uint8_t ReedSolomon::GF_EXP[512] = {};
uint8_t ReedSolomon::GF_LOG[256] = {};
bool ReedSolomon::tables_initialized = false;
void ReedSolomon::init_tables() {
    if (tables_initialized) return;
    uint8_t x = 1;
    for (int i = 0; i < 255; ++i) {
        GF_EXP[i] = x;
        GF_LOG[x] = static_cast<uint8_t>(i);
        x = static_cast<uint8_t>((x << 1) ^ ((x & 0x80) ? GF_POLY : 0));
    }
    for (int i = 255; i < 512; ++i) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
    tables_initialized = true;
}
uint8_t ReedSolomon::gf_mul(uint8_t a, uint8_t b) {
    init_tables();
    if (a == 0 || b == 0) return 0;
    return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}
uint8_t ReedSolomon::gf_pow(uint8_t x, int power) {
    init_tables();
    return GF_EXP[(GF_LOG[x] * power) % 255];
}
std::vector<uint8_t> ReedSolomon::gf_poly_mul(const std::vector<uint8_t>& p, const std::vector<uint8_t>& q) {
    std::vector<uint8_t> result(p.size() + q.size() - 1, 0);
    for (size_t i = 0; i < p.size(); ++i) {
        for (size_t j = 0; j < q.size(); ++j) {
            result[i + j] ^= gf_mul(p[i], q[j]);
        }
    }
    return result;
}
std::vector<uint8_t> ReedSolomon::rs_generate_poly(int nsym) {
    std::vector<uint8_t> g = {1};
    for (int i = 0; i < nsym; ++i) {
        g = gf_poly_mul(g, {1, gf_pow(2, i)});
    }
    return g;
}
std::vector<uint8_t> ReedSolomon::rs_encode_msg(const std::vector<uint8_t>& msg, int nsym) {
    if (static_cast<int>(msg.size()) + nsym > 255) {
        throw ReedSolomonError("Message too long for RS encoding");
    }
    auto gen = rs_generate_poly(nsym);
    std::vector<uint8_t> msg_out(msg.size() + nsym, 0);
    std::copy(msg.begin(), msg.end(), msg_out.begin());
    for (size_t i = 0; i < msg.size(); ++i) {
        uint8_t coef = msg_out[i];
        if (coef == 0) continue;
        for (size_t j = 1; j < gen.size(); ++j) {
            msg_out[i + j] ^= gf_mul(gen[j], coef);
        }
    }
    std::copy(msg.begin(), msg.end(), msg_out.begin());
    return msg_out;
}
std::vector<uint8_t> ReedSolomon::compute_syndromes(const std::vector<uint8_t>& data, int nsym) {
    init_tables();
    std::vector<uint8_t> synd(nsym, 0);
    for (int i = 0; i < nsym; ++i) {
        uint8_t val = 0;
        for (const uint8_t byte : data) {
            val = gf_mul(val, gf_pow(2, i)) ^ byte;
        }
        synd[i] = val;
    }
    return synd;
}
static std::string bytes_to_dna(const std::vector<uint8_t>& bytes) {
    static const char B[4] = {'A','C','G','T'};
    std::string out;
    out.reserve(bytes.size() * 4);
    for (uint8_t b : bytes) {
        out += B[(b >> 6) & 3];
        out += B[(b >> 4) & 3];
        out += B[(b >> 2) & 3];
        out += B[(b >> 0) & 3];
    }
    return out;
}
static std::vector<uint8_t> dna_to_bytes(const std::string& s) {
    auto base2bits = [](char c) -> uint8_t {
        switch(c) {
            case 'A': return 0;
            case 'C': return 1;
            case 'G': return 2;
            case 'T': return 3;
            default: throw dna::ReedSolomonError(std::string("Invalid base: ") + c);
        }
    };
    if (s.size() % 4 != 0) throw dna::ReedSolomonError("DNA length not multiple of 4");
    std::vector<uint8_t> out;
    out.reserve(s.size() / 4);
    for (size_t i = 0; i < s.size(); i += 4) {
        uint8_t b = 0;
        b |= base2bits(s[i])     << 6;
        b |= base2bits(s[i+1])   << 4;
        b |= base2bits(s[i+2])   << 2;
        b |= base2bits(s[i+3])   << 0;
        out.push_back(b);
    }
    return out;
}
std::string ReedSolomon::add_parity(const std::string& data, int level) {
    if (level < MIN_LEVEL || level > MAX_LEVEL) {
        throw ReedSolomonError("Parity level must be between 1 and 8");
    }
    auto bytes = dna_to_bytes(data);
    const int nsym = level * 2;
    const size_t chunk_size = 200;
    std::vector<uint8_t> encoded_all;
    encoded_all.reserve(bytes.size() + (bytes.size() / chunk_size + 1) * nsym + 4);
    uint32_t orig_len = static_cast<uint32_t>(bytes.size());
    encoded_all.push_back(static_cast<uint8_t>((orig_len >> 24) & 0xFF));
    encoded_all.push_back(static_cast<uint8_t>((orig_len >> 16) & 0xFF));
    encoded_all.push_back(static_cast<uint8_t>((orig_len >>  8) & 0xFF));
    encoded_all.push_back(static_cast<uint8_t>((orig_len >>  0) & 0xFF));
    encoded_all.push_back(static_cast<uint8_t>(level));
    for (size_t offset = 0; offset < bytes.size(); offset += chunk_size) {
        size_t end = std::min(offset + chunk_size, bytes.size());
        std::vector<uint8_t> chunk(bytes.begin() + offset, bytes.begin() + end);
        auto encoded = rs_encode_msg(chunk, nsym);
        encoded_all.insert(encoded_all.end(), encoded.begin(), encoded.end());
    }
    return bytes_to_dna(encoded_all);
}
std::string ReedSolomon::remove_parity(const std::string& data) {
    auto bytes = dna_to_bytes(data);
    if (bytes.size() < 5) throw ReedSolomonError("Data too short");
    uint32_t orig_len = (static_cast<uint32_t>(bytes[0]) << 24) |
                        (static_cast<uint32_t>(bytes[1]) << 16) |
                        (static_cast<uint32_t>(bytes[2]) <<  8) |
                        (static_cast<uint32_t>(bytes[3]) <<  0);
    int level = static_cast<int>(bytes[4]);
    const int nsym = level * 2;
    const size_t chunk_size = 200;
    const size_t encoded_chunk_size = chunk_size + nsym;
    std::vector<uint8_t> payload(bytes.begin() + 5, bytes.end());
    std::vector<uint8_t> result;
    result.reserve(orig_len);
    for (size_t offset = 0; offset < payload.size(); offset += encoded_chunk_size) {
        size_t end = std::min(offset + encoded_chunk_size, payload.size());
        for (size_t i = offset; i < end - nsym; ++i) {
            result.push_back(payload[i]);
        }
    }
    result.resize(orig_len);
    return bytes_to_dna(result);
}
bool ReedSolomon::verify(const std::string& data) {
    try {
        auto bytes = dna_to_bytes(data);
        if (bytes.size() < 5) return false;
        int level = static_cast<int>(bytes[4]);
        if (level < MIN_LEVEL || level > MAX_LEVEL) return false;
        const int nsym = level * 2;
        const size_t chunk_size = 200;
        const size_t encoded_chunk_size = chunk_size + nsym;
        std::vector<uint8_t> payload(bytes.begin() + 5, bytes.end());
        for (size_t offset = 0; offset < payload.size(); offset += encoded_chunk_size) {
            size_t end = std::min(offset + encoded_chunk_size, payload.size());
            std::vector<uint8_t> chunk(payload.begin() + offset, payload.begin() + end);
            auto synd = compute_syndromes(chunk, nsym);
            for (auto s : synd) {
                if (s != 0) return false;
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}
}