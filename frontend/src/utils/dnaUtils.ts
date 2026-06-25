import { DNAStats, Nucleotide } from '../types'
const NUCLEOTIDES: Nucleotide[] = ['A', 'C', 'G', 'T']
const BYTE_TO_DNA: Record<number, Nucleotide[]> = {}
for (let i = 0; i < 256; i++) {
  const pair1 = Math.floor(i / 64) % 4
  const pair2 = Math.floor(i / 16) % 4
  const pair3 = Math.floor(i / 4) % 4
  const pair4 = i % 4
  BYTE_TO_DNA[i] = [
    NUCLEOTIDES[pair1],
    NUCLEOTIDES[pair2],
    NUCLEOTIDES[pair3],
    NUCLEOTIDES[pair4],
  ]
}
export const encodeFileToDNA = async (file: File): Promise<DNAStats> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(buffer)
      const dnaChunks: Nucleotide[] = []
      bytes.forEach((byte) => {
        dnaChunks.push(...BYTE_TO_DNA[byte])
      })
      const sequence = dnaChunks.join('')
      const distribution = { A: 0, C: 0, G: 0, T: 0 }
      for (const nuc of sequence) {
        distribution[nuc as Nucleotide]++
      }
      const gcCount = distribution.G + distribution.C
      const gcContent = sequence.length > 0 ? (gcCount / sequence.length) * 100 : 0
      resolve({
        fileName: file.name,
        fileSize: file.size,
        dnaLength: sequence.length,
        gcContent: parseFloat(gcContent.toFixed(2)),
        distribution,
        sequence,
        timestamp: new Date(),
      })
    }
    reader.readAsArrayBuffer(file)
  })
}
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
export const generateReportContent = (stats: DNAStats): string => {
  const lines = [
    'DNA Steganography Report',
    '='.repeat(40),
    `File: ${stats.fileName}`,
    `Size: ${formatFileSize(stats.fileSize)} (${stats.fileSize} bytes)`,
    `DNA Length: ${stats.dnaLength} nucleotides`,
    `GC Content: ${stats.gcContent}%`,
    `AT Content: ${(100 - stats.gcContent).toFixed(2)}%`,
    '',
    'Nucleotide Distribution:',
    '-'.repeat(40),
    `A (Adenine):  ${stats.distribution.A} (${((stats.distribution.A / stats.dnaLength) * 100).toFixed(2)}%)`,
    `C (Cytosine): ${stats.distribution.C} (${((stats.distribution.C / stats.dnaLength) * 100).toFixed(2)}%)`,
    `G (Guanine):  ${stats.distribution.G} (${((stats.distribution.G / stats.dnaLength) * 100).toFixed(2)}%)`,
    `T (Thymine):  ${stats.distribution.T} (${((stats.distribution.T / stats.dnaLength) * 100).toFixed(2)}%)`,
    '',
    `Encoded: ${stats.timestamp.toISOString()}`,
    '',
    'DNA Sequence (first 500 nucleotides):',
    '-'.repeat(40),
    stats.sequence.slice(0, 500),
    stats.sequence.length > 500 ? `... [${stats.sequence.length - 500} more nucleotides]` : '',
  ]
  return lines.join('\n')
}