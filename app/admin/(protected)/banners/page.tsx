'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Megaphone, Eye, EyeOff, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import { WhatsAppLogoIcon } from '@/components/FloatingWhatsApp';

interface Banner {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaType: 'link' | 'whatsapp';
  ctaLink: string;
  whatsappMessage: string;
  showOnOpen: boolean;
  active: boolean;
  order: number;
  createdAt?: string;
}

const emptyBannerForm: Banner = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  ctaLabel: 'Book Now',
  ctaType: 'whatsapp',
  ctaLink: '',
  whatsappMessage: '',
  showOnOpen: true,
  active: true,
  order: 0,
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Banner>(emptyBannerForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch banners');
      const data = (await res.json()) as Banner[];
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      alert('Banner title and image are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = { ...formData };
      if (editingId) {
        const res = await fetch('/api/admin/banners', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Failed to update banner' }));
          throw new Error(data.error || 'Failed to update banner');
        }
      } else {
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Failed to create banner' }));
          throw new Error(data.error || 'Failed to create banner');
        }
      }
      setFormData(emptyBannerForm);
      setEditingId(null);
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert(error instanceof Error ? error.message : 'Failed to save banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        const res = await fetch(`/api/admin/banners?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete banner');
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image || '',
      ctaLabel: banner.ctaLabel || 'Learn More',
      ctaType: banner.ctaType || 'link',
      ctaLink: banner.ctaLink || '',
      whatsappMessage: banner.whatsappMessage || '',
      showOnOpen: Boolean(banner.showOnOpen),
      active: banner.active === undefined ? true : Boolean(banner.active),
      order: Number.isFinite(banner.order) ? banner.order : 0,
    });
    setEditingId(banner.id || null);
    setIsModalOpen(true);
  };

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader
        title="Banners & Campaigns"
        subtitle="Create campaign banners shown when visitors open the site"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:w-auto">
              <Search size={18} className="text-black/50" />
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData(emptyBannerForm);
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-nature text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add New Banner
            </motion.button>
          </div>

          <div className="rounded-xl border border-nature/30 bg-nature/5 px-4 py-3 text-nature text-sm font-medium flex items-start gap-2">
            <Megaphone size={18} className="shrink-0 mt-0.5" />
            <p>
              Banners marked <strong>&ldquo;Show on open&rdquo;</strong> appear automatically when visitors land on the
              site. Upload a poster image via the image host (ImgBB) and pair it with a WhatsApp booking button so
              clients can book campaigns instantly.
            </p>
          </div>

          {/* Banners Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading banners...</div>
            ) : filteredBanners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Banner</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">CTA</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Show on Open</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBanners.map((banner) => (
                      <tr key={banner.id} className="border-b border-black/5 hover:bg-black/2 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-16 h-12 object-cover rounded-lg border border-black/10"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-black font-bold">{banner.title || 'Untitled'}</p>
                              <p className="text-black/55 text-sm line-clamp-1">{banner.subtitle || 'No subtitle'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {banner.ctaType === 'whatsapp' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/15 text-[#128C7E] px-3 py-1 text-xs font-bold">
                                <WhatsAppLogoIcon className="w-3.5 h-3.5" /> WhatsApp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 text-blue-700 px-3 py-1 text-xs font-bold">
                                <ExternalLink className="w-3 h-3" /> Link
                              </span>
                            )}
                            <span className="text-black/60 text-sm">{banner.ctaLabel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                            banner.showOnOpen ? 'bg-nature/15 text-nature' : 'bg-black/5 text-black/50'
                          }`}>
                            {banner.showOnOpen ? <Eye size={13} /> : <EyeOff size={13} />}
                            {banner.showOnOpen ? 'On Open' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            banner.active ? 'bg-green-500/15 text-green-700' : 'bg-black/5 text-black/50'
                          }`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleEdit(banner)}
                              className="p-2 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-all"
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(banner.id || '')}
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
              <div className="p-8 text-center text-black/60">No banners yet. Create your first campaign banner!</div>
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
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-black/10">
                <h2 className="text-2xl font-bold text-black">
                  {editingId ? 'Edit Campaign Banner' : 'Add New Campaign Banner'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Poster Image */}
                <ImageUpload
                  label="Campaign Poster / Banner Image"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="Upload your campaign poster image to ImgBB"
                />

                <div>
                  <label className="block text-black font-bold mb-2">Banner Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Gorilla Trekking Season 2026"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    required
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Short catchy line, e.g., Limited seats — book early"
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="A couple of sentences about the campaign..."
                    rows={3}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                {/* CTA Settings */}
                <div className="rounded-lg border border-black/10 p-4 space-y-4">
                  <h4 className="font-bold text-black">Call-to-Action Button</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-bold mb-2">Button Label</label>
                      <input
                        type="text"
                        value={formData.ctaLabel}
                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                        placeholder="Book Now"
                        className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-bold mb-2">Button Action</label>
                      <select
                        value={formData.ctaType}
                        onChange={(e) => setFormData({ ...formData, ctaType: e.target.value as 'link' | 'whatsapp' })}
                        className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature bg-white"
                      >
                        <option value="whatsapp">WhatsApp Booking</option>
                        <option value="link">Website Link</option>
                      </select>
                    </div>
                  </div>

                  {formData.ctaType === 'whatsapp' ? (
                    <div>
                      <label className="block text-black font-bold mb-2">
                        WhatsApp Pre-filled Message
                      </label>
                      <textarea
                        value={formData.whatsappMessage}
                        onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                        rows={4}
                        placeholder="Hello Nechabest Adventures, I would like to book the gorilla trekking campaign..."
                        className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      />
                      <p className="text-xs text-black/50 mt-1">
                        This message opens in WhatsApp (+256 756 310 029) when visitors tap the button.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-black font-bold mb-2">Destination Link</label>
                      <input
                        type="url"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        placeholder="https://nechabest.com/eco-tourism"
                        className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      />
                    </div>
                  )}
                </div>

                {/* Display toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-black/10 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showOnOpen}
                        onChange={(e) => setFormData({ ...formData, showOnOpen: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="text-black font-bold">Show banner when site opens</p>
                        <p className="text-sm text-black/60">Displays as a popup on first visit.</p>
                      </div>
                    </label>
                  </div>
                  <div className="rounded-lg border border-black/10 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="text-black font-bold">Active</p>
                        <p className="text-sm text-black/60">Inactive banners never appear on the site.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">Display Order (lower = first)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  />
                </div>

                {/* Submit Block */}
                <div className="flex gap-4 pt-6 border-t border-black/10">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={saving}
                    className="flex-1 bg-nature text-black font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-black/10 text-black font-bold py-3 rounded-lg hover:bg-black/20 transition-all"
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