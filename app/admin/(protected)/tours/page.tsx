'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Check, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import ImageUpload from '@/components/admin/ImageUpload';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  location?: string;
  accommodation?: string;
  meals?: string;
}

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
  gallery?: string[];
  itinerary?: ItineraryDay[];
  includes?: string[];
  excludes?: string[];
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
  gallery: [],
  itinerary: [],
  includes: [],
  excludes: [],
};

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Tour>(emptyTourForm);
  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'gallery' | 'lists'>('details');

  // Input states for highlights, includes, and excludes
  const [newHighlight, setNewHighlight] = useState('');
  const [newInclude, setNewInclude] = useState('');
  const [newExclude, setNewExclude] = useState('');

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
        gallery: formData.gallery || [],
        itinerary: formData.itinerary || [],
        includes: formData.includes || [],
        excludes: formData.excludes || [],
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
      setActiveTab('details');
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
      gallery: Array.isArray(tour.gallery) ? tour.gallery : [],
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
      includes: Array.isArray(tour.includes) ? tour.includes : [],
      excludes: Array.isArray(tour.excludes) ? tour.excludes : [],
    });
    setEditingId(tour.id || null);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  // Itinerary helpers
  const handleAddItineraryDay = () => {
    const itinerary = formData.itinerary ? [...formData.itinerary] : [];
    const newDayNumber = itinerary.length + 1;
    setFormData({
      ...formData,
      itinerary: [
        ...itinerary,
        { day: newDayNumber, title: `Day ${newDayNumber} Exploration`, description: '' },
      ],
    });
  };

  const handleRemoveItineraryDay = (index: number) => {
    if (!formData.itinerary) return;
    const itinerary = formData.itinerary.filter((_, i) => i !== index);
    // Re-adjust day numbers
    const updatedItinerary = itinerary.map((item, i) => ({
      ...item,
      day: i + 1,
    }));
    setFormData({ ...formData, itinerary: updatedItinerary });
  };

  const handleItineraryChange = (index: number, field: 'title' | 'description' | 'location' | 'accommodation' | 'meals', value: string) => {
    if (!formData.itinerary) return;
    const itinerary = [...formData.itinerary];
    itinerary[index] = { ...itinerary[index], [field]: value };
    setFormData({ ...formData, itinerary });
  };

  // List helpers (Highlights, Includes, Excludes)
  const handleAddListElement = (type: 'highlights' | 'includes' | 'excludes', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const list = formData[type] ? [...formData[type]!] : [];
    setFormData({ ...formData, [type]: [...list, value.trim()] });
    setter('');
  };

  const handleRemoveListElement = (type: 'highlights' | 'includes' | 'excludes', index: number) => {
    if (!formData[type]) return;
    const list = formData[type]!.filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: list });
  };

  const handleGalleryUpload = (url: string) => {
    const gallery = formData.gallery ? [...formData.gallery] : [];
    setFormData({ ...formData, gallery: [...gallery, url] });
  };

  const handleRemoveGalleryImage = (index: number) => {
    if (!formData.gallery) return;
    const gallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery });
  };

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminHeader 
        title="Tours Management" 
        subtitle="Create, edit and manage all eco-tours and packages"
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
                setActiveTab('details');
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
              <div className="p-8 text-center">Loading tours data...</div>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
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
                  {editingId ? 'Edit Eco-Tour Package' : 'Add New Eco-Tour'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 py-4 border-b border-black/5 text-sm font-semibold">
                {(['details', 'itinerary', 'gallery', 'lists'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-nature text-black'
                        : 'text-black/60 hover:bg-black/5'
                    }`}
                  >
                    {tab === 'lists' ? 'Highlights / Inclusions' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Area */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-black font-bold mb-2">Tour Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Gorillas in Bwindi"
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
                          placeholder="e.g., Kisoro, Uganda"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">Price Label</label>
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="e.g., $1500 or Contact Us"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-bold mb-2">Duration</label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="e.g., 3 Days"
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">Group details</label>
                        <input
                          type="text"
                          value={formData.group}
                          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                          placeholder="e.g., 2-6 People"
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

                    <ImageUpload
                      label="Main Tour Image"
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      placeholder="Upload primary cover image to ImgBB"
                    />

                    <div>
                      <label className="block text-black font-bold mb-2">Main Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the adventure, context, flora & fauna..."
                        rows={4}
                        className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black font-bold mb-2">Base Rating (out of 5)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                        />
                      </div>
                      <div>
                        <label className="block text-black font-bold mb-2">Fake/Start Reviews Count</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.reviews}
                          onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-black text-lg">Tour Itinerary</h4>
                        <p className="text-xs text-black/50">Add day-by-day exploration plans</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItineraryDay}
                        className="flex items-center gap-1 text-sm bg-nature/20 hover:bg-nature text-black px-3 py-1.5 rounded-lg font-bold transition-all"
                      >
                        <PlusCircle size={16} /> Add Day
                      </button>
                    </div>

                    {formData.itinerary && formData.itinerary.length > 0 ? (
                      <div className="space-y-4">
                        {formData.itinerary.map((item, index) => (
                          <div key={index} className="p-4 bg-black/2 rounded-xl border border-black/5 space-y-3 relative group">
                            <button
                              type="button"
                              onClick={() => handleRemoveItineraryDay(index)}
                              className="absolute top-4 right-4 p-1 bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete this day"
                            >
                              <Trash2 size={16} />
                            </button>
                            <h5 className="font-bold text-primary">Day {item.day}</h5>
                            <div className="grid grid-cols-1 gap-3">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                                placeholder="Day title (e.g. Gorilla Trekking)"
                                className="w-full px-3 py-2 border border-black/10 bg-white rounded-lg focus:outline-none focus:border-nature text-sm font-semibold text-black"
                                required
                              />
                              <textarea
                                value={item.description}
                                onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                                placeholder="Describe what travelers will do, eat, see, and where they will sleep..."
                                rows={2}
                                className="w-full px-3 py-2 border border-black/10 bg-white rounded-lg focus:outline-none focus:border-nature text-sm text-black/80"
                                required
                              />
                              <input
                                type="text"
                                value={item.location || ''}
                                onChange={(e) => handleItineraryChange(index, 'location', e.target.value)}
                                placeholder="Location (e.g. Masai Mara National Reserve)"
                                className="w-full px-3 py-2 border border-black/10 bg-white rounded-lg focus:outline-none focus:border-nature text-sm text-black/80"
                              />
                              <input
                                type="text"
                                value={item.accommodation || ''}
                                onChange={(e) => handleItineraryChange(index, 'accommodation', e.target.value)}
                                placeholder="Accommodation (e.g. Mara Simba Lodge)"
                                className="w-full px-3 py-2 border border-black/10 bg-white rounded-lg focus:outline-none focus:border-nature text-sm text-black/80"
                              />
                              <input
                                type="text"
                                value={item.meals || ''}
                                onChange={(e) => handleItineraryChange(index, 'meals', e.target.value)}
                                placeholder="Meals (e.g. Full board • Drinking water throughout)"
                                className="w-full px-3 py-2 border border-black/10 bg-white rounded-lg focus:outline-none focus:border-nature text-sm text-black/80"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-black/40 border border-dashed rounded-xl">
                        No itinerary days configured yet. Click &quot;Add Day&quot; to start.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-black text-lg">Additional Images Gallery</h4>
                      <p className="text-xs text-black/50 mb-3">Upload additional pictures for the tour details slideshow</p>
                    </div>

                    <ImageUpload
                      value=""
                      onChange={handleGalleryUpload}
                      placeholder="Add an image to the tour gallery"
                    />

                    {formData.gallery && formData.gallery.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        {formData.gallery.map((imgUrl, index) => (
                          <div key={index} className="relative rounded-xl border border-black/10 aspect-video overflow-hidden group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Gallery ${index}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(index)}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-black/40 border border-dashed rounded-xl">
                        No gallery images uploaded yet.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'lists' && (
                  <div className="space-y-6">
                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-black text-lg">Tour Highlights</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddListElement('highlights', newHighlight, setNewHighlight))}
                          placeholder="e.g., Tree-climbing lions"
                          className="flex-1 px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddListElement('highlights', newHighlight, setNewHighlight)}
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.highlights.map((item, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-nature/10 text-nature text-xs font-bold border border-nature/20">
                            {item}
                            <button type="button" onClick={() => handleRemoveListElement('highlights', index)} className="hover:text-red-600">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-black text-lg">Inclusions (What is Included)</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInclude}
                          onChange={(e) => setNewInclude(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddListElement('includes', newInclude, setNewInclude))}
                          placeholder="e.g., Professional Guides, Transport, Park fees"
                          className="flex-1 px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddListElement('includes', newInclude, setNewInclude)}
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="space-y-1 text-sm font-semibold text-black/70">
                        {formData.includes?.map((item, index) => (
                          <li key={index} className="flex justify-between items-center p-2 bg-black/2 rounded-lg">
                            <span className="flex items-center gap-2 text-nature"><Check size={14} /> {item}</span>
                            <button type="button" onClick={() => handleRemoveListElement('includes', index)} className="text-red-600 hover:scale-110 transition-all">
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Excludes */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-black text-lg">Exclusions (What is NOT Included)</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExclude}
                          onChange={(e) => setNewExclude(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddListElement('excludes', newExclude, setNewExclude))}
                          placeholder="e.g., Flights, Visas, Personal tips"
                          className="flex-1 px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddListElement('excludes', newExclude, setNewExclude)}
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/80"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="space-y-1 text-sm font-semibold text-black/70">
                        {formData.excludes?.map((item, index) => (
                          <li key={index} className="flex justify-between items-center p-2 bg-black/2 rounded-lg">
                            <span className="flex items-center gap-2 text-red-600"><X size={14} /> {item}</span>
                            <button type="button" onClick={() => handleRemoveListElement('excludes', index)} className="text-red-600 hover:scale-110 transition-all">
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Submit Block */}
                <div className="flex gap-4 pt-6 border-t border-black/10">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-nature text-black font-bold py-3 rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingId ? 'Update Tour Package' : 'Create Tour Package'}
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
