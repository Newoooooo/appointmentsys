import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, UsersRound, Bolt, Handshake,
    BookOpen, Kanban, MessageCircleQuestionMark, Blocks, BookUser, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/calendar", icon: Calendar, label: "Schedules" },
    { to: "/kanban", icon: Kanban, label: "Kanban" },
    { to: "/inquiries", icon: MessageCircleQuestionMark, label: "Inquiries" },
    { to: "/services", icon: Handshake, label: "Services" },
    { to: "/staff", icon: UsersRound, label: "Staff" },
    { to: "/customers", icon: BookUser, label: "Clients" },
    { to: "/history", icon: BookOpen, label: "History" },
    { to: "/integrations", icon: Blocks, label: "Integrations" },
    { to: "/settings", icon: Bolt, label: "Settings" },
];

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to}>
        {({ isActive }) => (
            <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-[#b1b1b1] dark:text-[#a1887d] hover:text-[#2f3035] dark:hover:text-[#fdfcfc]'}`}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-[#F26389] rounded-2xl shadow-lg shadow-[#F26389]/20 z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}
                <Icon size={20} className="shrink-0 z-10" />
                <span className="font-semibold tracking-tight text-[15px] z-10">{label}</span>
            </motion.div>
        )}
    </NavLink>
);

export const Sidebar = ({ isOpen }) => {
    const { signOut, user, userProfile } = useAuth();
    const displayName = user?.displayName || userProfile?.displayName || 'User';
    const role = userProfile?.role === 'admin' ? 'Administrator' : userProfile?.role === 'staff' ? 'Staff' : '';

    return (
        <motion.aside
            initial={false}
            animate={{ x: isOpen ? 0 : -280, width: isOpen ? 280 : 0 }}
            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
            className="fixed inset-y-0 left-0 bg-[#f4f2f4] dark:bg-[#1a1a1a] border-r border-[#e6e4e6] dark:border-[#282828] z-[60] overflow-hidden flex flex-col shadow-2xl lg:shadow-none"
        >
            <div className="p-6 w-[280px] flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shrink-0"
                    >
                        <img src="https://github.com/user-attachments/assets/d4760a11-755d-4ce8-85f1-cfd689d96cac" alt="Dream & Snap logo" className="w-full h-full object-cover" />
                    </motion.div>
                    <span className="text-xl font-black tracking-tighter text-[#2f3035] dark:text-[#fdfcfc]">Dream & Snap</span>
                </div>

                <nav className="space-y-2 relative flex-1">
                    {navItems.map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                </nav>

                {/* User info + Logout at bottom */}
                <div className="mt-6 pt-4 border-t border-[#e6e4e6] dark:border-[#282828]">
                    <div className="flex items-center gap-3 px-4 mb-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={displayName}
                                className="w-8 h-8 rounded-xl object-cover border border-[#e6e4e6] dark:border-white/10"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-[#F26389]/10 flex items-center justify-center text-[#F26389] font-black text-sm">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#2f3035] dark:text-[#fdfcfc] truncate">{displayName}</p>
                            {role && <p className="text-[10px] text-[#b1b1b1] uppercase tracking-widest font-black">{role}</p>}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={signOut}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors font-semibold text-[15px]"
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            </div>
        </motion.aside>
    );
};