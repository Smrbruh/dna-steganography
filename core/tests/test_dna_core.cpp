#include <gtest/gtest.h>
#include "dna_encoder.h"
#include "reed_solomon.h"
#include "dna_compressor.h"
#include "dna_stats.h"
using namespace dna;
TEST(DnaEncoderTest, EncodeSingleByte) {
    std::vector<uint8_t> data = {0b00011011};
    auto result = DnaEncoder::encode(data);
    EXPECT_EQ(result, "ACGT");
}
TEST(DnaEncoderTest, EncodeAllZeros) {
    std::vector<uint8_t> data = {0x00};
    EXPECT_EQ(DnaEncoder::encode(data), "AAAA");
}
TEST(DnaEncoderTest, EncodeAllOnes) {
    std::vector<uint8_t> data = {0xFF};
    EXPECT_EQ(DnaEncoder::encode(data), "TTTT");
}
TEST(DnaEncoderTest, RoundTrip) {
    std::vector<uint8_t> original = {0x48, 0x65, 0x6C, 0x6C, 0x6F};
    auto encoded = DnaEncoder::encode(original);
    auto decoded = DnaEncoder::decode(encoded);
    EXPECT_EQ(decoded, original);
}
TEST(DnaEncoderTest, RoundTripLarge) {
    std::vector<uint8_t> original(10000);
    for (size_t i = 0; i < original.size(); ++i) {
        original[i] = static_cast<uint8_t>(i % 256);
    }
    auto encoded = DnaEncoder::encode(original);
    auto decoded = DnaEncoder::decode(encoded);
    EXPECT_EQ(decoded, original);
}
TEST(DnaEncoderTest, DecodeInvalidBase) {
    EXPECT_THROW(DnaEncoder::decode("ACGX"), DnaEncodeError);
}
TEST(DnaEncoderTest, DecodeWrongLength) {
    EXPECT_THROW(DnaEncoder::decode("ACG"), DnaEncodeError);
}
TEST(DnaEncoderTest, ValidateValid) {
    EXPECT_TRUE(DnaEncoder::validate("ACGT"));
    EXPECT_TRUE(DnaEncoder::validate("AAAA"));
    EXPECT_TRUE(DnaEncoder::validate(""));
}
TEST(DnaEncoderTest, ValidateInvalid) {
    EXPECT_FALSE(DnaEncoder::validate("ACGX"));
    EXPECT_FALSE(DnaEncoder::validate("acgt"));
    EXPECT_FALSE(DnaEncoder::validate("ACGU"));
}
TEST(ReedSolomonTest, AddAndRemoveParity) {
    std::vector<uint8_t> data = {0x01, 0x02, 0x03, 0x04};
    auto dna = DnaEncoder::encode(data);
    auto with_parity = ReedSolomon::add_parity(dna, 2);
    auto recovered_dna = ReedSolomon::remove_parity(with_parity);
    EXPECT_EQ(recovered_dna, dna);
}
TEST(ReedSolomonTest, VerifyValid) {
    std::vector<uint8_t> data = {0x10, 0x20, 0x30};
    auto dna = DnaEncoder::encode(data);
    auto with_parity = ReedSolomon::add_parity(dna, 3);
    EXPECT_TRUE(ReedSolomon::verify(with_parity));
}
TEST(ReedSolomonTest, InvalidLevelLow) {
    std::vector<uint8_t> data = {0x01};
    auto dna = DnaEncoder::encode(data);
    EXPECT_THROW(ReedSolomon::add_parity(dna, 0), ReedSolomonError);
}
TEST(ReedSolomonTest, InvalidLevelHigh) {
    std::vector<uint8_t> data = {0x01};
    auto dna = DnaEncoder::encode(data);
    EXPECT_THROW(ReedSolomon::add_parity(dna, 9), ReedSolomonError);
}
TEST(DnaCompressorTest, CompressDecompress) {
    std::vector<uint8_t> data = {1, 2, 3, 4, 5, 6, 7, 8};
    auto compressed = DnaCompressor::compress(data);
    auto decompressed = DnaCompressor::decompress(compressed);
    EXPECT_EQ(decompressed, data);
}
TEST(DnaCompressorTest, CompressRepetitive) {
    std::vector<uint8_t> data(10000, 0xAB);
    auto compressed = DnaCompressor::compress(data);
    EXPECT_LT(compressed.size(), data.size());
    auto decompressed = DnaCompressor::decompress(compressed);
    EXPECT_EQ(decompressed, data);
}
TEST(DnaCompressorTest, EmptyData) {
    std::vector<uint8_t> data;
    auto compressed = DnaCompressor::compress(data);
    auto decompressed = DnaCompressor::decompress(compressed);
    EXPECT_EQ(decompressed, data);
}
TEST(DnaCompressorTest, InvalidMagic) {
    std::vector<uint8_t> bad = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAA};
    EXPECT_THROW(DnaCompressor::decompress(bad), DnaCompressError);
}
TEST(DnaStatsTest, GcContent) {
    EXPECT_DOUBLE_EQ(DnaStats::gc_content("GCGC"), 1.0);
    EXPECT_DOUBLE_EQ(DnaStats::gc_content("ATAT"), 0.0);
    EXPECT_DOUBLE_EQ(DnaStats::gc_content("ACGT"), 0.5);
}
TEST(DnaStatsTest, GcContentEmpty) {
    EXPECT_DOUBLE_EQ(DnaStats::gc_content(""), 0.0);
}
TEST(DnaStatsTest, Length) {
    EXPECT_EQ(DnaStats::length("ACGT"), 4u);
    EXPECT_EQ(DnaStats::length(""), 0u);
}
TEST(DnaStatsTest, BaseCount) {
    auto counts = DnaStats::base_count("AACGTT");
    EXPECT_EQ(counts['A'], 2);
    EXPECT_EQ(counts['C'], 1);
    EXPECT_EQ(counts['G'], 1);
    EXPECT_EQ(counts['T'], 2);
}
TEST(DnaStatsTest, ShannonEntropy) {
    double entropy = DnaStats::shannon_entropy("ACGT");
    EXPECT_NEAR(entropy, 2.0, 1e-9);
    double zero_entropy = DnaStats::shannon_entropy("AAAA");
    EXPECT_NEAR(zero_entropy, 0.0, 1e-9);
}
TEST(DnaStatsTest, HomopolymerRun) {
    EXPECT_DOUBLE_EQ(DnaStats::homopolymer_run_max("AAACGT"), 3.0);
    EXPECT_DOUBLE_EQ(DnaStats::homopolymer_run_max("ACGT"), 1.0);
}
TEST(DnaStatsTest, InvalidBase) {
    EXPECT_THROW(DnaStats::gc_content("ACGX"), DnaStatsError);
    EXPECT_THROW(DnaStats::base_count("ACGx"), DnaStatsError);
}
TEST(IntegrationTest, FullPipeline) {
    std::string message = "Hello, DNA Steganography!";
    std::vector<uint8_t> raw(message.begin(), message.end());
    auto compressed = DnaCompressor::compress(raw);
    auto dna = DnaEncoder::encode(compressed);
    EXPECT_TRUE(DnaEncoder::validate(dna));
    auto with_parity = ReedSolomon::add_parity(dna, 2);
    EXPECT_TRUE(ReedSolomon::verify(with_parity));
    double gc = DnaStats::gc_content(with_parity);
    EXPECT_GE(gc, 0.0);
    EXPECT_LE(gc, 1.0);
    auto recovered_dna = ReedSolomon::remove_parity(with_parity);
    auto recovered_bytes = DnaEncoder::decode(recovered_dna);
    auto recovered_data = DnaCompressor::decompress(recovered_bytes);
    std::string recovered_message(recovered_data.begin(), recovered_data.end());
    EXPECT_EQ(recovered_message, message);
}
int main(int argc, char** argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}