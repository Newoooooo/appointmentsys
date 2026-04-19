/**
 * api/services.js
 * Centralized Service Layer for the Booking System
 * Now integrated with Firebase Firestore
 */

import {
    getCollection,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    queryCollection,
    subscribeToCollection,
    serverTimestamp
} from './firestore';

const DEFAULT_DURATION_MINUTES = 60;

const parseDurationToMinutes = (durationValue) => {
    if (typeof durationValue === 'number' && Number.isFinite(durationValue) && durationValue > 0) {
        return Math.round(durationValue);
    }

    if (typeof durationValue !== 'string') return DEFAULT_DURATION_MINUTES;

    const trimmed = durationValue.trim().toLowerCase();
    if (!trimmed) return DEFAULT_DURATION_MINUTES;

    const numericMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
    if (!numericMatch) return DEFAULT_DURATION_MINUTES;

    const amount = Number.parseFloat(numericMatch[1]);
    if (!Number.isFinite(amount) || amount <= 0) return DEFAULT_DURATION_MINUTES;

    if (trimmed.includes('min')) {
        return Math.round(amount);
    }

    return Math.round(amount * 60);
};

const formatDurationLabel = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return '1 hour';

    if (minutes < 60) {
        return `${minutes} mins`;
    }

    const hours = minutes / 60;
    if (Number.isInteger(hours)) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    return `${hours.toFixed(1)} hours`;
};

const normalizeServiceRecord = (service = {}) => {
    const durationMinutes = Number.isFinite(service.durationMinutes)
        ? Number(service.durationMinutes)
        : parseDurationToMinutes(service.duration);

    const roundedDuration = Math.max(15, Math.round(durationMinutes / 15) * 15);

    return {
        ...service,
        durationMinutes: roundedDuration,
        duration: service.duration || formatDurationLabel(roundedDuration),
        slotSettings: {
            startHour: service.slotSettings?.startHour || '07',
            endHour: service.slotSettings?.endHour || '21',
            stepMinutes: service.slotSettings?.stepMinutes || 30,
            ...service.slotSettings
        }
    };
};

const toMinutes = (timeValue) => {
    if (typeof timeValue !== 'string' || !timeValue.includes(':')) return null;

    const [hourPart, minutePart] = timeValue.split(':');
    const hour = Number.parseInt(hourPart, 10);
    const minute = Number.parseInt(minutePart, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

const toTimeLabel = (totalMinutes) => {
    const bounded = Math.max(0, Math.min(23 * 60 + 59, Number(totalMinutes) || 0));
    const hour = Math.floor(bounded / 60);
    const minute = bounded % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// Legacy mock data for reference/seeding
export const MOCK_SERVICES = [
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

// === SERVICES ===
export const ServiceService = {
    async getServices() {
        try {
            const services = await getCollection('services');
            return (services || []).map(normalizeServiceRecord);
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },

    async getService(serviceId) {
        try {
            const service = await getDocument('services', serviceId);
            return service ? normalizeServiceRecord(service) : null;
        } catch (error) {
            console.error('Error fetching service:', error);
            throw error;
        }
    },

    async addService(serviceData) {
        try {
            const normalized = normalizeServiceRecord(serviceData);
            return await addDocument('services', normalized);
        } catch (error) {
            console.error('Error adding service:', error);
            throw error;
        }
    },

    async updateService(serviceId, serviceData) {
        try {
            const normalized = normalizeServiceRecord(serviceData);
            await updateDocument('services', serviceId, normalized);
            return { success: true, id: serviceId };
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    },

    async deleteService(serviceId) {
        try {
            await deleteDocument('services', serviceId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    }
};

// === BOOKINGS / APPOINTMENTS ===
export const BookingService = {
    async hasBookingConflict({ bookingId = null, date, staffId, startTime, endTime }) {
        if (!date || !staffId || !startTime || !endTime) return false;

        const startMinutes = toMinutes(startTime);
        const endMinutes = toMinutes(endTime);
        if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            return true;
        }

        const existingBookings = await queryCollection('bookings', [
            { field: 'date', operator: '==', value: date },
            { field: 'staffId', operator: '==', value: staffId }
        ]);

        return (existingBookings || []).filter((b) => {
            const s = (b.status || '').toLowerCase();
            return s !== 'cancelled' && s !== 'completed';
        }).some((booking) => {
            if (bookingId && booking.id === bookingId) return false;

            const bookingStart = toMinutes(booking.startTime || booking.time);
            const bookingEnd = toMinutes(booking.endTime);
            const fallbackEnd = bookingStart === null
                ? null
                : bookingStart + (Number(booking.durationMinutes) || DEFAULT_DURATION_MINUTES);
            const resolvedBookingEnd = bookingEnd ?? fallbackEnd;

            if (bookingStart === null || resolvedBookingEnd === null) return false;

            return startMinutes < resolvedBookingEnd && endMinutes > bookingStart;
        });
    },

    async createBooking(bookingData) {
        try {
            console.log('Creating booking...', bookingData);

            const serviceDuration = Number(bookingData.serviceDurationMinutes) || DEFAULT_DURATION_MINUTES;
            const startTime = bookingData.startTime || bookingData.time || '09:00';
            const providedEndMinutes = toMinutes(bookingData.endTime);
            const startMinutes = toMinutes(startTime);

            if (startMinutes === null) {
                throw new Error('Invalid booking start time');
            }

            const computedEndMinutes = providedEndMinutes && providedEndMinutes > startMinutes
                ? providedEndMinutes
                : startMinutes + serviceDuration;
            const endTime = toTimeLabel(computedEndMinutes);
            const durationMinutes = Math.max(15, computedEndMinutes - startMinutes);

            const hasOverlap = await this.hasBookingConflict({
                date: bookingData.date,
                staffId: bookingData.staffId,
                startTime,
                endTime
            });

            const booking = await addDocument('bookings', {
                ...bookingData,
                time: startTime,
                startTime,
                endTime,
                durationMinutes,
                type: bookingData.type || 'normal',
                status: bookingData.status || 'confirmed',
                createdAt: serverTimestamp()
            });
            
            return {
                success: true,
                hasOverlap,
                id: booking.id,
                appointment: {
                    id: booking.id,
                    name: bookingData.clientName,
                    staff: bookingData.staffName,
                    staffId: bookingData.staffId,
                    time: startTime,
                    startTime,
                    endTime,
                    day: bookingData.day,
                    date: bookingData.date,
                    room: bookingData.serviceTitle,
                    serviceId: bookingData.serviceId,
                    serviceTitle: bookingData.serviceTitle,
                    type: bookingData.type || 'normal',
                    totalPrice: bookingData.totalPrice,
                    durationMinutes,
                    selectedAddons: bookingData.selectedAddons,
                    clientContact: bookingData.clientContact
                }
            };
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    async getBookings() {
        try {
            return await getCollection('bookings');
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    async getBookingsByDate(date) {
        try {
            return await queryCollection('bookings', [
                { field: 'date', operator: '==', value: date }
            ]);
        } catch (error) {
            console.error('Error fetching bookings by date:', error);
            throw error;
        }
    },

    async getBookingsByDateRange(startDate, endDate) {
        try {
            const allBookings = await getCollection('bookings');
            // Filter in-memory since Firestore range queries are complex
            return allBookings.filter(booking => 
                booking.date >= startDate && booking.date <= endDate
            );
        } catch (error) {
            console.error('Error fetching bookings by date range:', error);
            throw error;
        }
    },

    async updateBooking(bookingId, bookingData) {
        try {
            await updateDocument('bookings', bookingId, bookingData);
            return { success: true, id: bookingId };
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    async extendBooking(bookingId, { newEndTime, actor, reason } = {}) {
        try {
            const booking = await getDocument('bookings', bookingId);
            if (!booking) throw new Error('Booking not found');

            const oldEndTime = booking.endTime;
            const startMinutes = toMinutes(booking.startTime || booking.time || '09:00');
            const newEndMinutes = toMinutes(newEndTime);

            if (newEndMinutes === null || startMinutes === null) {
                throw new Error('Invalid time value');
            }
            if (newEndMinutes <= startMinutes) {
                throw new Error('New end time must be after start time');
            }

            const newDurationMinutes = newEndMinutes - startMinutes;

            const hasOverlap = await this.hasBookingConflict({
                bookingId,
                date: booking.date,
                staffId: booking.staffId,
                startTime: booking.startTime || booking.time,
                endTime: newEndTime
            });

            await updateDocument('bookings', bookingId, {
                endTime: newEndTime,
                durationMinutes: newDurationMinutes,
                updatedAt: serverTimestamp()
            });

            await addDocument('bookingAudits', {
                bookingId,
                action: 'extended',
                oldEnd: oldEndTime,
                newEnd: newEndTime,
                actor: actor || 'system',
                reason: reason || '',
                timestamp: serverTimestamp()
            });

            return { success: true, hasOverlap, oldEndTime, newEndTime };
        } catch (error) {
            console.error('Error extending booking:', error);
            throw error;
        }
    },

    async deleteBooking(bookingId) {
        try {
            await deleteDocument('bookings', bookingId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    // Real-time subscription to bookings
    subscribeToBookings(callback) {
        return subscribeToCollection('bookings', callback, [], {
            orderByField: 'createdAt',
            orderDirection: 'desc'
        });
    }
};

// === STAFF ===
export const StaffService = {
    async getStaff() {
        try {
            return await getCollection('staff');
        } catch (error) {
            console.error('Error fetching staff:', error);
            throw error;
        }
    },

    async getStaffMember(staffId) {
        try {
            return await getDocument('staff', staffId);
        } catch (error) {
            console.error('Error fetching staff member:', error);
            throw error;
        }
    },

    async addStaffMember(staffData) {
        try {
            return await addDocument('staff', staffData);
        } catch (error) {
            console.error('Error adding staff member:', error);
            throw error;
        }
    },

    async updateStaffMember(staffId, staffData) {
        try {
            await updateDocument('staff', staffId, staffData);
            return { success: true, id: staffId };
        } catch (error) {
            console.error('Error updating staff member:', error);
            throw error;
        }
    },

    async deleteStaffMember(staffId) {
        try {
            await deleteDocument('staff', staffId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting staff member:', error);
            throw error;
        }
    }
};

// === CUSTOMERS ===
export const CustomerService = {
    async getCustomers() {
        try {
            return await getCollection('customers');
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    async getCustomer(customerId) {
        try {
            return await getDocument('customers', customerId);
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    },

    async addCustomer(customerData) {
        try {
            return await addDocument('customers', customerData);
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    },

    async updateCustomer(customerId, customerData) {
        try {
            await updateDocument('customers', customerId, customerData);
            return { success: true, id: customerId };
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    async deleteCustomer(customerId) {
        try {
            await deleteDocument('customers', customerId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }
};

// === INQUIRIES ===
export const InquiryService = {
    async getInquiries() {
        try {
            return await getCollection('inquiries');
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            throw error;
        }
    },

    async getInquiry(inquiryId) {
        try {
            return await getDocument('inquiries', inquiryId);
        } catch (error) {
            console.error('Error fetching inquiry:', error);
            throw error;
        }
    },

    async addInquiry(inquiryData) {
        try {
            return await addDocument('inquiries', {
                ...inquiryData,
                status: inquiryData.status || 'new'
            });
        } catch (error) {
            console.error('Error adding inquiry:', error);
            throw error;
        }
    },

    async updateInquiry(inquiryId, inquiryData) {
        try {
            await updateDocument('inquiries', inquiryId, inquiryData);
            return { success: true, id: inquiryId };
        } catch (error) {
            console.error('Error updating inquiry:', error);
            throw error;
        }
    },

    async updateInquiryStatus(inquiryId, status) {
        try {
            await updateDocument('inquiries', inquiryId, { status });
            return { success: true, id: inquiryId };
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            throw error;
        }
    },

    async replyToInquiry(inquiryId, reply) {
        try {
            await updateDocument('inquiries', inquiryId, {
                status: 'replied',
                lastReply: reply,
                repliedAt: serverTimestamp()
            });
            return { success: true, id: inquiryId };
        } catch (error) {
            console.error('Error replying to inquiry:', error);
            throw error;
        }
    },

    async deleteInquiry(inquiryId) {
        try {
            await deleteDocument('inquiries', inquiryId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            throw error;
        }
    },

    // Real-time subscription to inquiries
    subscribeToInquiries(callback) {
        return subscribeToCollection('inquiries', callback, [], {
            orderByField: 'createdAt',
            orderDirection: 'desc'
        });
    }
};

// === TASKS ===
export const TaskService = {
    async getTasks() {
        try {
            return await getCollection('tasks');
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    async getTask(taskId) {
        try {
            return await getDocument('tasks', taskId);
        } catch (error) {
            console.error('Error fetching task:', error);
            throw error;
        }
    },

    async addTask(taskData) {
        try {
            return await addDocument('tasks', {
                ...taskData,
                status: taskData.status || 'To Do'
            });
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    },

    async updateTask(taskId, taskData) {
        try {
            await updateDocument('tasks', taskId, taskData);
            return { success: true, id: taskId };
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    async updateTaskStatus(taskId, status) {
        try {
            await updateDocument('tasks', taskId, { status });
            return { success: true, id: taskId };
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },

    async deleteTask(taskId) {
        try {
            await deleteDocument('tasks', taskId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};

// === HISTORY / TRANSACTIONS ===
export const HistoryService = {
    async getHistory() {
        try {
            return await getCollection('history');
        } catch (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
    },

    async getHistoryByStatus(status) {
        try {
            return await queryCollection('history', [
                { field: 'status', operator: '==', value: status }
            ]);
        } catch (error) {
            console.error('Error fetching history by status:', error);
            throw error;
        }
    },

    async addHistoryRecord(historyData) {
        try {
            return await addDocument('history', historyData);
        } catch (error) {
            console.error('Error adding history record:', error);
            throw error;
        }
    },

    async updateHistoryRecord(historyId, historyData) {
        try {
            await updateDocument('history', historyId, historyData);
            return { success: true, id: historyId };
        } catch (error) {
            console.error('Error updating history record:', error);
            throw error;
        }
    }
};

// === DASHBOARD / ANALYTICS ===
export const DashboardService = {
    async getStats() {
        try {
            const [bookings, customers, inquiries, tasks] = await Promise.all([
                getCollection('bookings'),
                getCollection('customers'),
                getCollection('inquiries'),
                getCollection('tasks')
            ]);

            // Calculate statistics
            const totalBookings = bookings.length;
            const newCustomers = customers.filter(c => c.status === 'New').length;
            const pendingInquiries = inquiries.filter(i => i.status === 'new').length;
            const pendingTasks = tasks.filter(t => t.status === 'To Do' || t.status === 'In Progress').length;

            // Calculate total revenue
            const totalRevenue = bookings.reduce((sum, booking) => {
                const price = parseFloat(booking.totalPrice) || 0;
                return sum + price;
            }, 0);

            return {
                totalVolume: `₱${totalRevenue.toLocaleString()}`,
                newClients: newCustomers,
                avgRating: 4.8,
                pending: pendingInquiries + pendingTasks,
                totalBookings,
                pendingInquiries,
                pendingTasks
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getRecentActivity() {
        try {
            const [bookings, customers, history] = await Promise.all([
                getCollection('bookings'),
                getCollection('customers'),
                getCollection('history')
            ]);

            const activities = [];

            // Add recent bookings as activities
            bookings.slice(-5).forEach(booking => {
                activities.push({
                    id: `booking-${booking.id}`,
                    type: 'booking',
                    message: `New booking: ${booking.clientName || booking.name}`,
                    time: booking.createdAt || new Date(),
                    icon: '📅'
                });
            });

            // Add recent customers
            customers.slice(-3).forEach(customer => {
                activities.push({
                    id: `customer-${customer.id}`,
                    type: 'customer',
                    message: `New customer: ${customer.name}`,
                    time: customer.createdAt || new Date(),
                    icon: '👤'
                });
            });

            // Sort by time (most recent first)
            activities.sort((a, b) => {
                const timeA = a.time?.seconds ? new Date(a.time.seconds * 1000) : new Date(a.time);
                const timeB = b.time?.seconds ? new Date(b.time.seconds * 1000) : new Date(b.time);
                return timeB - timeA;
            });

            return activities.slice(0, 10);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    }
};

// === CATEGORIES ===
export const CategoryService = {
    async getCategories() {
        try {
            return await getCollection('categories');
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    async getCategory(categoryId) {
        try {
            return await getDocument('categories', categoryId);
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    },

    async addCategory(categoryData) {
        try {
            return await addDocument('categories', {
                ...categoryData,
                subcategories: categoryData.subcategories || []
            });
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    },

    async updateCategory(categoryId, categoryData) {
        try {
            await updateDocument('categories', categoryId, categoryData);
            return { success: true, id: categoryId };
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    async deleteCategory(categoryId) {
        try {
            await deleteDocument('categories', categoryId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    async subscribeToCategories(callback) {
        try {
            return subscribeToCollection('categories', callback);
        } catch (error) {
            console.error('Error subscribing to categories:', error);
            throw error;
        }
    }
};