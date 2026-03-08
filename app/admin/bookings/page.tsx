'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

interface Booking {
  id?: string;
  tourName: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  participants: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  totalPrice: number;
  createdAt: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/bookings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const bookingsData = (await res.json()) as Booking[];
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        const res = await fetch(`/api/admin/bookings?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete booking');
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const filteredBookings = bookings.filter(booking =>
    (filterStatus === 'All' || booking.status === filterStatus) &&
    (booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-500/20 text-yellow-700',
      Confirmed: 'bg-green-500/20 text-green-700',
      Completed: 'bg-blue-500/20 text-blue-700',
      Cancelled: 'bg-red-500/20 text-red-700',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-700';
  };

  return (
    <AdminLayout>
      <AdminHeader 
        title="Bookings Management" 
        subtitle="View and manage all tour bookings"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:w-auto">
              <Search size={18} className="text-black/50" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {statuses.map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-nature text-black'
                      : 'bg-black/5 text-black hover:bg-black/10'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-500/20 text-blue-600' },
              { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: 'bg-yellow-500/20 text-yellow-600' },
              { label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, color: 'bg-green-500/20 text-green-600' },
              { label: 'Revenue', value: `$${bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}`, color: 'bg-purple-500/20 text-purple-600' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${stat.color} rounded-lg p-4 text-center`}
              >
                <p className="text-sm font-medium opacity-70">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Tour</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Participants</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-black/5 hover:bg-black/2 transition-all">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-black font-medium">{booking.customerName}</p>
                            <p className="text-black/60 text-sm">{booking.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-black font-medium">{booking.tourName}</td>
                        <td className="px-6 py-4 text-black/60">{booking.date}</td>
                        <td className="px-6 py-4 text-black">{booking.participants}</td>
                        <td className="px-6 py-4 text-black font-bold">${booking.totalPrice}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleDelete(booking.id || '')}
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
              <div className="p-8 text-center text-black/60">No bookings found</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
