'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = 'Select or drag an image here',
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Using the local secure upload proxy API
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload image');
      }

      const resData = await response.json();
      if (resData.success && resData.url) {
        onChange(resData.url);
      } else {
        throw new Error(resData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong during upload');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-black font-bold mb-2">{label}</label>}

      {value ? (
        <div className="relative rounded-xl border border-black/10 overflow-hidden group bg-black/2 aspect-[16/9] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerInputClick}
              className="bg-white hover:bg-slate-100 text-black font-semibold text-xs px-3 py-2 rounded-lg transition-all shadow-md"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs p-2 rounded-lg transition-all shadow-md flex items-center gap-1"
            >
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 min-h-[140px] ${
            dragActive
              ? 'border-nature bg-nature/5 scale-101'
              : 'border-black/20 hover:border-nature hover:bg-black/1 bg-white'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-nature" />
              <p className="text-sm font-semibold text-black/60">Uploading to ImgBB...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-black/2 rounded-full text-black/50 group-hover:text-nature group-hover:bg-nature/10 transition-colors">
                <Upload size={24} />
              </div>
              <p className="text-sm font-semibold text-black">{placeholder}</p>
              <p className="text-xs text-black/40">PNG, JPG, JPEG, GIF up to 32MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
