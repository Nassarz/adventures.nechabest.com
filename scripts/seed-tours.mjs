import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
const envPath = join(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const k = trimmed.slice(0, eqIdx).trim();
  let v = trimmed.slice(eqIdx + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  process.env[k] = v;
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const tours = [
  {
    title: 'Bwindi Impenetrable Forest',
    location: 'Bwindi, Uganda',
    description: 'Home to the endangered mountain gorillas and lush rainforest adventures.',
    image: 'https://iili.io/3ovy0N9.jpg',
    rating: 5.0,
    reviews: 128,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-8 People',
    badge: 'Top Rated',
    tags: ['Gorilla Trekking', 'Rainforest', 'Birding'],
    showOnHome: true,
    published: true,
  },
  {
    title: 'Murchison Falls National Park',
    location: 'Murchison Falls, Uganda',
    description: "See the world's most powerful waterfall and classic savannah wildlife.",
    image: 'https://iili.io/3o8s429.jpg',
    rating: 4.9,
    reviews: 104,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-10 People',
    badge: 'Popular',
    tags: ['Waterfalls', 'Game Drives', 'Boat Safaris'],
    showOnHome: true,
    published: true,
  },
  {
    title: 'Queen Elizabeth National Park',
    location: 'Queen Elizabeth NP, Uganda',
    description: 'Famous for tree-climbing lions, crater lakes, and diverse wildlife.',
    image: 'https://iili.io/F2JCsIf.jpg',
    rating: 4.8,
    reviews: 96,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-10 People',
    badge: 'Wildlife',
    tags: ['Tree-Climbing Lions', 'Boat Cruise', 'Crater Lakes'],
    showOnHome: true,
    published: true,
  },
  {
    title: 'Kibale Forest National Park',
    location: 'Kibale, Uganda',
    description: 'Best place in Africa for chimpanzee tracking and primate viewing.',
    image: 'https://iili.io/FvzmxwP.jpg',
    rating: 4.7,
    reviews: 88,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-8 People',
    badge: 'Primates',
    tags: ['Chimpanzee Tracking', 'Primate Walks', 'Birding'],
    showOnHome: true,
    published: true,
  },
  {
    title: 'Kidepo Valley National Park',
    location: 'Kidepo Valley, Uganda',
    description: 'Remote wilderness with dramatic landscapes and unique wildlife.',
    image: 'https://iili.io/FCfM08X.jpg',
    rating: 4.8,
    reviews: 72,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-8 People',
    badge: 'Remote',
    tags: ['Wilderness', 'Game Drives', 'Cultural Visits'],
    showOnHome: true,
    published: true,
  },
  {
    title: 'Lake Mburo National Park',
    location: 'Lake Mburo, Uganda',
    description: "Uganda's smallest savannah park, perfect for walking safaris and birding.",
    image: 'https://iili.io/FqNwhk7.jpg',
    rating: 4.6,
    reviews: 65,
    price: 'Contact Us',
    duration: 'Multi-day',
    group: '4-10 People',
    badge: 'Walking Safari',
    tags: ['Walking Safaris', 'Zebra', 'Birding'],
    showOnHome: true,
    published: true,
  },
];

async function run() {
  await client.connect();
  const db = client.db();
  const col = db.collection('tours');

  // Clear existing tours to avoid duplicates on re-run
  const existing = await col.countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} existing tours — clearing before re-seed...`);
    await col.deleteMany({});
  }

  const now = new Date();
  const docs = tours.map(t => ({ ...t, createdAt: now, updatedAt: now }));
  const result = await col.insertMany(docs);

  console.log(`\n✅ Inserted ${result.insertedCount} tours:`);
  tours.forEach(t => console.log(`  • ${t.title}`));

  await client.close();
}

run().catch(console.error);
