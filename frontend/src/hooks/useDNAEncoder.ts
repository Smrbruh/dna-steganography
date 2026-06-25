import { useState } from 'react';
export const useDNAEncoder = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const encode = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/encode', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setResult(data.dna);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  return { encode, loading, result };
};