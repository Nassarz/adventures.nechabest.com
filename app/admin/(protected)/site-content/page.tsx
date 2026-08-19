'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Search, Save, X } from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface SiteContentRow {
  id: string;
  key: string;
  page: string;
  section: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url';
  value: string;
  updatedAt?: string;
}

const PAGE_OPTIONS = [
  { label: 'All Pages', value: 'all' },
  { label: 'Global', value: 'global' },
  { label: 'Home', value: 'home' },
  { label: 'About', value: 'about' },
  { label: 'Blog', value: 'blog' },
  { label: 'Eco Tourism', value: 'eco-tourism' },
  { label: 'Contact', value: 'contact' },
  { label: 'Booking', value: 'booking' },
];

export default function AdminSiteContentPage() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('all');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<SiteContentRow | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      if (query.trim()) {
        params.set('q', query.trim());
      }

      const res = await fetch(`/api/admin/site-content?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Failed to fetch site content:', {
          status: res.status,
          statusText: res.statusText,
          body: errorBody,
        });
        setRows([]);
        return;
      }

      const data = (await res.json()) as SiteContentRow[];
      setRows(data);
    } catch (error) {
      console.error('Error loading site content:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredRows = useMemo(() => {
    if (!query.trim()) {
      return rows;
    }
    const q = query.toLowerCase();
    return rows.filter((row) =>
      row.key.toLowerCase().includes(q) ||
      row.label.toLowerCase().includes(q) ||
      row.section.toLowerCase().includes(q) ||
      row.page.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const openEditor = (row: SiteContentRow) => {
    setActiveRow(row);
    setDraftValue(row.value || '');
    setIsModalOpen(true);
  };

  const saveRow = async () => {
    if (!activeRow) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeRow.id, value: draftValue }),
      });

      if (!res.ok) {
        throw new Error('Failed to save content');
      }

      setRows((prev) =>
        prev.map((row) => (row.id === activeRow.id ? { ...row, value: draftValue } : row))
      );
      setIsModalOpen(false);
      setActiveRow(null);
      setDraftValue('');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Site Content"
        subtitle="Edit public site text and images per page"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_auto] gap-3">
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-nature"
            >
              {PAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 h-11">
              <Search size={16} className="text-black/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keys, labels, sections"
                className="w-full bg-transparent text-sm text-black placeholder-black/40 outline-none"
              />
            </div>

            <button
              onClick={loadRows}
              className="h-11 rounded-xl bg-nature px-5 text-sm font-semibold text-black hover:shadow-md transition-shadow"
            >
              Refresh
            </button>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-black/60">Loading site content...</div>
            ) : filteredRows.length === 0 ? (
              <div className="p-10 text-center text-black/60">No content fields found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px]">
                  <thead className="bg-[#f6f7f9] border-b border-black/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black/60">Page</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black/60">Section</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black/60">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black/60">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-black/60">Preview</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-black/60">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="border-b border-black/5 align-top">
                        <td className="px-4 py-3 text-sm font-semibold text-black/80">{row.page}</td>
                        <td className="px-4 py-3 text-sm text-black/65">{row.section}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-black">{row.label}</p>
                          <p className="text-xs text-black/45 mt-1">{row.key}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase text-black/60">
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[360px]">
                          <p className="line-clamp-2 text-sm text-black/70 break-words">{row.value}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => openEditor(row)}
                              className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black hover:bg-black/5"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && activeRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 p-4 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-2xl bg-white p-5 md:p-6 border border-black/10 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">{activeRow.page} / {activeRow.section}</p>
                  <h2 className="text-xl md:text-2xl font-bold text-black mt-1">{activeRow.label}</h2>
                  <p className="text-xs text-black/45 mt-1">{activeRow.key}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-black/60 hover:bg-black/5"
                >
                  <X size={18} />
                </button>
              </div>

              {activeRow.type === 'textarea' ? (
                <textarea
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-black/10 p-4 text-sm text-black outline-none focus:border-nature"
                />
              ) : (
                <input
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className="w-full h-12 rounded-xl border border-black/10 px-4 text-sm text-black outline-none focus:border-nature"
                />
              )}

              {activeRow.type === 'image' && draftValue ? (
                <div className="mt-4 rounded-xl border border-black/10 overflow-hidden bg-[#f5f6f8] p-3">
                  <Image
                    src={draftValue}
                    alt={activeRow.label}
                    width={400}
                    height={240}
                    className="w-full max-h-[240px] object-cover rounded-lg"
                  />
                </div>
              ) : null}

              <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 rounded-xl border border-black/15 px-5 text-sm font-semibold text-black/70"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={saveRow}
                  className="h-11 rounded-xl bg-nature px-6 text-sm font-semibold text-black disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
