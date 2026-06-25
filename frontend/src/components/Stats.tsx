import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DNAStats } from '../types'
import { formatFileSize } from '../utils/dnaUtils'
interface Props {
  stats: DNAStats
}
const COLORS: Record<string, string> = {
  A: '#ef4444',
  C: '#22c55e',
  G: '#3b82f6',
  T: '#eab308',
}
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}
const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
}
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { pct: string } }>
}
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p style={{ color: COLORS[item.name] }} className="font-semibold">
        {item.name} — {item.value.toLocaleString()}
      </p>
      <p className="text-gray-400">{item.payload.pct}% от общего</p>
    </div>
  )
}
interface StatRowProps {
  label: string
  value: string
  accent?: boolean
}
const StatRow = ({ label, value, accent }: StatRowProps) => (
  <motion.div variants={itemVariants} className="flex justify-between items-center py-2 border-b border-border/50">
    <span className="text-gray-500 text-sm font-mono">{label}</span>
    <span className={`text-sm font-mono font-semibold ${accent ? 'text-accent' : 'text-gray-200'}`}>
      {value}
    </span>
  </motion.div>
)
export default function Stats({ stats }: Props) {
  const total = stats.dnaLength
  const chartData = (['A', 'C', 'G', 'T'] as const).map((nuc) => ({
    name: nuc,
    value: stats.distribution[nuc],
    pct: total > 0 ? ((stats.distribution[nuc] / total) * 100).toFixed(1) : '0.0',
  }))
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col gap-4"
    >
      <motion.h2 variants={itemVariants} className="text-accent font-mono text-sm font-semibold tracking-widest uppercase">
        Статистика
      </motion.h2>
      <div className="flex flex-col gap-0">
        <StatRow label="Файл" value={stats.fileName.length > 22 ? stats.fileName.slice(0, 20) + '…' : stats.fileName} />
        <StatRow label="Размер" value={formatFileSize(stats.fileSize)} />
        <StatRow label="Байт" value={stats.fileSize.toLocaleString()} />
        <StatRow label="Длина ДНК" value={`${stats.dnaLength.toLocaleString()} нт`} accent />
        <StatRow label="GC-состав" value={`${stats.gcContent}%`} accent />
        <StatRow label="AT-состав" value={`${(100 - stats.gcContent).toFixed(2)}%`} />
      </div>
      <motion.div variants={itemVariants} className="flex-1 min-h-[200px]">
        <p className="text-gray-500 text-xs font-mono mb-2 tracking-widest uppercase">
          Распределение нуклеотидов
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationBegin={200}
              animationDuration={900}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name]}
                  stroke="transparent"
                  style={{ filter: `drop-shadow(0 0 6px ${COLORS[entry.name]}88)` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs font-mono text-gray-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
        {chartData.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-2 bg-card/50 rounded-lg p-2 border border-border/50"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: COLORS[d.name],
                boxShadow: `0 0 8px ${COLORS[d.name]}`,
              }}
            />
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold" style={{ color: COLORS[d.name] }}>
                {d.name}
              </p>
              <p className="text-gray-500 text-xs font-mono">{d.pct}%</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}