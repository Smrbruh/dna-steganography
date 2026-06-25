import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Dna, Download, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import DNAVisualizer from './components/DNAVisualizer'
import Stats from './components/Stats'
import History from './components/History'
import { DNAStats, AppStatus, HistoryEntry } from './types'
import { encodeFileToDNA, generateReportContent } from './utils/dnaUtils'
export default function App() {
  const [status, setStatus] = useState<AppStatus>('idle')
  const [stats, setStats] = useState<DNAStats | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processFile = useCallback(async (file: File) => {
    setStatus('encoding')
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90))
    }, 120)
    try {
      const result = await encodeFileToDNA(file)
      clearInterval(interval)
      setProgress(100)
      setStats(result)
      setStatus('done')
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          fileName: result.fileName,
          fileSize: result.fileSize,
          dnaLength: result.dnaLength,
          gcContent: result.gcContent,
          timestamp: result.timestamp,
          sequence: result.sequence,
        },
        ...prev.slice(0, 19),
      ])
    } catch {
      clearInterval(interval)
      setStatus('error')
    }
  }, [])
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = () => setIsDragging(false)
  const handleDownload = () => {
    if (!stats) return
    const content = generateReportContent(stats)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dna_report_${stats.fileName.replace(/\.[^.]+$/, '')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleDecode = () => {
    if (!stats) return
    const blob = new Blob([`DNA Sequence decoded from: ${stats.fileName}\n${stats.sequence}`], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decoded_${stats.fileName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleRepeat = (entry: HistoryEntry) => {
    const mockStats: DNAStats = {
      fileName: entry.fileName,
      fileSize: entry.fileSize,
      dnaLength: entry.dnaLength,
      gcContent: entry.gcContent,
      distribution: { A: 0, C: 0, G: 0, T: 0 },
      sequence: entry.sequence,
      timestamp: new Date(),
    }
    for (const nuc of entry.sequence) {
      if (nuc in mockStats.distribution) {
        mockStats.distribution[nuc as keyof typeof mockStats.distribution]++
      }
    }
    setStats(mockStats)
    setStatus('done')
  }
  const statusConfig = {
    idle: { label: 'Ожидание файла', color: 'text-gray-500', icon: null },
    encoding: {
      label: 'Кодирование...',
      color: 'text-accent',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    done: {
      label: 'Готово',
      color: 'text-green-400',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    error: {
      label: 'Ошибка кодирования',
      color: 'text-red-400',
      icon: <XCircle className="w-4 h-4" />,
    },
  }
  const current = statusConfig[status]
  return (
    <div className="min-h-screen bg-bg text-gray-100 font-sans flex flex-col">
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Dna className="w-6 h-6 text-accent" />
              <div className="absolute inset-0 blur-sm">
                <Dna className="w-6 h-6 text-accent opacity-50" />
              </div>
            </div>
            <span className="font-mono font-bold text-base tracking-tight">
              <span className="text-accent">DNA</span>
              <span className="text-gray-300">·Steganography</span>
            </span>
          </div>
          <div className={`flex items-center gap-2 text-sm font-mono ${current.color}`}>
            {current.icon}
            <span>{current.label}</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <motion.div
              onClick={() => !stats && fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              animate={{ borderColor: isDragging ? '#00d4ff' : '#1e3a5f' }}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[140px] ${
                isDragging ? 'bg-accent/5' : 'bg-card/40 hover:bg-card/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept="*/*"
              />
              <motion.div
                animate={{ scale: isDragging ? 1.2 : 1 }}
                className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center"
              >
                <Upload className="w-5 h-5 text-accent" />
              </motion.div>
              <div className="text-center">
                <p className="text-gray-300 text-sm font-medium">
                  {isDragging ? 'Отпустите файл' : 'Перетащите файл или нажмите для выбора'}
                </p>
                <p className="text-gray-600 text-xs font-mono mt-1">Любой формат · Любой размер</p>
              </div>
            </motion.div>
            {status === 'encoding' && (
              <div className="w-full bg-border/30 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg font-mono text-sm font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                <Dna className="w-4 h-4" />
                Синтезировать ДНК
              </motion.button>
              <motion.button
                whileHover={{ scale: stats ? 1.02 : 1 }}
                whileTap={{ scale: stats ? 0.98 : 1 }}
                onClick={handleDecode}
                disabled={!stats}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border font-mono text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Декодировать
              </motion.button>
              <motion.button
                whileHover={{ scale: stats ? 1.02 : 1 }}
                whileTap={{ scale: stats ? 0.98 : 1 }}
                onClick={handleDownload}
                disabled={!stats}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border font-mono text-sm font-medium hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Скачать отчёт
              </motion.button>
            </div>
            <div className="flex-1 rounded-xl border border-border/60 bg-card/30 overflow-hidden" style={{ minHeight: '420px', height: '420px' }}>
              <DNAVisualizer stats={stats} isAnimating={status !== 'idle'} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {stats ? (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card/50 border border-border/60 rounded-xl p-5 h-full"
                >
                  <Stats stats={stats} />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-card/20 border border-border/30 rounded-xl p-5 flex flex-col items-center justify-center min-h-[300px] gap-3"
                >
                  <div className="w-16 h-16 rounded-full border border-border/50 flex items-center justify-center">
                    <Dna className="w-7 h-7 text-border" strokeWidth={1} />
                  </div>
                  <p className="text-gray-600 font-mono text-sm text-center">
                    Статистика появится<br />после кодирования
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/30 border border-border/50 rounded-xl overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-gray-300">Последовательность ДНК</span>
                <span className="text-xs font-mono text-gray-600">первые 200 нуклеотидов</span>
              </div>
            </div>
            <div className="p-4 overflow-x-auto">
              <p className="font-mono text-xs leading-6 tracking-wider break-all">
                {stats.sequence.slice(0, 200).split('').map((n, i) => {
                  const colors: Record<string, string> = {
                    A: 'text-red-400',
                    C: 'text-green-400',
                    G: 'text-blue-400',
                    T: 'text-yellow-400',
                  }
                  return (
                    <span key={i} className={colors[n] ?? 'text-gray-400'}>
                      {n}
                    </span>
                  )
                })}
                {stats.sequence.length > 200 && (
                  <span className="text-gray-600">…+{stats.sequence.length - 200}</span>
                )}
              </p>
            </div>
          </motion.div>
        )}
        <div className="bg-card/30 border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-card/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-gray-300">История кодирований</span>
              {history.length > 0 && (
                <span className="text-xs font-mono bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5">
                  {history.length}
                </span>
              )}
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-border/40"
              >
                <div className="p-4">
                  <History history={history} onRepeat={handleRepeat} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="border-t border-border/40 py-4 px-6 text-center">
        <p className="text-gray-700 font-mono text-xs">
          DNA Steganography · Кодирование данных в нуклеотидные последовательности
        </p>
      </footer>
    </div>
  )
}