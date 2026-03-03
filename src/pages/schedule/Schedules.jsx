import React, { useState} from 'react';
import {AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Calendar as CalendarIcon,
    LayoutList, LayoutDashboard, Download, Upload, Filter, ChevronDown, ArrowUpDown
} from 'lucide-react';
import clsx from 'clsx';
import DailyListView from "./DailyListView.jsx";
import WeeklyGridView from "./WeeklyGridView.jsx";
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";

const Schedules = () => {
    const [view, setView] = useState('day');
    const [activeDay, setActiveDay] = useState('12');
    const [appointments, setAppointments] = useState([
        { id: 'A-1', time: '10:00', name: 'Alex Johnson', room: 'R-02', day: '12', type: 'urgent', staff: 'Dr. Adams' },
        { id: 'A-2', time: '13:00', name: 'Sarah Smith', room: 'St-B', day: '12', type: 'normal', staff: 'Nurse Joy' },
        { id: 'A-3', time: '11:00', name: 'Mike Ross', room: 'Web', day: '13', type: 'normal', staff: 'Dr. Smith' },
    ]);
    
    const staffColors = {
        'Dr. Adams': { bg: 'bg-blue-500', border: 'border-blue-500/20', text: '#3b82f6' },
        'Nurse Joy': { bg: 'bg-emerald-500', border: 'border-emerald-500/20', text: '#10b981' },
        'Dr. Smith': { bg: 'bg-purple-500', border: 'border-purple-500/20', text: '#a855f7' },
        'Jordan Smith': { bg: 'bg-indigo-500', border: 'border-indigo-500/20', text: '#6366f1' },
        'Elena Rodriguez': { bg: 'bg-cyan-500', border: 'border-cyan-500/20', text: '#06b6d4' },
        'Marcus Thompson': { bg: 'bg-pink-500', border: 'border-pink-500/20', text: '#ec4899' },
        'Sarah Chen': { bg: 'bg-lime-500', border: 'border-lime-500/20', text: '#84cc16' },
    };

    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    const fullWeek = [
        { label: 'Sun', date: '11' }, { label: 'Mon', date: '12' },
        { label: 'Tue', date: '13' }, { label: 'Wed', date: '14' },
        { label: 'Thu', date: '15' }, { label: 'Fri', date: '16' },
        { label: 'Sat', date: '17' },
    ];

    // Function to add new appointments from bookings
    const addAppointment = (newAppointment) => {
        setAppointments(prev => [...prev, newAppointment]);
    };

    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6">
            <header className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative group flex-1 md:flex-none md:min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-9 pr-2 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>

                    <div className="flex bg-[#f4f2f4] dark:bg-[#111] p-1 rounded-xl border border-[#f4f2f4] dark:border-white/10 shrink-0">
                        <button onClick={() => setView('day')} className={clsx("p-1.5 rounded-lg transition-all", view === 'day' ? "bg-white dark:bg-white/10 shadow-sm text-[#f87941]" : "text-[#b1b1b1]")}>
                            <LayoutList size={14} />
                        </button>
                        <button onClick={() => setView('week')} className={clsx("p-1.5 rounded-lg transition-all", view === 'week' ? "bg-white dark:bg-white/10 shadow-sm text-[#f87941]" : "text-[#b1b1b1]")}>
                            <LayoutDashboard size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown
                        activeFilter="This Week"
                        align="right"
                        options={["This Week", "Last Week", "This Month"]}
                    />
                    <button className="h-9 w-9 bg-[#f87941] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#f87941]/20 shrink-0">
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <div className="flex-1 w-full max-w-full overflow-hidden relative min-h-[500px]">
                <AnimatePresence mode="wait">
                    {view === 'day' ? (
                        <DailyListView
                            key="day"
                            activeDay={activeDay}
                            setActiveDay={setActiveDay}
                            fullWeek={fullWeek}
                            hours={hours}
                            appointments={appointments}
                            staffColors={staffColors}
                        />
                    ) : (
                        <WeeklyGridView
                            key="week"
                            activeDay={activeDay}
                            fullWeek={fullWeek}
                            hours={hours}
                            appointments={appointments}
                            staffColors={staffColors}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Schedules;