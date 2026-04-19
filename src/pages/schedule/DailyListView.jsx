import React from 'react';
import { motion } from 'framer-motion';
import { DaySelector } from './DaySelector.jsx';
import { TimelineSlot } from './TimeLineSlot.jsx';

const DailyListView = ({ activeDay, setActiveDay, fullWeek, hours, appointments, staffColors, onSlotClick, onAppointmentClick }) => {
    const SLOT_MINUTES = 30;

    const toMinutes = (timeValue) => {
        if (!timeValue || !String(timeValue).includes(':')) return null;
        const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
        if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
        return hour * 60 + minute;
    };

    const getAppointmentAtSlot = (hourValue) => {
        const slotMinutes = toMinutes(hourValue);
        if (slotMinutes === null) {
            return { appointment: null, isContinuation: false, isOccupied: false, isStart: false, slotSpan: 1 };
        }

        const matching = appointments.find((item) => {
            if (item.fullDate !== activeDay) return false;
            const start = toMinutes(item.startTime || item.time);
            const end = toMinutes(item.endTime);
            if (start === null) return false;
            const resolvedEnd = end ?? (start + (Number(item.durationMinutes) || 60));
            return slotMinutes >= start && slotMinutes < resolvedEnd;
        });

        if (!matching) {
            return { appointment: null, isContinuation: false, isOccupied: false, isStart: false, slotSpan: 1 };
        }

        const startMinutes = toMinutes(matching.startTime || matching.time);
        const endMinutes = toMinutes(matching.endTime);
        const resolvedEnd = endMinutes ?? (startMinutes + (Number(matching.durationMinutes) || 60));
        const slotSpan = Math.max(1, Math.ceil((resolvedEnd - startMinutes) / SLOT_MINUTES));
        const isStart = slotMinutes === startMinutes;
        return {
            appointment: matching,
            isContinuation: slotMinutes !== startMinutes,
            isOccupied: true,
            isStart,
            slotSpan
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full no-scrollbar"
        >
            <DaySelector
                fullWeek={fullWeek}
                activeDay={activeDay}
                onSelectDay={setActiveDay}
            />

            <div className="space-y-0 max-h-150 overflow-y-auto">
                {hours.map((hour) => {
                    const slotState = getAppointmentAtSlot(hour);

                    return (
                        <TimelineSlot
                            key={hour}
                            hour={hour}
                            day={activeDay}
                            appt={slotState.appointment}
                            isContinuation={slotState.isContinuation}
                            isOccupied={slotState.isOccupied}
                            isStart={slotState.isStart}
                            slotSpan={slotState.slotSpan}
                            onSlotClick={onSlotClick}
                            onAppointmentClick={onAppointmentClick}
                            staffColor={staffColors[slotState.appointment?.staff]}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
};

export default DailyListView;
