'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Download, X } from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface MediaFile {
  id?: string;
  filename: string;
  url: string;
  uploadDate: string;
  size: string;
  type: string;
}

export default function AdminMedia() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFile, setNewFile] = useState({
    filename: '',
    url: '',
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch media');
      const mediaData = (await res.json()) as MediaFile[];
      setMedia(mediaData);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newFile.filename,
          url: newFile.url,
          size: '2.4 MB',
          type: 'Image',
        }),
      });
      if (!res.ok) throw new Error('Failed to upload media');
      setNewFile({ filename: '', url: '' });
      setShowUploadModal(false);
      fetchMedia();
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media?')) {
      try {
        const res = await fetch(`/api/admin/media?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete media');
        fetchMedia();
      } catch (error) {
        console.error('Error deleting media:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <AdminHeader 
        title="Media Management" 
        subtitle="Upload and manage images and files"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="bg-nature text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Upload size={20} />
            Upload New Media
          </motion.button>

          {/* Media Grid */}
          <div className="bg-white rounded-xl border border-black/10 p-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {media.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative rounded-lg overflow-hidden bg-black/5"
                  >
                    {/* Image Preview */}
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.filename}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end p-3">
                      <div className="w-full">
                        <p className="text-white text-sm font-medium truncate">{item.filename}</p>
                        <p className="text-white/70 text-xs">{item.uploadDate}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-2 bg-blue-500 text-white rounded-lg"
                        title="Download"
                      >
                        <Download size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(item.id || '')}
                        className="p-2 bg-red-500 text-white rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-black/60">
                <p>No media files yet. Upload your first image!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Upload Media</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-black/10 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-black font-bold mb-2">Filename</label>
                  <input
                    type="text"
                    value={newFile.filename}
                    onChange={(e) => setNewFile({ ...newFile, filename: e.target.value })}
                    placeholder="e.g., eco-tourism-banner"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Image URL</label>
                  <input
                    type="url"
                    value={newFile.url}
                    onChange={(e) => setNewFile({ ...newFile, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    required
                  />
                </div>

                {/* URL Preview */}
                {newFile.url && (
                  <div className="mt-4">
                    <p className="text-black text-sm font-medium mb-2">Preview:</p>
                    <Image
                      src={newFile.url}
                      alt="Preview"
                      width={400}
                      height={192}
                      className="w-full h-auto rounded-lg max-h-48 object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    className="flex-1 bg-nature text-black font-bold py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    Upload
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-black/10 text-black font-bold py-2 rounded-lg hover:bg-black/20 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
