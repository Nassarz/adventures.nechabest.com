import { ObjectId } from 'mongodb';

export interface Blog {
  _id?: ObjectId;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tour {
  _id?: ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  highlights: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id?: ObjectId;
  tourName: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: Date;
}

export interface Broadcast {
  _id?: ObjectId;
  subject: string;
  message: string;
  sentAt: Date;
  recipientCount: number;
}

export interface Media {
  _id?: ObjectId;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface Settings {
  _id?: ObjectId;
  key: string;
  value: string | boolean | number;
  category: string;
  updatedAt: Date;
}

export interface Admin {
  _id?: ObjectId;
  clerkUserId: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'editor';
  createdAt: Date;
  lastLogin: Date;
}

export interface SiteContent {
  _id?: ObjectId;
  key: string;
  page: string;
  section: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url';
  value: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export interface Banner {
  _id?: ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}
