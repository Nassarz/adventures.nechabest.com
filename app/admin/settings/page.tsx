'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Lock, Bell, Eye, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface SiteContent {
  id: string;
  key: string;
  page: string;
  section: string;
  label: string;
  type: string;
  value: string;
}

export default function AdminSettings() {
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const fetchSiteContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/site-content?page=global', { cache: 'no-store' });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Failed to fetch site content:', {
          status: res.status,
          statusText: res.statusText,
          body: errorBody,
        });
        setSiteContent([]);
        return;
      }
      const data = await res.json();
      setSiteContent(data);
    } catch (error) {
      console.error('Error fetching site content:', error);
      setSiteContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [id]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      // Save all edited values
      const updates = Object.entries(editedValues).map(([id, value]) => 
        fetch('/api/admin/site-content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, value }),
        })
      );
      
      await Promise.all(updates);
      setSaved(true);
      setEditedValues({});
      await fetchSiteContent();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const getValue = (key: string, defaultValue: string = '') => {
    const item = siteContent.find(c => c.key === key);
    const id = item?.id || '';
    return editedValues[id] !== undefined ? editedValues[id] : (item?.value || defaultValue);
  };

  const getItemByKey = (key: string) => siteContent.find(c => c.key === key);

  if (loading) {
    return (
      <AdminLayout>
        <AdminHeader title="Settings" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-nature animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader 
        title="Settings" 
        subtitle="Manage site content and configuration - changes apply to public site"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl space-y-6">
          {/* Save Alert */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/20 border border-green-500 text-green-700 px-4 py-3 rounded-lg font-medium"
            >
              ✓ Settings saved and applied to public site!
            </motion.div>
          )}

          {/* Navbar Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-black/10 p-6"
          >
            <h3 className="text-xl font-bold text-black mb-6">Navbar Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-black font-bold mb-2">Logo Text</label>
                <input
                  type="text"
                  value={getValue('global.nav.logoText', 'Nechabest')}
                  onChange={(e) => {
                    const item = getItemByKey('global.nav.logoText');
                    if (item) handleChange(item.id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  placeholder="Nechabest"
                />
                <p className="text-black/50 text-sm mt-1">Displayed in the navigation bar</p>
              </div>

              <div>
                <label className="block text-black font-bold mb-2">Call-to-Action Button Text</label>
                <input
                  type="text"
                  value={getValue('global.nav.ctaLabel', 'Book A Tour')}
                  onChange={(e) => {
                    const item = getItemByKey('global.nav.ctaLabel');
                    if (item) handleChange(item.id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  placeholder="Book A Tour"
                />
                <p className="text-black/50 text-sm mt-1">Main action button in navbar</p>
              </div>
            </div>
          </motion.div>

          {/* Footer Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-black/10 p-6"
          >
            <h3 className="text-xl font-bold text-black mb-6">Footer Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-black font-bold mb-2">Footer Tagline</label>
                <textarea
                  value={getValue('global.footer.tagline', 'Together for a Greener Future.')}
                  onChange={(e) => {
                    const item = getItemByKey('global.footer.tagline');
                    if (item) handleChange(item.id, e.target.value);
                  }}
                  rows={2}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  placeholder="Together for a Greener Future."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black font-bold mb-2">Footer Email</label>
                  <input
                    type="email"
                    value={getValue('global.footer.emailPrimary', 'info@nechabest.com')}
                    onChange={(e) => {
                      const item = getItemByKey('global.footer.emailPrimary');
                      if (item) handleChange(item.id, e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    placeholder="info@nechabest.com"
                  />
                </div>
                <div>
                  <label className="block text-black font-bold mb-2">Footer Phone</label>
                  <input
                    type="tel"
                    value={getValue('global.footer.phone', '+256 XXX XXX XXX')}
                    onChange={(e) => {
                      const item = getItemByKey('global.footer.phone');
                      if (item) handleChange(item.id, e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                    placeholder="+256 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* All Site Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-black/10 p-6"
          >
            <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-nature" />
              All Site Content
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {siteContent
                .filter(item => !['global.nav.logoText', 'global.nav.ctaLabel', 'global.footer.tagline', 'global.footer.emailPrimary', 'global.footer.phone'].includes(item.key))
                .map((item) => (
                <div key={item.id} className="p-4 bg-black/2 rounded-lg">
                  <label className="block text-black font-medium mb-2">{item.label}</label>
                  <p className="text-black/50 text-xs mb-2">{item.section} • {item.key}</p>
                  {item.type === 'textarea' ? (
                    <textarea
                      value={editedValues[item.id] !== undefined ? editedValues[item.id] : item.value}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature text-sm"
                    />
                  ) : (
                    <input
                      type={item.type === 'url' ? 'url' : 'text'}
                      value={editedValues[item.id] !== undefined ? editedValues[item.id] : item.value}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={Object.keys(editedValues).length === 0}
            className="w-full bg-nature text-black font-bold py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
            {Object.keys(editedValues).length > 0 ? `Save ${Object.keys(editedValues).length} Changes` : 'No Changes to Save'}
          </motion.button>
        </div>
      </div>
    </AdminLayout>
  );
}
