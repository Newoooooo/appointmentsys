export const BOOKING_STATUSES = {
  SCHEDULED: 'scheduled',
  PENDING_EDIT: 'pending_edit',
  RESCHEDULED: 'rescheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const STATUS_LABELS = {
  scheduled: 'Scheduled',
  pending_edit: 'Pending Edit',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const STATUS_COLORS = {
  scheduled: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  pending_edit: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  rescheduled: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
};

export const ACTIVE_STATUSES = [
  BOOKING_STATUSES.SCHEDULED,
  BOOKING_STATUSES.PENDING_EDIT,
  BOOKING_STATUSES.RESCHEDULED,
  BOOKING_STATUSES.COMPLETED,
];
