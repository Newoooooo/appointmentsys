import { SLOT_START_HOUR, SLOT_END_HOUR, SLOT_INTERVAL_MINUTES } from '../config/constants.js';

export const generateTimeSlots = () => {
  const slots = [];
  for (let m = SLOT_START_HOUR * 60; m < SLOT_END_HOUR * 60; m += SLOT_INTERVAL_MINUTES) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
};

export const timeToMinutes = (timeStr) => {
  if (!timeStr || !String(timeStr).includes(':')) return null;
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

export const minutesToTime = (totalMins) => {
  const v = Math.max(0, Math.min(23 * 60 + 59, Math.round(Number(totalMins) || 0)));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

export const formatTimeLabel = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
};
