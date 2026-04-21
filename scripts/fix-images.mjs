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
  // Strip surrounding quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  process.env[k] = v;
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const imageUpdates = [
  { key: 'home.projects.featuredImage',  value: 'https://iili.io/f0xoXA7.png' },
  { key: 'home.projects.project2Image',  value: 'https://iili.io/fdCAigf.jpg' },
  { key: 'home.projects.project3Image',  value: 'https://iili.io/fMclk92.jpg' },
  // Also fix focus area images that may still have picsum
  { key: 'home.focus.area1.image',       value: 'https://iili.io/f0xoXA7.png' },
  { key: 'home.focus.area2.image',       value: 'https://iili.io/fMclk92.jpg' },
  { key: 'home.focus.area3.image',       value: 'https://iili.io/f0CHCD7.jpg' },
  { key: 'home.focus.area4.image',       value: 'https://iili.io/fMclNa4.jpg' },
];

const insertIfMissing = [
  { key: 'home.projects.featuredImage', page: 'home', section: 'projects', label: 'Featured Project Image', type: 'image', value: 'https://iili.io/f0xoXA7.png' },
  { key: 'home.projects.project2Image', page: 'home', section: 'projects', label: 'Project 2 Image',         type: 'image', value: 'https://iili.io/fdCAigf.jpg' },
  { key: 'home.projects.project3Image', page: 'home', section: 'projects', label: 'Project 3 Image',         type: 'image', value: 'https://iili.io/fMclk92.jpg' },
];

async function run() {
  await client.connect();
  const db = client.db();
  const col = db.collection('site_content');

  // Upsert all image keys (insert if missing, update if exists)
  for (const item of insertIfMissing) {
    const result = await col.updateOne(
      { key: item.key },
      {
        $set:       { value: item.value, updatedAt: new Date() },
        $setOnInsert: { key: item.key, page: item.page, section: item.section, label: item.label, type: item.type, createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log(`${item.key}: upserted=${result.upsertedCount}, modified=${result.modifiedCount}`);
  }

  // Force-update focus area images in case they still have picsum
  for (const item of imageUpdates) {
    const result = await col.updateOne(
      { key: item.key },
      { $set: { value: item.value, updatedAt: new Date() } }
    );
    if (result.matchedCount) {
      console.log(`Updated ${item.key} → ${item.value}`);
    }
  }

  await client.close();
  console.log('\nDone!');
}

run().catch(console.error);
