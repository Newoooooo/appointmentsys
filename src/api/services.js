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

export const BookingService = {
    // GET all bookings with optional filtering
    async getBookings(params = {}) {
        await sleep(800); // Simulate network latency
        // In production: return fetch(`${BASE_URL}/bookings?${new URLSearchParams(params)}`).then(handleResponse);

        // Returning dummy data for development
        return [
            { id: 'BK-9021', customer: 'Oliver Twist', serviceId: 1, date: '2024-10-24', status: 'Confirmed' },
            // ... more items
        ];
    },

    // POST create a new booking
    async createBooking(bookingData) {
        console.log('API Call: Creating booking...', bookingData);
        await sleep(1200);
        return { success: true, id: Math.random().toString(36).substr(2, 9) };
    },

    // PATCH update booking status
    async updateStatus(id, status) {
        console.log(`API Call: Updating ${id} to ${status}`);
        await sleep(500);
        return { success: true };
    }
};

export const StaffService = {
    async getStaff() {
        await sleep(600);
        return [
            { id: 1, name: 'Jordan Smith', availability: 'full-time' },
            { id: 2, name: 'Elena Rodriguez', availability: 'part-time' }
        ];
    }
};