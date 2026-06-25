import { motion, AnimatePresence } from 'framer-motion'
import { HistoryEntry } from '../types'
import { formatFileSize } from '../utils/dnaUtils'
import { RotateCcw, Clock, Dna } from 'lucide-react'
interface Props {
  history: HistoryEntry[]
  onRepeat: (entry: HistoryEntry) => void
}
const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
}
export default function History({ history, onRepeat }: Props) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-3"
      >
        <Clock className="w-10 h-10 text-border" strokeWidth={1} />
        <p className="text-gray-600 font-mono text-sm">История пуста</p>
        <p className="text-gray-700 font-mono text-xs">Закодированные файлы появятся здесь</p>
      </motion.div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase tracking-widest font-medium">
              Дата
            </th>
            <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase tracking-widest font-medium">
              Файл
            </th>
            <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase tracking-widest font-medium">
              Размер
            </th>
            <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase tracking-widest font-medium">
              <Dna className="w-3.5 h-3.5 inline mr-1" />
              Длина
            </th>
            <th className="text-left py-3 px-3 text-gray-500 text-xs uppercase tracking-widest font-medium">
              GC%
            </th>
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {history.map((entry, i) => (
              <motion.tr
                key={entry.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="border-b border-border/40 hover:bg-card/50 transition-colors group"
              >
                <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(entry.timestamp)}
                </td>
                <td className="py-3 px-3 text-gray-300 max-w-[160px]">
                  <span className="truncate block" title={entry.fileName}>
                    {entry.fileName.length > 20
                      ? entry.fileName.slice(0, 18) + '…'
                      : entry.fileName}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                  {formatFileSize(entry.fileSize)}
                </td>
                <td className="py-3 px-3 text-accent whitespace-nowrap">
                  {entry.dnaLength.toLocaleString()} нт
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor:
                        entry.gcContent > 60
                          ? '#3b82f620'
                          : entry.gcContent < 40
                          ? '#ef444420'
                          : '#22c55e20',
                      color:
                        entry.gcContent > 60
                          ? '#3b82f6'
                          : entry.gcContent < 40
                          ? '#ef4444'
                          : '#22c55e',
                    }}
                  >
                    {entry.gcContent}%
                  </span>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => onRepeat(entry)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-accent/70 hover:text-accent border border-accent/20 hover:border-accent/50 rounded-md px-2 py-1 bg-accent/5 hover:bg-accent/10"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Повторить
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}