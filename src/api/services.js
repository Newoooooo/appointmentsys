/**
 * api/services.js
 * Centralized Service Layer for the Booking System
 */

const BASE_URL = 'https://api.bookly-saas.com/v1';

// Simulated delay for realistic UI loading states
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
};

export const ServiceService = {
    async getServices() {
        await sleep(400);
        return [
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
            // Studio - Pre-Debut Dream
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
            // Studio - Pre-Debut Enchant
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
            // Studio - Pre-Debut Fantasy
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
            // Studio - Family Mini
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
            // Studio - Family Full
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
            // Studio - Adults/Couple Mini
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
            // Studio - Adults/Couple Full
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
            },
        ];
    }
};

export const BookingService = {
    // POST create a new booking
    async createBooking(bookingData) {
        console.log('API Call: Creating booking...', bookingData);
        await sleep(1200);
        const appointmentId = 'A-' + Math.random().toString(36).substr(2, 9);
        return {
            success: true,
            id: appointmentId,
            appointment: {
                id: appointmentId,
                name: bookingData.clientName,
                staff: bookingData.staffName,
                time: bookingData.time,
                day: bookingData.day,
                room: bookingData.serviceTitle,
                type: 'normal',
                totalPrice: bookingData.totalPrice,
                selectedAddons: bookingData.selectedAddons,
                clientContact: bookingData.clientContact
            }
        };
    },
};

export const StaffService = {
    async getStaff() {
        await sleep(600);
        return [
            { id: 1, name: 'Jordan Smith', availability: 'full-time' },
            { id: 2, name: 'Elena Rodriguez', availability: 'part-time' },
            { id: 3, name: 'Marcus Thompson', availability: 'full-time' },
            { id: 4, name: 'Sarah Chen', availability: 'part-time' }
        ];
    }
};