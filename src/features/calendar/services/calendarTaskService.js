import { addDocument, serverTimestamp } from '../../../api/firestore.js';
import { PENDING_EDIT_TASK_DAYS } from '../config/constants.js';

const COL = 'tasks';

export const CalendarTaskService = {
  async createPendingEditTask(booking) {
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
      status: 'To Do',
      priority: 'high',
      assignedTo: null,
      assignedToName: null,
      dueAt: dueAt.toISOString(),
      createdAt: serverTimestamp(),
    });
  },
};
