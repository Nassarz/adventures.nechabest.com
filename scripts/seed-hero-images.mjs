import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const k = trimmed.slice(0, eqIdx).trim();
  let v = trimmed.slice(eqIdx + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[k] = v;
}

const client = new MongoClient(process.env.MONGODB_URI);

const items = [
  // About
  { key: 'about.hero.image',    page: 'about',        section: 'hero', label: 'About Hero Image 1',        type: 'image', value: 'https://iili.io/fdC0KF9.jpg' },
  { key: 'about.hero.image2',   page: 'about',        section: 'hero', label: 'About Hero Image 2',        type: 'image', value: 'https://iili.io/3oebjFS.jpg' },
  // Blog
  { key: 'blog.hero.image',     page: 'blog',         section: 'hero', label: 'Blog Hero Image 1',         type: 'image', value: 'https://iili.io/fdClSYg.png' },
  { key: 'blog.hero.image2',    page: 'blog',         section: 'hero', label: 'Blog Hero Image 2',         type: 'image', value: 'https://iili.io/fdC0KF9.jpg' },
  // Eco-tourism
  { key: 'eco.hero.image',      page: 'eco-tourism',  section: 'hero', label: 'Eco Tourism Hero Image 1',  type: 'image', value: 'https://iili.io/3ovy0N9.jpg' },
  { key: 'eco.hero.image2',     page: 'eco-tourism',  section: 'hero', label: 'Eco Tourism Hero Image 2',  type: 'image', value: 'https://iili.io/F2JCsIf.jpg' },
  // Contact
  { key: 'contact.hero.image',  page: 'contact',      section: 'hero', label: 'Contact Hero Image 1',      type: 'image', value: 'https://iili.io/fMclk92.jpg' },
  { key: 'contact.hero.image2', page: 'contact',      section: 'hero', label: 'Contact Hero Image 2',      type: 'image', value: 'https://iili.io/fdCAigf.jpg' },
  // Booking
  { key: 'booking.hero.image',  page: 'booking',      section: 'hero', label: 'Booking Hero Image 1',      type: 'image', value: 'https://iili.io/FvzmxwP.jpg' },
  { key: 'booking.hero.image2', page: 'booking',      section: 'hero', label: 'Booking Hero Image 2',      type: 'image', value: 'https://iili.io/FCfM08X.jpg' },
];

async function run() {
  await client.connect();
  const col = client.db().collection('site_content');

  for (const item of items) {
    const result = await col.updateOne(
      { key: item.key },
      {
        $set:         { value: item.value, updatedAt: new Date() },
        $setOnInsert: { key: item.key, page: item.page, section: item.section, label: item.label, type: item.type, createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log(`${item.key}: upserted=${result.upsertedCount} modified=${result.modifiedCount}`);
  }

  await client.close();
  console.log('\nDone!');
}

run().catch(console.error);
