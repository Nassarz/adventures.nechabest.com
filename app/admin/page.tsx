'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Map, Calendar, FileText, Users } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Tours', value: '0', icon: Map, color: 'bg-nature' },
    { label: 'Bookings', value: '0', icon: Calendar, color: 'bg-primary' },
    { label: 'Blog Posts', value: '0', icon: FileText, color: 'bg-[#2D4A43]' },
    { label: 'Subscribers', value: '0', icon: Users, color: 'bg-[#4A635D]' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-primary">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-foreground/60 font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-8 border border-black/5">
        <p className="text-foreground/60">Connect your MongoDB database and create some tours to get started.</p>
      </div>
    </div>
  );
}
