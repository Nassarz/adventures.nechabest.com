'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Send, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface Subscriber {
  id?: string;
  email: string;
  subscribedAt: string;
  status: 'Active' | 'Unsubscribed';
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState({
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/subscribers', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      const subscribersData = (await res.json()) as Subscriber[];
      setSubscribers(subscribersData);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this subscriber?')) {
      try {
        const res = await fetch(`/api/admin/subscribers?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete subscriber');
        fetchSubscribers();
      } catch (error) {
        console.error('Error deleting subscriber:', error);
      }
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Send this message to ${subscribers.length} subscribers?`)) {
      try {
        const res = await fetch('/api/admin/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: broadcastMessage.subject,
            content: broadcastMessage.content,
          }),
        });
        if (!res.ok) throw new Error('Failed to send newsletter');
        setBroadcastMessage({ subject: '', content: '' });
        setShowBroadcast(false);
        alert('Newsletter sent successfully!');
      } catch (error) {
        console.error('Error sending broadcast:', error);
      }
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.status?.toLowerCase() === 'active').length;

  return (
    <AdminLayout>
      <AdminHeader 
        title="Newsletter Management" 
        subtitle="Manage subscribers and send broadcasts"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-nature/10 to-primary/10 rounded-xl border border-nature/20 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-nature/20 rounded-lg">
                  <Users className="w-6 h-6 text-nature" />
                </div>
                <div>
                  <p className="text-black/60 text-sm">Total Subscribers</p>
                  <p className="text-3xl font-bold text-black">{subscribers.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-black/60 text-sm">Active Subscribers</p>
                  <p className="text-3xl font-bold text-black">{activeCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-black/60 text-sm">Engagement Rate</p>
                  <p className="text-3xl font-bold text-black">45%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:w-auto">
              <Search size={18} className="text-black/50" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBroadcast(true)}
              className="bg-nature text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <Send size={20} />
              Send Newsletter
            </motion.button>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredSubscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Subscribed Date</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-black/5 hover:bg-black/2 transition-all">
                        <td className="px-6 py-4 text-black font-medium">{subscriber.email}</td>
                        <td className="px-6 py-4 text-black/60">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subscriber.status?.toLowerCase() === 'active'
                              ? 'bg-green-500/20 text-green-700'
                              : 'bg-red-500/20 text-red-700'
                          }`}>
                            {subscriber.status ? subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1) : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(subscriber.id || '')}
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
              <div className="p-8 text-center text-black/60">No subscribers found</div>
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBroadcast(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-2xl w-full"
          >
            <h2 className="text-2xl font-bold text-black mb-6">Send Newsletter</h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-black font-bold mb-2">Subject</label>
                <input
                  type="text"
                  value={broadcastMessage.subject}
                  onChange={(e) => setBroadcastMessage({ ...broadcastMessage, subject: e.target.value })}
                  placeholder="Newsletter subject"
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  required
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-2">Message</label>
                <textarea
                  value={broadcastMessage.content}
                  onChange={(e) => setBroadcastMessage({ ...broadcastMessage, content: e.target.value })}
                  placeholder="Newsletter content"
                  rows={6}
                  className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-nature"
                  required
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-nature text-black font-bold py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Send to {subscribers.length} Subscribers
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowBroadcast(false)}
                  className="flex-1 bg-black/10 text-black font-bold py-2 rounded-lg hover:bg-black/20 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
