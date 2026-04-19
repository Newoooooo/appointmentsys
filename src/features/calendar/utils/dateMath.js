export const formatLocalISO = (date) => {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const parseLocalISO = (s) => {
  if (!s || typeof s !== 'string') return null;
  const parts = s.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const startOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const isSameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isToday = (date) => isSameDay(date, new Date());

export const getWeekDays = (weekStart) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

export const getMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
};

export const formatMonthYear = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const formatFullDate = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const formatShortDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const resolveToLocalISO = (v) => {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return formatLocalISO(v.toDate());
  if (v instanceof Date) return formatLocalISO(v);
  if (typeof v === 'string') {
    const p = parseLocalISO(v);
    if (p) return formatLocalISO(p);
    const n = new Date(v);
    if (!Number.isNaN(n.getTime())) return formatLocalISO(n);
  }
  if (typeof v === 'number') {
    const n = new Date(v);
    if (!Number.isNaN(n.getTime())) return formatLocalISO(n);
  }
  return null;
};
