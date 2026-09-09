import { ObjectId } from 'mongodb';

export interface Tour {
  _id?: ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  highlights: string[];
  location?: string;
  groupSize?: string;
  showOnHome?: boolean;
  published?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id?: ObjectId;
  tourId: string;
  tourTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  startDate: string;
  endDate?: string;
  totalPrice: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  read?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: Date;
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

export interface Settings {
  _id?: ObjectId;
  key: string;
  value: string | boolean | number;
  category: string;
  updatedAt: Date;
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

export interface Admin {
  _id?: ObjectId;
  clerkUserId: string;
  email: string;
  name: string;
  role: 'super-admin' | 'admin' | 'editor';
  createdAt: Date;
  lastLogin: Date;
}
