import { timeToMinutes } from './slotGenerator.js';
import { ACTIVE_STATUSES } from '../config/statuses.js';

export const getOverlapWarning = ({ bookings = [], date, staffId, startTime, endTime, excludeId = null }) => {
  if (!date || !staffId || !startTime || !endTime) return null;
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);
  if (newStart === null || newEnd === null || newEnd <= newStart) return null;

  const conflicts = bookings.filter((b) => {
    if (excludeId && b.id === excludeId) return false;
    if (b.date !== date || b.staffId !== staffId) return false;
    if (!ACTIVE_STATUSES.includes(b.status)) return false;
    const bStart = timeToMinutes(b.startTime || b.time);
    const bEnd = timeToMinutes(b.endTime) ?? (bStart !== null ? bStart + (Number(b.durationMinutes) || 60) : null);
    if (bStart === null || bEnd === null) return false;
    return newStart < bEnd && newEnd > bStart;
  });

  if (!conflicts.length) return null;
  const names = conflicts.map((b) => b.clientName || 'Unknown').join(', ');
  return `Overlap with: ${names}. You can still save — please verify.`;
};
