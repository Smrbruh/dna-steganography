import React from 'react';
interface StatusBadgeProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    idle: 'bg-gray-600',
    processing: 'bg-yellow-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };
  const labels = {
    idle: 'Ожидание',
    processing: 'Обработка...',
    completed: 'Готово',
    error: 'Ошибка'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};