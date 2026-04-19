/**
 * Seed exact Studio packages into Firestore (idempotent upsert).
 * Usage: node scripts/seedStudioPackages.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCmVJaUfbsN408yL4QzTa-nn8bC24vMA2g',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'dreamandsnaptest.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'dreamandsnaptest',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'dreamandsnaptest.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '385809984885',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:385809984885:web:357c58036964477f26773c',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CBXLNK4PCD'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STUDIO_CATEGORY_DOC = {
  name: 'Studio',
  color: '#F26389',
  subcategories: [
    { id: 'sub-kids', name: 'Kids' },
    { id: 'sub-predebut', name: 'Pre-Debut' },
    { id: 'sub-family-portrait', name: 'Family Portrait' },
    { id: 'sub-adults-couples', name: 'Adults & Couples' }
  ]
};

const STUDIO_PACKAGES = [
  {
    category: 'Studio',
    subcategory: 'Kids',
    title: 'Kids Dream Package',
    basePrice: 3000,
    duration: '1 hour',
    inclusions: '1 hr, 2 backdrops, 2-3 outfit changes, all digital photos, free family shoot (immediate family only)'
  },
  {
    category: 'Studio',
    subcategory: 'Pre-Debut',
    title: 'Dream Package',
    basePrice: 3500,
    duration: '1 hour',
    inclusions: '1 hr, 2 basic backdrops, 2 outfit changes, all digital photos'
  },
  {
    category: 'Studio',
    subcategory: 'Pre-Debut',
    title: 'Enchant Package',
    basePrice: 5000,
    duration: '1.5 hours',
    inclusions: '1.5 hrs, 2 basic backdrops, 1 custom setup, 3 outfit changes, all digital photos'
  },
  {
    category: 'Studio',
    subcategory: 'Pre-Debut',
    title: 'Fantasy Package',
    basePrice: 6000,
    duration: '3 hours',
    inclusions: "3 hrs, on-location shoot, 3 outfit changes, all digital photos (Addt'l transpo may apply)"
  },
  {
    category: 'Studio',
    subcategory: 'Family Portrait',
    title: 'Mini Session',
    basePrice: 2500,
    duration: '30 mins',
    inclusions: '30 mins, max 4 pax, 2 basic backdrops, 1 outfit, all digital photos'
  },
  {
    category: 'Studio',
    subcategory: 'Family Portrait',
    title: 'Full Session',
    basePrice: 3500,
    duration: '1 hour',
    inclusions: '1 hr, max 4 pax, 2 basic backdrops, 2 outfit changes, all digital photos'
  },
  {
    category: 'Studio',
    subcategory: 'Adults & Couples',
    title: 'Mini Session',
    basePrice: 2000,
    duration: '30 mins',
    inclusions: '30 mins, 1-2 pax, 2 basic backdrops, 1 outfit, 15 enhanced digital photos'
  },
  {
    category: 'Studio',
    subcategory: 'Adults & Couples',
    title: 'Full Session',
    basePrice: 3500,
    duration: '1 hour',
    inclusions: '1 hr, 1-2 pax, 2 basic backdrops, 1 outfit, all digital photos'
  }
];

async function upsertStudioCategory() {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, where('name', '==', 'Studio'), limit(1));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existing = snap.docs[0];
    await updateDoc(doc(db, 'categories', existing.id), {
      ...STUDIO_CATEGORY_DOC,
      updatedAt: serverTimestamp()
    });
    return { id: existing.id, ...STUDIO_CATEGORY_DOC };
  }

  const createdRef = await addDoc(categoriesRef, {
    ...STUDIO_CATEGORY_DOC,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { id: createdRef.id, ...STUDIO_CATEGORY_DOC };
}

async function upsertStudioPackages() {
  const servicesRef = collection(db, 'services');
  let created = 0;
  let updated = 0;

  for (const pkg of STUDIO_PACKAGES) {
    const q = query(
      servicesRef,
      where('category', '==', pkg.category),
      where('subcategory', '==', pkg.subcategory),
      where('title', '==', pkg.title),
      limit(1)
    );

    const snap = await getDocs(q);

    const payload = {
      category: pkg.category,
      subcategory: pkg.subcategory,
      title: pkg.title,
      basePrice: pkg.basePrice,
      duration: pkg.duration,
      status: 'Available',
      categoryColor: '#F26389',
      inclusions: pkg.inclusions,
      addons: []
    };

    if (!snap.empty) {
      const existing = snap.docs[0];
      await updateDoc(doc(db, 'services', existing.id), {
        ...payload,
        updatedAt: serverTimestamp()
      });
      updated += 1;
      console.log(`Updated: ${pkg.subcategory} - ${pkg.title}`);
    } else {
      await addDoc(servicesRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      created += 1;
      console.log(`Created: ${pkg.subcategory} - ${pkg.title}`);
    }
  }

  return { created, updated };
}

async function run() {
  try {
    console.log('Seeding Studio category and packages...');
    await upsertStudioCategory();
    const result = await upsertStudioPackages();
    console.log(`Done. Created: ${result.created}, Updated: ${result.updated}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

run();
