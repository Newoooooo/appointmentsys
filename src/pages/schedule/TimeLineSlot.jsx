import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

const toAmPm = (time24) => {
    if (!time24 || !String(time24).includes(':')) return time24;
    const [hourStr, minute] = String(time24).split(':');
    const hour = Number.parseInt(hourStr, 10);
    if (Number.isNaN(hour)) return time24;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const h = hour % 12 || 12;
    return `${h}${minute === '00' ? '' : `:${minute}`} ${ampm}`;
};

export const TimelineSlot = ({
    hour,
    day,
    appointments = [],
    getCategoryColor,
    onSlotClick,
    onAppointmentClick,
    isOccupied = false,
}) => {
    const hasStarts = appointments.length > 0;
    const firstCategory = appointments[0]?.appointment?.category;
    const dotColor = firstCategory
        ? (getCategoryColor?.(firstCategory) || '#F26389')
        : null;

    return (
        <div className="group flex gap-6 h-14">
            <div className="w-14 pt-2 shrink-0 text-right pr-1">
                <span className="text-[9px] font-black opacity-20 uppercase tracking-tighter group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {hour.endsWith(':00') ? toAmPm(hour) : ''}
                </span>
            </div>

            <div
                className="flex-1 border-l border-[#f4f2f4] dark:border-white/5 pl-8 pb-2 relative cursor-pointer"
                onClick={() => {
                    if (!isOccupied) {
                        onSlotClick?.(day, hour);
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (!isOccupied) {
                            onSlotClick?.(day, hour);
                        }
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Add booking at ${toAmPm(hour)}`}
            >
                <div
                    className={clsx(
                        'absolute -left-1 top-2.5 w-2 h-2 rounded-full border-2 border-[#fdfcfc] dark:border-[#080808] transition-colors z-10'
                    )}
                    style={isOccupied && dotColor
                        ? { backgroundColor: dotColor }
                        : { backgroundColor: '#e5e3e5' }}
                />

                {hasStarts ? (() => {
                    const maxSpan = Math.max(...appointments.map((a) => a.slotSpan));
                    return (
                        <div
                            className="absolute left-8 right-0 top-1 z-10 flex gap-1"
                            style={{ height: `calc(${maxSpan} * 3.5rem - 0.25rem)` }}
                        >
                            {appointments.map(({ appointment, slotSpan }, idx) => (
                                <div
                                    key={appointment.id || idx}
                                    className="flex-1 min-w-0"
                                    style={{ height: `calc(${slotSpan} * 3.5rem - 0.25rem)` }}
                                >
                                    <AppointmentCard
                                        appt={appointment}
                                        categoryColor={getCategoryColor?.(appointment.category)}
                                        onClick={onAppointmentClick}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })() : isOccupied ? (
                    <div className="h-full" />
                ) : (
                    <button
                        type="button"
                        className="h-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#767676] dark:text-[#a0a0a0] opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                    >
                        <Plus size={10} strokeWidth={3} /> Slot Available
                    </button>
                )}
            </div>
        </div>
    );
};
