import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

export const TimelineSlot = ({
    hour,
    day,
    appt,
    staffColor,
    onSlotClick,
    onAppointmentClick,
    isOccupied = false,
    isStart = false,
    slotSpan = 1
}) => (
    <div className="group flex gap-6 h-14">
        <div className="w-10 pt-2 shrink-0 text-right">
            <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter group-hover:opacity-100 transition-opacity">
                {hour.endsWith(':00') ? hour.split(':')[0] : ''}
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
            aria-label={`Add booking at ${hour}`}
        >
            <div
                className={clsx(
                    'absolute -left-1 top-2.5 w-2 h-2 rounded-full border-2 border-[#fdfcfc] dark:border-[#080808] transition-colors z-10',
                    isOccupied ? (staffColor?.bg || 'bg-[#F26389]') : 'bg-[#f4f2f4] dark:bg-white/10'
                )}
            />

            {appt && isStart ? (
                <div className="absolute left-8 right-0 top-1 z-10" style={{ height: `calc(${slotSpan} * 3.5rem - 0.25rem)` }}>
                    <AppointmentCard appt={appt} staffColor={staffColor} onClick={onAppointmentClick} />
                </div>
            ) : isOccupied ? (
                <div className="h-full" />
            ) : (
                <button
                    type="button"
                    className="h-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                >
                    <Plus size={10} strokeWidth={3} /> Slot Available
                </button>
            )}
        </div>
    </div>
);
