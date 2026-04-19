/**
 * Firestore Database Seeding Script
 * Populates Firestore with initial mock data for testing and demo
 * 
 * Usage: node scripts/seedFirestore.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmVJaUfbsN408yL4QzTa-nn8bC24vMA2g",
  authDomain: "dreamandsnaptest.firebaseapp.com",
  projectId: "dreamandsnaptest",
  storageBucket: "dreamandsnaptest.firebasestorage.app",
  messagingSenderId: "385809984885",
  appId: "1:385809984885:web:357c58036964477f26773c",
  measurementId: "G-CBXLNK4PCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock data for seeding
const mockServices = [
    // Studio - Kids
    {
        id: 'SRV-KIDS-001',
        category: 'Studio',
        subcategory: 'Kids',
        title: 'Kids Dream Package',
        basePrice: 3000,
        duration: '1 hour',
        status: 'Available',
        addons: [
            { id: 'a1', name: 'Hair & Make-up', defaultPrice: 1500 },
            { id: 'a2', name: 'Cake Smash', defaultPrice: 500 },
            { id: 'a3', name: 'Milk Bath', defaultPrice: 1000 },
            { id: 'a4', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a5', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
            { id: 'a6', name: 'Addt\'l Pax', defaultPrice: 1000 },
        ]
    },
    // Studio - Pre-Debut
    {
        id: 'SRV-PREDEBUT-001',
        category: 'Studio',
        subcategory: 'Pre-Debut',
        title: 'Pre-Debut Dream',
        basePrice: 3500,
        duration: '2 hours',
        status: 'Available',
        addons: [
            { id: 'a7', name: 'HMUA', defaultPrice: 1700 },
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    {
        id: 'SRV-PREDEBUT-002',
        category: 'Studio',
        subcategory: 'Pre-Debut',
        title: 'Pre-Debut Enchant',
        basePrice: 5000,
        duration: '2.5 hours',
        status: 'Available',
        addons: [
            { id: 'a7', name: 'HMUA', defaultPrice: 1700 },
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    {
        id: 'SRV-PREDEBUT-003',
        category: 'Studio',
        subcategory: 'Pre-Debut',
        title: 'Pre-Debut Fantasy',
        basePrice: 6000,
        duration: '3 hours',
        status: 'Available',
        addons: [
            { id: 'a7', name: 'HMUA', defaultPrice: 1700 },
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    // Studio - Family
    {
        id: 'SRV-FAMILY-001',
        category: 'Studio',
        subcategory: 'Family',
        title: 'Family Mini',
        basePrice: 2500,
        duration: '1 hour',
        status: 'Available',
        addons: [
            { id: 'a10', name: 'Addt\'l Pax', defaultPrice: 200 },
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    {
        id: 'SRV-FAMILY-002',
        category: 'Studio',
        subcategory: 'Family',
        title: 'Family Full',
        basePrice: 3500,
        duration: '1.5 hours',
        status: 'Available',
        addons: [
            { id: 'a10', name: 'Addt\'l Pax', defaultPrice: 200 },
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    // Studio - Adults/Couple
    {
        id: 'SRV-ADULT-001',
        category: 'Studio',
        subcategory: 'Adults/Couple',
        title: 'Couple Mini',
        basePrice: 2000,
        duration: '1 hour',
        status: 'Available',
        addons: [
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    {
        id: 'SRV-ADULT-002',
        category: 'Studio',
        subcategory: 'Adults/Couple',
        title: 'Couple Full',
        basePrice: 3500,
        duration: '1.5 hours',
        status: 'Available',
        addons: [
            { id: 'a8', name: 'Addt\'l Backdrop', defaultPrice: 500 },
            { id: 'a9', name: 'Addt\'l 30 Mins', defaultPrice: 1000 },
        ]
    },
    // Events
    {
        id: 'SRV-EVENT-001',
        category: 'Event',
        subcategory: 'Party',
        title: 'Kiddie Party',
        basePrice: 3499,
        duration: '1.5 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-002',
        category: 'Event',
        subcategory: 'Birthday',
        title: 'Basic Bday',
        basePrice: 3999,
        duration: '1.5 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-003',
        category: 'Event',
        subcategory: 'Birthday',
        title: '7th Bday',
        basePrice: 4999,
        duration: '2 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-004',
        category: 'Event',
        subcategory: 'Birthday',
        title: 'Adult Bday',
        basePrice: 4499,
        duration: '2 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-005',
        category: 'Event',
        subcategory: 'Ceremony',
        title: 'Baptism',
        basePrice: 3999,
        duration: '2 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-006',
        category: 'Event',
        subcategory: 'Ceremony',
        title: 'Baptism w/ Bday',
        basePrice: 4499,
        duration: '2.5 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    },
    {
        id: 'SRV-EVENT-007',
        category: 'Event',
        subcategory: 'Wedding',
        title: 'Civil Wedding',
        basePrice: 5499,
        duration: '3 hours',
        status: 'Available',
        addons: [
            { id: 'a11', name: 'Exceeding 30 mins', defaultPrice: 500 },
            { id: 'a12', name: 'Addt\'l celebrator', defaultPrice: 1000 },
            { id: 'a13', name: 'HMUA', defaultPrice: 2000 },
        ]
    }
];

const mockStaff = [
    { 
        id: 'STF-001',
        name: 'Jordan Smith', 
        email: 'jordan@dreamsnap.com',
        role: 'Senior Photographer',
        access: 'Admin',
        status: 'Active',
        availability: 'full-time' 
    },
    { 
        id: 'STF-002',
        name: 'Elena Rodriguez', 
        email: 'elena@dreamsnap.com',
        role: 'Photographer',
        access: 'Editor',
        status: 'Active',
        availability: 'part-time' 
    },
    { 
        id: 'STF-003',
        name: 'Marcus Thompson', 
        email: 'marcus@dreamsnap.com',
        role: 'Videographer',
        access: 'Staff',
        status: 'Active',
        availability: 'full-time' 
    },
    { 
        id: 'STF-004',
        name: 'Sarah Chen', 
        email: 'sarah@dreamsnap.com',
        role: 'Event Coordinator',
        access: 'Staff',
        status: 'Active',
        availability: 'part-time' 
    },
    { 
        id: 'STF-005',
        name: 'David Park', 
        email: 'david@dreamsnap.com',
        role: 'Editor',
        access: 'Viewer',
        status: 'Away',
        availability: 'full-time' 
    },
    { 
        id: 'STF-006',
        name: 'Lisa Wong', 
        email: 'lisa@dreamsnap.com',
        role: 'Assistant',
        access: 'Viewer',
        status: 'Pending',
        availability: 'part-time' 
    }
];

const mockCustomers = [
    {
        id: 'CLT-882',
        name: 'Maria Santos',
        email: 'maria@email.com',
        loc: 'Manila',
        spend: '₱15,000',
        status: 'VIP',
        lastActive: '2024-03-01'
    },
    {
        id: 'CLT-883',
        name: 'John Doe',
        email: 'john@email.com',
        loc: 'Quezon City',
        spend: '₱8,500',
        status: 'Regular',
        lastActive: '2024-02-28'
    },
    {
        id: 'CLT-884',
        name: 'Anna Reyes',
        email: 'anna@email.com',
        loc: 'Makati',
        spend: '₱3,000',
        status: 'New',
        lastActive: '2024-03-04'
    },
    {
        id: 'CLT-885',
        name: 'Carlos Martinez',
        email: 'carlos@email.com',
        loc: 'Pasig',
        spend: '₱12,000',
        status: 'VIP',
        lastActive: '2024-02-25'
    },
    {
        id: 'CLT-886',
        name: 'Michelle Tan',
        email: 'michelle@email.com',
        loc: 'Taguig',
        spend: '₱5,500',
        status: 'Regular',
        lastActive: '2024-03-02'
    },
    {
        id: 'CLT-887',
        name: 'Robert Cruz',
        email: 'robert@email.com',
        loc: 'Caloocan',
        spend: '₱2,000',
        status: 'New',
        lastActive: '2024-03-03'
    }
];

const mockInquiries = [
    {
        id: 'INQ-101',
        name: 'Emma Wilson',
        source: 'instagram',
        service: 'Kids Dream Package',
        date: '2024-03-10',
        message: 'Hi! I would like to book the Kids Dream Package for my daughter\'s birthday.',
        status: 'new'
    },
    {
        id: 'INQ-102',
        name: 'Alex Johnson',
        source: 'facebook',
        service: 'Pre-Debut Dream',
        date: '2024-03-12',
        message: 'Interested in the Pre-Debut package. Do you have availability in April?',
        status: 'new'
    },
    {
        id: 'INQ-103',
        name: 'Sofia Garcia',
        source: 'whatsapp',
        service: 'Family Full',
        date: '2024-03-08',
        message: 'Can we schedule a family photoshoot next weekend?',
        status: 'replied',
        lastReply: 'Yes, we have slots available! I\'ll send you the details.'
    },
    {
        id: 'INQ-104',
        name: 'Michael Brown',
        source: 'instagram',
        service: 'Civil Wedding',
        date: '2024-03-15',
        message: 'Planning a civil wedding in May. Need photography coverage.',
        status: 'new'
    },
    {
        id: 'INQ-105',
        name: 'Isabella Lee',
        source: 'facebook',
        service: '7th Bday',
        date: '2024-03-07',
        message: 'My daughter will turn 7 this month. What packages do you offer?',
        status: 'read'
    },
    {
        id: 'INQ-106',
        name: 'Daniel Kim',
        source: 'whatsapp',
        service: 'Couple Full',
        date: '2024-03-09',
        message: 'Anniversary shoot for next month. Can you share your portfolio?',
        status: 'replied',
        lastReply: 'Congratulations! I\'ve sent our portfolio to your email.'
    },
    {
        id: 'INQ-107',
        name: 'Olivia Chen',
        source: 'instagram',
        service: 'Baptism w/ Bday',
        date: '2024-03-11',
        message: 'Combined baptism and birthday event. Need pricing details.',
        status: 'new'
    },
    {
        id: 'INQ-108',
        name: 'James Rodriguez',
        source: 'facebook',
        service: 'Kiddie Party',
        date: '2024-03-06',
        message: 'Looking for party coverage for my son\'s 5th birthday.',
        status: 'read'
    }
];

const mockTasks = [
    { id: 'T-90', title: 'Edit Wilson Family Photos', tag: 'Editing', time: '2h', status: 'To Do', priority: 'high' },
    { id: 'T-91', title: 'Prepare Maria Pre-Debut Album', tag: 'Album', time: '4h', status: 'To Do', priority: 'medium' },
    { id: 'T-92', title: 'Send Invoice to Johnson Family', tag: 'Finance', time: '30m', status: 'To Do', priority: 'high' },
    { id: 'T-93', title: 'Review Chen Wedding Booking', tag: 'Booking', time: '1h', status: 'To Do', priority: 'medium' },
    { id: 'T-94', title: 'Update Website Portfolio', tag: 'Marketing', time: '3h', status: 'To Do', priority: 'low' },
    { id: 'T-95', title: 'Color Grade Birthday Event', tag: 'Editing', time: '2.5h', status: 'In Progress', priority: 'high' },
    { id: 'T-96', title: 'Finalize Santos Album Layout', tag: 'Album', time: '2h', status: 'In Progress', priority: 'medium' },
    { id: 'T-97', title: 'Call Supplier for Props', tag: 'Logistics', time: '30m', status: 'In Progress', priority: 'medium' },
    { id: 'T-98', title: 'Update Social Media Content', tag: 'Marketing', time: '1.5h', status: 'In Progress', priority: 'low' },
    { id: 'T-99', title: 'Process Lee Family Payment', tag: 'Finance', time: '15m', status: 'In Progress', priority: 'high' },
    { id: 'T-100', title: 'Review Garcia Photos', tag: 'QA', time: '1h', status: 'Reviewing', priority: 'high' },
    { id: 'T-101', title: 'Client Approval - Martinez', tag: 'Client', time: '30m', status: 'Reviewing', priority: 'medium' },
    { id: 'T-102', title: 'Final Check - Reyes Album', tag: 'Album', time: '45m', status: 'Reviewing', priority: 'medium' },
    { id: 'T-103', title: 'Quality Check - Kim Couple Shoot', tag: 'QA', time: '1h', status: 'Reviewing', priority: 'low' },
    { id: 'T-104', title: 'Delivered Johnson Photos', tag: 'Delivery', time: '0h', status: 'Completed', priority: 'high' },
    { id: 'T-105', title: 'Archived Brown Wedding Files', tag: 'Admin', time: '0h', status: 'Completed', priority: 'low' },
    { id: 'T-106', title: 'Sent Smith Invoice', tag: 'Finance', time: '0h', status: 'Completed', priority: 'medium' },
    { id: 'T-107', title: 'Completed Wilson Shoot', tag: 'Photoshoot', time: '0h', status: 'Completed', priority: 'high' },
    { id: 'T-108', title: 'Updated Equipment Inventory', tag: 'Admin', time: '0h', status: 'Completed', priority: 'low' },
    { id: 'T-109', title: 'Posted Instagram Stories', tag: 'Marketing', time: '0h', status: 'Completed', priority: 'low' },
    { id: 'T-110', title: 'Confirmed Next Week Bookings', tag: 'Booking', time: '0h', status: 'Completed', priority: 'medium' },
    { id: 'T-111', title: 'Responded to Email Inquiries', tag: 'Customer Service', time: '0h', status: 'Completed', priority: 'medium' }
];

const mockHistory = [
    { id: 'BK-9021', customer: 'Maria Santos', service: 'Kids Dream Package', staff: 'Jordan Smith', amount: '₱5,000', status: 'Completed', date: '2024-02-28', time: '10:00 AM' },
    { id: 'BK-9022', customer: 'John Doe', service: 'Family Full', staff: 'Elena Rodriguez', amount: '₱4,200', status: 'Completed', date: '2024-02-27', time: '2:00 PM' },
    { id: 'BK-9023', customer: 'Anna Reyes', service: 'Pre-Debut Dream', staff: 'Marcus Thompson', amount: '₱5,200', status: 'Completed', date: '2024-02-26', time: '11:00 AM' },
    { id: 'BK-9024', customer: 'Carlos Martinez', service: 'Civil Wedding', staff: 'Jordan Smith', amount: '₱7,499', status: 'Completed', date: '2024-02-25', time: '9:00 AM' },
    { id: 'BK-9025', customer: 'Michelle Tan', service: 'Couple Full', staff: 'Sarah Chen', amount: '₱4,000', status: 'Refunded', date: '2024-02-24', time: '3:00 PM' },
    { id: 'BK-9026', customer: 'Robert Cruz', service: 'Basic Bday', staff: 'Elena Rodriguez', amount: '₱4,999', status: 'Completed', date: '2024-02-23', time: '1:00 PM' },
    { id: 'BK-9027', customer: 'Emma Wilson', service: '7th Bday', staff: 'Marcus Thompson', amount: '₱6,499', status: 'Completed', date: '2024-02-22', time: '10:30 AM' },
    { id: 'BK-9028', customer: 'Alex Johnson', service: 'Baptism', staff: 'Jordan Smith', amount: '₱5,499', status: 'Completed', date: '2024-02-21', time: '12:00 PM' },
    { id: 'BK-9029', customer: 'Sofia Garcia', service: 'Family Mini', staff: 'Sarah Chen', amount: '₱3,200', status: 'Completed', date: '2024-02-20', time: '4:00 PM' },
    { id: 'BK-9030', customer: 'Michael Brown', service: 'Kiddie Party', staff: 'Elena Rodriguez', amount: '₱4,499', status: 'Completed', date: '2024-02-19', time: '2:30 PM' },
    { id: 'BK-9031', customer: 'Isabella Lee', service: 'Couple Mini', staff: 'Marcus Thompson', amount: '₱2,500', status: 'Completed', date: '2024-02-18', time: '5:00 PM' }
];

// Helper function to add documents with custom IDs
async function seedCollection(collectionName, data, useCustomId = true) {
    console.log(`\nSeeding ${collectionName}...`);
    let successCount = 0;
    let errorCount = 0;

    for (const item of data) {
        try {
            const docData = { ...item };
            if (useCustomId) {
                delete docData.id; // Remove id from data, we'll use it as doc ID
            }
            
            docData.createdAt = serverTimestamp();
            docData.updatedAt = serverTimestamp();
            
            await addDoc(collection(db, collectionName), docData);
            successCount++;
            console.log(`  ✓ Added: ${item.id || item.name || item.title || 'document'}`);
        } catch (error) {
            errorCount++;
            console.error(`  ✗ Error adding ${item.id}:`, error.message);
        }
    }
    
    console.log(`${collectionName}: ${successCount} success, ${errorCount} errors`);
}

// Main seeding function
async function seedDatabase() {
    console.log('═══════════════════════════════════════════');
    console.log('  🌱 FIRESTORE DATABASE SEEDING SCRIPT');
    console.log('  Project: Dream & Snap Booking Management');
    console.log('═══════════════════════════════════════════');

    try {
        await seedCollection('services', mockServices);
        await seedCollection('staff', mockStaff);
        await seedCollection('customers', mockCustomers);
        await seedCollection('inquiries', mockInquiries);
        await seedCollection('tasks', mockTasks);
        await seedCollection('history', mockHistory);
        
        console.log('\n═══════════════════════════════════════════');
        console.log('  ✅ DATABASE SEEDING COMPLETED!');
        console.log('═══════════════════════════════════════════');
        console.log('\n📊 Summary:');
        console.log(`  • Services: ${mockServices.length} documents`);
        console.log(`  • Staff: ${mockStaff.length} documents`);
        console.log(`  • Customers: ${mockCustomers.length} documents`);
        console.log(`  • Inquiries: ${mockInquiries.length} documents`);
        console.log(`  • Tasks: ${mockTasks.length} documents`);
        console.log(`  • History: ${mockHistory.length} documents`);
        console.log(`\n  Total: ${mockServices.length + mockStaff.length + mockCustomers.length + mockInquiries.length + mockTasks.length + mockHistory.length} documents\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
