'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface Tour {
  id?: string;
  title: string;
  location: string;
  duration: string;
  group: string;
  price: string;
  image: string;
  highlights: string[];
  rating: number;
  reviews: number;
  showOnHome?: boolean;
  description?: string;
}

const emptyTourForm: Tour = {
  title: '',
  location: '',
  duration: '',
  group: '',
  price: '',
  image: '',
  highlights: [],
  rating: 4.8,
  reviews: 0,
  showOnHome: false,
  description: '',
};

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Tour>(emptyTourForm);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tours', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch tours');
      const toursData = (await res.json()) as Tour[];
      setTours(toursData);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Tour = {
        title: formData.title,
        location: formData.location,
        duration: formData.duration,
        group: formData.group,
        price: formData.price,
        image: formData.image,
        highlights: formData.highlights,
        rating: formData.rating,
        reviews: formData.reviews,
        showOnHome: formData.showOnHome,
        description: formData.description,
      };

      if (editingId) {
        const res = await fetch('/api/admin/tours', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Failed to update tour' }));
          throw new Error(data.error || 'Failed to update tour');
        }
      } else {
        const res = await fetch('/api/admin/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Failed to create tour' }));
          throw new Error(data.error || 'Failed to create tour');
        }
      }
      setFormData(emptyTourForm);
      setEditingId(null);
      setIsModalOpen(false);
      fetchTours();
    } catch (error) {
      console.error('Error saving tour:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tour?')) {
      try {
        const res = await fetch(`/api/admin/tours?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete tour');
        fetchTours();
      } catch (error) {
        console.error('Error deleting tour:', error);
      }
    }
  };

  const handleEdit = (tour: Tour) => {
    setFormData({
      title: tour.title || '',
      location: tour.location || '',
      duration: tour.duration || '',
      group: tour.group || '',
      price: tour.price || '',
      image: tour.image || '',
      highlights: Array.isArray(tour.highlights) ? tour.highlights : [],
      rating: Number.isFinite(tour.rating) ? tour.rating : 4.8,
      reviews: Number.isFinite(tour.reviews) ? tour.reviews : 0,
      showOnHome: Boolean(tour.showOnHome),
      description: tour.description || '',
    });
    setEditingId(tour.id || null);
    setIsModalOpen(true);
  };

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader 
        title="Tours Management" 
        subtitle="Create, edit and manage all eco-tours"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:w-auto">
              <Search size={18} className="text-black/50" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData(emptyTourForm);
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-nature text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add New Tour
            </motion.button>
          </div>

          {/* Tours Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredTours.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Tour Name</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Duration</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Placement</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Rating</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTours.map((tour) => (
                      <tr key={tour.id} className="border-b border-black/5 hover:bg-black/2 transition-all">
                        <td className="px-6 py-4 text-black font-medium">{tour.title}</td>
                        <td className="px-6 py-4 text-black/60">{tour.location}</td>
                        <td className="px-6 py-4 text-black/60">{tour.duration}</td>
                        <td className="px-6 py-4 text-black font-bold">{tour.price}</td>
                        <td className="px-6 py-4 text-black/60">
                          {tour.showOnHome ? 'Home + Eco' : 'Eco only'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-black">{tour.rating}</span>
                            <span className="text-black/40 text-sm">({tour.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleEdit(tour)}
                              className="p-2 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(tour.id || '')}
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
              <div className="p-8 text-center text-black/60">No tours found</div>
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
                  {editingId ? 'Edit Tour' : 'Add New Tour'}
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
                  <label className="block text-black font-bold mb-2">Tour Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Tour name"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., $500"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showOnHome)}
                      onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="text-black font-bold">Show this tour on Home page</p>
                      <p className="text-sm text-black/60">Unchecked tours appear only on the Eco-Tourism page.</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 5 Days"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Group Size</label>
                    <input
                      type="text"
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      placeholder="e.g., 8-12 People"
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tour description"
                    rows={3}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black font-bold mb-2">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    />
                  </div>
                  <div>
                    <label className="block text-black font-bold mb-2">Reviews</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) })}
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
                    {editingId ? 'Update Tour' : 'Create Tour'}
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
