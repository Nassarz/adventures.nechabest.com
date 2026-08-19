'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Eye, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';
import { WhatsAppLogoIcon } from '@/components/FloatingWhatsApp';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface Booking {
  id?: string;
  tourName?: string;
  tourTitle?: string;
  customerName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  date?: string;
  bookingDate?: string;
  startDate?: string;
  endDate?: string;
  specialRequests?: string;
  participants: number;
  numberOfPeople?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  hasIncompleteFields?: boolean;
}

const asText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const normalizeStatus = (status?: string): 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' => {
  const normalized = asText(status).toLowerCase();
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'cancelled') return 'Cancelled';
  return 'Pending';
};

const normalizeBooking = (booking: Booking): Booking => ({
  ...booking,
  customerName: asText(booking.customerName || booking.fullName),
  tourName: asText(booking.tourName || booking.tourTitle),
  email: asText(booking.email),
  phone: asText(booking.phone),
  date: asText(booking.date || booking.bookingDate || booking.startDate),
  startDate: asText(booking.startDate || booking.date || booking.bookingDate),
  endDate: asText(booking.endDate),
  specialRequests: asText(booking.specialRequests),
  participants: Number.isFinite(booking.participants)
    ? booking.participants
    : Number.isFinite(booking.numberOfPeople)
      ? Number(booking.numberOfPeople)
      : 0,
  totalPrice: Number.isFinite(booking.totalPrice) ? booking.totalPrice : 0,
  status: normalizeStatus(asText(booking.status)),
  hasIncompleteFields: !asText(booking.customerName || booking.fullName)
    || !asText(booking.tourName || booking.tourTitle)
    || !asText(booking.email)
    || !asText(booking.date || booking.bookingDate),
});

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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
      setBookings(bookingsData.map(normalizeBooking));
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

  const handleStatusChange = async (id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    try {
      setUpdatingStatusId(id);
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: status.toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      setBookings((prev) => prev.map((booking) => (
        booking.id === id ? { ...booking, status } : booking
      )));

      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => prev ? { ...prev, status } : prev);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdatingStatusId('');
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredBookings = bookings.filter(booking =>
    (filterStatus === 'All' || booking.status === filterStatus) &&
    (asText(booking.customerName).toLowerCase().includes(normalizedSearchTerm) ||
      asText(booking.tourName).toLowerCase().includes(normalizedSearchTerm) ||
      asText(booking.email).toLowerCase().includes(normalizedSearchTerm))
  );

  const incompleteCount = bookings.filter((booking) => booking.hasIncompleteFields).length;
  const pendingCount = bookings.filter((booking) => booking.status === 'Pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'Confirmed').length;
  const cancelledCount = bookings.filter((booking) => booking.status === 'Cancelled').length;
  const recognizedRevenue = bookings
    .filter((booking) => booking.status !== 'Cancelled')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-500/20 text-blue-600' },
              { label: 'Pending', value: pendingCount, color: 'bg-yellow-500/20 text-yellow-600' },
              { label: 'Confirmed', value: confirmedCount, color: 'bg-green-500/20 text-green-600' },
              { label: 'Cancelled', value: cancelledCount, color: 'bg-red-500/20 text-red-600' },
              { label: 'Revenue', value: `$${recognizedRevenue.toLocaleString()}`, color: 'bg-purple-500/20 text-purple-600' },
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

          {incompleteCount > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
              <p className="text-sm font-semibold">
                {incompleteCount} booking record{incompleteCount === 1 ? '' : 's'} have incomplete fields and were auto-normalized for display.
              </p>
            </div>
          )}

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
                      <tr key={booking.id} className={`border-b border-black/5 hover:bg-black/2 transition-all ${booking.hasIncompleteFields ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-black font-medium">{booking.customerName || 'Unknown customer'}</p>
                            <p className="text-black/60 text-sm">{booking.email || '-'}</p>
                            {booking.hasIncompleteFields && (
                              <p className="text-amber-700 text-xs font-semibold">Incomplete record</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-black font-medium">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="underline decoration-dotted underline-offset-4 hover:text-nature"
                          >
                            {booking.tourName || 'Untitled tour'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black/60">
                          {booking.startDate ? (
                            <div>
                              <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                              {booking.endDate && (
                                <div className="text-black/40 text-xs">→ {new Date(booking.endDate).toLocaleDateString()}</div>
                              )}
                            </div>
                          ) : booking.date ? (
                            new Date(booking.date).toLocaleDateString()
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-black">{booking.participants}</td>
                        <td className="px-6 py-4 text-black font-bold">${booking.totalPrice}</td>
                        <td className="px-6 py-4">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(
                              booking.id || '',
                              e.target.value as 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
                            )}
                            disabled={!booking.id || updatingStatusId === booking.id}
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}
                          >
                            {statuses.slice(1).map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 hover:bg-blue-500/20 text-blue-600 rounded-lg transition-all"
                            >
                              <Eye size={18} />
                            </motion.button>
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

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-black">Booking Details</h3>
                <p className="text-black/60">{selectedBooking.tourName || 'Untitled tour'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-md p-2 hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div><span className="font-semibold">Customer:</span> {selectedBooking.customerName || 'Unknown customer'}</div>
              <div><span className="font-semibold">Email:</span> {selectedBooking.email || '-'}</div>
              <div><span className="font-semibold">Phone:</span> {selectedBooking.phone || '-'}</div>
              <div><span className="font-semibold">Booking Dates:</span> {selectedBooking.startDate ? `${new Date(selectedBooking.startDate).toLocaleDateString()}${selectedBooking.endDate ? ` → ${new Date(selectedBooking.endDate).toLocaleDateString()}` : ''}` : (selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : '-')}</div>
              <div><span className="font-semibold">Participants:</span> {selectedBooking.participants}</div>
              <div><span className="font-semibold">Total Price:</span> ${selectedBooking.totalPrice || 0}</div>
              <div><span className="font-semibold">Status:</span> {selectedBooking.status}</div>
              <div><span className="font-semibold">Created:</span> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : '-'}</div>
            </div>

            <div className="mt-4 rounded-lg border border-black/10 bg-black/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/60">Special Requests</p>
              <p className="text-sm text-black">{selectedBooking.specialRequests || 'No special requests'}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {selectedBooking.phone && (
                <a
                  href={buildWhatsAppLink(
                    `Hello ${selectedBooking.customerName || 'there'}! This is Nechabest Sustainable Initiatives regarding your "${selectedBooking.tourName || 'tour'}" booking (${selectedBooking.date || 'date TBC'}). Please reply to confirm your payment details.`,
                    selectedBooking.phone
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1fb959]"
                >
                  <WhatsAppLogoIcon className="w-4 h-4" />
                  WhatsApp Client
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
