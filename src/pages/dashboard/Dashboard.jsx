import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import { DashboardStat } from "./DashboardStat.jsx";
import { DailyAgenda } from "./DailyAgenda.jsx";
import { DashboardService, BookingService, TaskService, InquiryService } from "../../api/services.js";

import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";
import {TaskSnapshot} from "./TaskSnapshot.jsx";
import {RecentActivity} from "./RecentActivity.jsx";
import {RecentInquiries} from "./RecentInquiries.jsx";

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Volume', value: '0', change: '+0%', icon: Activity, trend: 'up' },
        { label: 'New Clients', value: '0', change: '+0%', icon: Users, trend: 'up' },
        { label: 'Avg. Rating', value: '0', change: '+0%', icon: TrendingUp, trend: 'up' },
        { label: 'Pending', value: '0', change: '+0%', icon: Clock, trend: 'down' },
    ]);
    const [schedule, setSchedule] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
    
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Load stats
                const statsData = await DashboardService.getStats();
                setStats([
                    { label: 'Total Volume', value: statsData.totalVolume, change: '+12%', icon: Activity, trend: 'up' },
                    { label: 'New Clients', value: statsData.newClients.toString(), change: '+18%', icon: Users, trend: 'up' },
                    { label: 'Avg. Rating', value: statsData.avgRating.toString(), change: '+2%', icon: TrendingUp, trend: 'up' },
                    { label: 'Pending', value: statsData.pending.toString(), change: '-5%', icon: Clock, trend: 'down' },
                ]);
                
                // Load recent bookings for schedule
                const bookings = await BookingService.getBookings();
                const recentBookings = bookings.slice(0, 3).map(booking => ({
                    id: booking.id,
                    time: booking.time || '09:00',
                    client: booking.clientName || booking.name,
                    service: booking.serviceTitle || 'Service',
                    staff: booking.staffName || booking.staff,
                    status: 'Upcoming'
                }));
                setSchedule(recentBookings);
                
                // Load tasks
                const tasksData = await TaskService.getTasks();
                const formattedTasks = tasksData.slice(0, 3).map(task => ({
                    title: task.title,
                    priority: task.priority || 'Medium',
                    dueDate: task.time || 'Today',
                    completed: task.status === 'Completed'
                }));
                setTasks(formattedTasks);
                
                // Load recent activities
                const activitiesData = await DashboardService.getRecentActivity();
                setActivities(activitiesData);
                
                // Load recent inquiries
                const inquiriesData = await InquiryService.getInquiries();
                const formattedInquiries = inquiriesData.slice(0, 4).map(inq => ({
                    name: inq.name,
                    source: inq.source,
                    timeAgo: inq.date || '1h ago',
                    status: inq.status,
                    message: inq.message
                }));
                setInquiries(formattedInquiries);
                
                setIsLoadingDashboard(false);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setIsLoadingDashboard(false);
            }
        };
        
        loadDashboardData();
    }, []);
    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

            <header className="flex flex-nowrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 shrink-0 md:flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown
                        activeFilter="Today"
                        align="right"
                        options={["Today", "Yesterday", "This Week", "This Month"]}
                    />
                    <button className="h-9 px-4 bg-[#F26389] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#F26389]/20 active:scale-95 transition-all">
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