'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Search, XCircle, Undo2 } from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminHeader from '@/components/admin/AdminHeader';

type CommentStatus = 'pending' | 'approved' | 'disapproved';

interface BlogComment {
  id: string;
  blogId: string;
  blogTitle: string;
  name: string;
  email: string;
  avatar?: string;
  comment: string;
  createdAt?: string;
  status: CommentStatus;
}

export default function AdminComments() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | CommentStatus>('pending');

  const statusOptions: Array<'all' | CommentStatus> = ['all', 'pending', 'approved', 'disapproved'];

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        query.set('status', filterStatus);
        const res = await fetch(`/api/admin/comments?${query.toString()}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentsData = (await res.json()) as BlogComment[];
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [filterStatus]);

  const moderateComment = async (id: string, action: CommentStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        throw new Error('Failed to update comment status');
      }
      setComments((prev) => prev.map((comment) => (comment.id === id ? { ...comment, status: action } : comment)));
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setUpdatingId('');
    }
  };

  const filteredComments = comments.filter((comment) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      comment.name.toLowerCase().includes(query) ||
      comment.email.toLowerCase().includes(query) ||
      comment.blogTitle.toLowerCase().includes(query) ||
      comment.comment.toLowerCase().includes(query)
    );
  });

  const statusBadgeClass: Record<CommentStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-700',
    approved: 'bg-green-500/20 text-green-700',
    disapproved: 'bg-red-500/20 text-red-700',
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Comment Verification"
        subtitle="Approve or disapprove blog comments before they go public"
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statusOptions.map((status) => {
              const count = status === 'all' ? comments.length : comments.filter((comment) => comment.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    filterStatus === status
                      ? 'border-nature bg-nature/10'
                      : 'border-black/10 bg-white hover:bg-black/5'
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-black/50">{status}</p>
                  <p className="mt-2 text-3xl font-bold text-black">{count}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-black/5 px-4 py-2 rounded-lg w-full md:max-w-md">
            <Search size={18} className="text-black/50" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-black placeholder-black/40 flex-1"
            />
          </div>

          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredComments.length === 0 ? (
              <div className="p-8 text-center text-black/60">No comments found for this filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px]">
                  <thead className="bg-black/5 border-b border-black/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Blog</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Author</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Comment</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.map((comment) => (
                      <tr key={comment.id} className="border-b border-black/5 align-top">
                        <td className="px-6 py-4 text-black font-medium">{comment.blogTitle}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={comment.avatar || '/icons/comment-default.svg'}
                              alt={comment.name}
                              width={32}
                              height={32}
                              className="rounded-full border border-black/10"
                              unoptimized
                            />
                            <div>
                              <p className="text-black font-medium">{comment.name}</p>
                              <p className="text-black/50 text-sm">{comment.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-black/70 max-w-[380px]">{comment.comment}</td>
                        <td className="px-6 py-4 text-black/60 text-sm">
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusBadgeClass[comment.status]}`}>
                            {comment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.06 }}
                              disabled={updatingId === comment.id || comment.status === 'approved'}
                              onClick={() => moderateComment(comment.id, 'approved')}
                              className="p-2 rounded-lg bg-green-500/10 text-green-700 disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.06 }}
                              disabled={updatingId === comment.id || comment.status === 'disapproved'}
                              onClick={() => moderateComment(comment.id, 'disapproved')}
                              className="p-2 rounded-lg bg-red-500/10 text-red-700 disabled:opacity-50"
                              title="Disapprove"
                            >
                              <XCircle size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.06 }}
                              disabled={updatingId === comment.id || comment.status === 'pending'}
                              onClick={() => moderateComment(comment.id, 'pending')}
                              className="p-2 rounded-lg bg-yellow-500/10 text-yellow-700 disabled:opacity-50"
                              title="Reset to Pending"
                            >
                              <Undo2 size={18} />
                            </motion.button>
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
    </AdminLayout>
  );
}