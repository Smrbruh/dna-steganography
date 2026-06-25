export type Nucleotide = 'A' | 'C' | 'G' | 'T'
export type AppStatus = 'idle' | 'encoding' | 'done' | 'error'
export interface DNAStats {
  fileName: string
  fileSize: number
  dnaLength: number
  gcContent: number
  distribution: Record<Nucleotide, number>
  sequence: string
  timestamp: Date
}
export interface HistoryEntry {
  id: string
  fileName: string
  fileSize: number
  dnaLength: number
  gcContent: number
  timestamp: Date
  sequence: string
}
export interface EncodeResponse {
  jobId: string
  status: AppStatus
  dnaStats?: DNAStats
}
export interface StatusResponse {
  jobId: string
  status: AppStatus
  progress?: number
  dnaStats?: DNAStats
  error?: string
}
export interface NucleotideColors {
  A: string
  C: string
  G: string
  T: string
}