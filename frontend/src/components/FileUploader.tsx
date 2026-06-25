import React from 'react';
interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}
export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };
  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition">
      <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-4xl mb-2">🧬</div>
        <div className="text-gray-400">Нажмите или перетащите файл</div>
        <div className="text-gray-500 text-sm">Любой формат до 100 МБ</div>
      </label>
    </div>
  );
};