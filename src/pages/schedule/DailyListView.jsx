import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DaySelector } from './DaySelector.jsx';
import { TimelineSlot } from './TimeLineSlot.jsx';

const SLOT_HEIGHT_PX = 56; // h-14 = 3.5rem = 56px
const SLOT_MINUTES = 30;
const DAY_START_MINUTES = 7 * 60; // 07:00

const toMinutes = (timeValue) => {
    if (!timeValue || !String(timeValue).includes(':')) return null;
    const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

const DailyListView = ({ activeDay, setActiveDay, fullWeek, hours, appointments, staffColors, onSlotClick, onAppointmentClick }) => {
    const [nowMinutes, setNowMinutes] = useState(() => {
        const n = new Date();
        return n.getHours() * 60 + n.getMinutes();
    });

    useEffect(() => {
        const tick = () => {
            const n = new Date();
            setNowMinutes(n.getHours() * 60 + n.getMinutes());
        };
        const id = setInterval(tick, 60_000);
        return () => clearInterval(id);
    }, []);

    const nowTopPx = ((nowMinutes - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
    const showNowLine = nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_START_MINUTES + hours.length * SLOT_MINUTES;

    // Build a lookup: slotMinutes → [ {appointment, slotSpan} ]
    const slotAppointmentsMap = useMemo(() => {
        const map = new Map();
        appointments.forEach((item) => {
            if (item.fullDate !== activeDay) return;
            const startMinutes = toMinutes(item.startTime || item.time);
            if (startMinutes === null) return;
            const endMinutes = toMinutes(item.endTime);
            const resolvedEnd = endMinutes ?? (startMinutes + (Number(item.durationMinutes) || 60));
            const slotSpan = Math.max(1, Math.ceil((resolvedEnd - startMinutes) / SLOT_MINUTES));
            if (!map.has(startMinutes)) map.set(startMinutes, []);
            map.get(startMinutes).push({ appointment: item, slotSpan });
        });
        return map;
    }, [appointments, activeDay]);

    // Build a set of occupied minute values for quick lookup
    const occupiedMinutesSet = useMemo(() => {
        const set = new Set();
        appointments.forEach((item) => {
            if (item.fullDate !== activeDay) return;
            const start = toMinutes(item.startTime || item.time);
            const end = toMinutes(item.endTime);
            if (start === null) return;
            const resolvedEnd = end ?? (start + (Number(item.durationMinutes) || 60));
            for (let m = start; m < resolvedEnd; m += SLOT_MINUTES) {
                set.add(m);
            }
        });
        return set;
    }, [appointments, activeDay]);

    const getAppointmentsStartingAtSlot = (hourValue) => {
        const slotMinutes = toMinutes(hourValue);
        if (slotMinutes === null) return [];
        return slotAppointmentsMap.get(slotMinutes) || [];
    };

    const isSlotOccupied = (hourValue) => {
        const slotMinutes = toMinutes(hourValue);
        if (slotMinutes === null) return false;
        return occupiedMinutesSet.has(slotMinutes);
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

            <div className="space-y-0 max-h-150 overflow-y-auto relative" style={{ position: 'relative' }}>
                {showNowLine && (
                    <div
                        className="absolute left-0 right-0 z-20 pointer-events-none"
                        style={{ top: `${nowTopPx}px` }}
                    >
                        <div className="flex items-center gap-1 ml-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                            <div className="flex-1 h-px bg-red-500" />
                        </div>
                    </div>
                )}

                {hours.map((hour) => {
                    const startingAppts = getAppointmentsStartingAtSlot(hour);
                    const occupied = isSlotOccupied(hour);

                    return (
                        <TimelineSlot
                            key={hour}
                            hour={hour}
                            day={activeDay}
                            appointments={startingAppts}
                            isOccupied={occupied}
                            onSlotClick={onSlotClick}
                            onAppointmentClick={onAppointmentClick}
                            staffColors={staffColors}
                        />
                    );
                })}
            </div>
        </motion.div>
    );
};

export default DailyListView;
