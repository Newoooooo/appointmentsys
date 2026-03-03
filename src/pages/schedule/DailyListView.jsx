import React from 'react';
import {motion} from 'framer-motion';;
import {DaySelector} from "./DaySelector.jsx";
import {TimelineSlot} from "./TimeLineSlot.jsx";


const DailyListView = ({activeDay, setActiveDay, fullWeek, hours, appointments, staffColors}) => {
    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            className="h-full no-scrollbar"
        >
            <DaySelector
                fullWeek={fullWeek}
                activeDay={activeDay}
                onSelectDay={setActiveDay}
            />

            <div className="space-y-0">
                {hours.map((hour) => (
                    <TimelineSlot
                        key={hour}
                        hour={hour}
                        appt={appointments.find(a => a.time === hour && a.day === activeDay)}
                        staffColor={staffColors[appointments.find(a => a.time === hour && a.day === activeDay)?.staff]}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default DailyListView;