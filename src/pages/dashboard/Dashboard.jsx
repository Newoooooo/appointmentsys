import React from 'react';
import { Search, Plus, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import { DashboardStat } from "./DashboardStat.jsx";
import { DailyAgenda } from "./DailyAgenda.jsx";

import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";
import {TaskSnapshot} from "./TaskSnapshot.jsx";
import {RecentActivity} from "./RecentActivity.jsx";
import {RecentInquiries} from "./RecentInquiries.jsx";

const stats = [
    { label: 'Total Volume', value: '1,284', change: '+12%', icon: Activity, trend: 'up' },
    { label: 'New Clients', value: '142', change: '+18%', icon: Users, trend: 'up' },
    { label: 'Avg. Rating', value: '4.9', change: '+2%', icon: TrendingUp, trend: 'up' },
    { label: 'Pending', value: '24', change: '-5%', icon: Clock, trend: 'down' },
];

const schedule = [
    { id: 'BK-902', time: '09:00', client: 'Emma Richardson', service: 'Deep Tissue', staff: 'Marcus V.', status: 'Active' },
    { id: 'BK-903', time: '11:30', client: 'Liam Neeson', service: 'Beard Trim', staff: 'Sarah J.', status: 'Upcoming' },
    { id: 'BK-904', time: '14:15', client: 'Olivia Chen', service: 'Consultation', staff: 'Sarah J.', status: 'Upcoming' },
];

const tasks = [
    { title: 'Follow up with Emma R.', priority: 'High', dueDate: 'Today', completed: false },
    { title: 'Update Service Pricing', priority: 'Low', dueDate: 'Tomorrow', completed: true },
    { title: 'Sanitize Workstation B', priority: 'High', dueDate: '14:00', completed: false },
];

const activities = [
    { type: 'payment', message: 'Invoice #882 Paid', timestamp: '2 mins ago', amount: '120.00' },
    { type: 'client', message: 'New Client: Robert DeNiro', timestamp: '1 hour ago' },
    { type: 'system', message: 'Google Calendar Synced', timestamp: '3 hours ago' },
];

const inquiries = [
    {
        name: 'Alexander Pierce',
        source: 'facebook',
        timeAgo: '2 mins ago',
        status: 'new',
        message: 'Do you have availability for June 12th?'
    },
    {
        name: 'Sarah Jenkins',
        source: 'instagram',
        timeAgo: '1 hour ago',
        status: 'new',
        message: 'Looking to book a discovery call for next week.'
    },
    {
        name: 'Marcus V.',
        source: 'whatsapp',
        timeAgo: '3 hours ago',
        status: 'read',
        message: 'Need a quote for a group of 15 people.'
    },
    {
        name: 'Elena Rodriguez',
        source: 'facebook',
        timeAgo: '5 hours ago',
        status: 'new',
        message: 'Can I reschedule my existing inquiry to Friday?'
    },
];

const Dashboard = () => {
    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

            <header className="flex flex-nowrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 shrink-0 md:flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown
                        activeFilter="Today"
                        align="right"
                        options={["Today", "Yesterday", "This Week", "This Month"]}
                    />
                    <button className="h-9 px-4 bg-[#f87941] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all">
                        <Plus size={14} strokeWidth={3} /> <span className="hidden md:inline">Quick Booking</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-6 overscroll-contain">

                <DashboardStat stats={stats}/>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <DailyAgenda schedule={schedule}/>
                        <RecentInquiries inquiries={inquiries}/>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ">
                        <TaskSnapshot tasks={tasks}/>
                        <RecentActivity activities={activities}/>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;