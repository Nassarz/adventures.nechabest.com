'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUpload from '@/components/admin/ImageUpload';

interface Blog {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime: string;
  avatar?: string;
  createdByEmail?: string;
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Blog>({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Sustainability',
    image: '',
    readTime: '5 min',
  });

  const categories = ['Sustainability', 'Travel Guide', 'Conservation', 'Eco-Living', 'Culture', 'Photography'];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const blogsData = (await res.json()) as Blog[];
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (!res.ok) throw new Error('Failed to update blog');
      } else {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create blog');
      }
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Sustainability',
        image: '',
        readTime: '5 min',
      });
      setEditingId(null);
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        const res = await fetch(`/api/admin/blogs?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete blog');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData(blog);
    setEditingId(blog.id || null);
    setIsModalOpen(true);
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader 
        title="Blogs Management" 
        subtitle="Create, edit and manage all blog posts"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:w-auto">
              <Search size={18} className="text-black/50" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData({
                  title: '',
                  excerpt: '',
                  content: '',
                  author: '',
                  date: new Date().toISOString().split('T')[0],
                  category: 'Sustainability',
                  image: '',
                  readTime: '5 min',
                });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-nature text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add New Blog
            </motion.button>
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredBlogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Author</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => (
                      <tr key={blog.id} className="border-b border-black/5 hover:bg-black/2 transition-all">
                        <td className="px-6 py-4 text-black font-medium">{blog.title}</td>
                        <td className="px-6 py-4 text-black/60">
                          <div className="flex items-center gap-2">
                            <Image
                              src={blog.avatar || `https://picsum.photos/seed/${blog.author || 'author'}/100/100`}
                              alt={blog.author || 'Author'}
                              width={28}
                              height={28}
                              className="rounded-full object-cover"
                              referrerPolicy="no-referrer"
                              unoptimized
                            />
                            <div className="leading-tight">
                              <p>{blog.author}</p>
                              {blog.createdByEmail && (
                                <p className="text-[11px] text-black/40">{blog.createdByEmail}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-nature/20 text-nature px-3 py-1 rounded-full text-sm font-medium">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-black/60">{blog.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleEdit(blog)}
                              className="p-2 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(blog.id || '')}
                              className="p-2 hover:bg-red-500/20 text-red-600 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-black/60">No blogs found</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">
                  {editingId ? 'Edit Blog' : 'Add New Blog'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-black font-bold mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Blog title"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Leave blank to use uploader account"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description"
                    rows={2}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Full blog content"
                    rows={4}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-end">
                    <ImageUpload
                      label="Cover Image"
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      placeholder="Upload blog cover image to ImgBB"
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Read Time</label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="e.g., 5 min"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-nature text-black font-bold py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingId ? 'Update Blog' : 'Create Blog'}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(false)}
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
