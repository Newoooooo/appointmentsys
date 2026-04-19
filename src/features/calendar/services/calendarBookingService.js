import {
  addDocument,
  updateDocument,
  getCollection,
  subscribeToCollection,
  serverTimestamp,
} from '../../../api/firestore.js';
import { BOOKING_STATUSES } from '../config/statuses.js';

const COL = 'bookings';

const appendAudit = (log = [], action, meta = {}) => [
  ...log,
  { action, timestamp: new Date().toISOString(), ...meta },
];

export const CalendarBookingService = {
  subscribe(callback) {
    return subscribeToCollection(COL, callback, [], {
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  },

  async _findById(id) {
    const all = await getCollection(COL);
    return all.find((d) => d.id === id) || null;
  },

  async create(data) {
    const auditLog = appendAudit([], 'created', { staffName: data.staffName });
    return addDocument(COL, {
      ...data,
      status: data.status || BOOKING_STATUSES.SCHEDULED,
      auditLog,
      createdAt: serverTimestamp(),
    });
  },

  async update(id, data) {
    const existing = await this._findById(id);
    const auditLog = appendAudit(existing?.auditLog || [], 'updated', { fields: Object.keys(data) });
    return updateDocument(COL, id, { ...data, auditLog });
  },

  async markPendingEdit(id, reason = '') {
    const existing = await this._findById(id);
    const auditLog = appendAudit(existing?.auditLog || [], 'pending_edit', { reason });
    return updateDocument(COL, id, { status: BOOKING_STATUSES.PENDING_EDIT, auditLog });
  },

  async reschedule(id, { newDate, newStartTime, newEndTime, durationMinutes, reason = '' }) {
    const existing = await this._findById(id);
    const auditLog = appendAudit(existing?.auditLog || [], 'rescheduled', {
      from: { date: existing?.date, startTime: existing?.startTime },
      to: { date: newDate, startTime: newStartTime },
      reason,
    });
    return updateDocument(COL, id, {
      date: newDate,
      startTime: newStartTime,
      time: newStartTime,
      endTime: newEndTime,
      durationMinutes: durationMinutes ?? existing?.durationMinutes,
      status: BOOKING_STATUSES.RESCHEDULED,
      rescheduleReason: reason,
      auditLog,
    });
  },

  async cancel(id, reason = '') {
    const existing = await this._findById(id);
    const auditLog = appendAudit(existing?.auditLog || [], 'cancelled', { reason });
    return updateDocument(COL, id, {
      status: BOOKING_STATUSES.CANCELLED,
      cancellationReason: reason,
      auditLog,
    });
  },

  async complete(id) {
    const existing = await this._findById(id);
    const auditLog = appendAudit(existing?.auditLog || [], 'completed', {});
    return updateDocument(COL, id, {
      status: BOOKING_STATUSES.COMPLETED,
      completedAt: new Date().toISOString(),
      auditLog,
    });
  },
};
