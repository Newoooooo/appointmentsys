import { addDocument, queryCollection, serverTimestamp } from '../../../api/firestore.js';
import { PENDING_EDIT_TASK_DAYS } from '../config/constants.js';

const COL = 'tasks';

export const CalendarTaskService = {
  async createPendingEditTask(booking) {
    // Prevent duplicates: skip if a pending_edit task already exists for this booking
    const existing = await queryCollection(COL, [
      { field: 'bookingId', operator: '==', value: booking.id },
      { field: 'type', operator: '==', value: 'pending_edit' },
    ]);
    if (existing.length > 0) {
      return existing[0];
    }

    // Base the deadline on the appointment's own date, not today
    const base = booking.fullDate
      ? new Date(`${booking.fullDate}T00:00:00`)
      : new Date();
    const dueAt = new Date(base);
    dueAt.setDate(dueAt.getDate() + PENDING_EDIT_TASK_DAYS);
    return addDocument(COL, {
      title: `Edit photos: ${booking.clientName || 'Client'} — ${booking.date}`,
      description: `Pending edit for booking. Service: ${booking.serviceTitle || 'N/A'}. Client: ${booking.clientName || 'N/A'}.`,
      bookingId: booking.id,
      type: 'pending_edit',
      status: 'pending',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      dueAt: dueAt.toISOString(),
      createdAt: serverTimestamp(),
    });
  },
};
