import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, History } from 'lucide-react';
import DropdownMenu from "../dropdowns/DropdownMenu.jsx";

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Booking', body: 'Emma Richardson • Deep Tissue Session', time: '2m ago', unread: true },
        { id: 2, title: 'Message', body: 'Isabella Rossi sent an inquiry regarding color', time: '1h ago', unread: true },
    ]);

    const hasUnread = notifications.some(n => n.unread);

    const markAllRead = (e) => {
        // We removed e.stopPropagation() so clicking this can close the menu if desired,
        // or keep it if you prefer it open.
        setNotifications(n => n.map(x => ({ ...x, unread: false })));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <DropdownMenu
            width="sm:w-[420px]"
            trigger={
                <div className="relative p-2 group">
                    <motion.div
                        animate={hasUnread ? { rotate: [0, -15, 15, -15, 15, 0] } : { rotate: 0 }}
                        transition={{ repeat: hasUnread ? Infinity : 0, repeatDelay: 2, duration: 0.5 }}
                        className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                    >
                        <Bell size={20} strokeWidth={1.5} />
                    </motion.div>
                    <AnimatePresence>
                        {hasUnread && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f87941] rounded-full border-2 border-white dark:border-[#141414]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            }
        >
            {/* Header: Clean & Minimal */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#1c1c1c]">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Notifications</span>
                    <AnimatePresence>
                        {hasUnread && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="px-2 py-0.5 bg-[#f87941]/10 text-[#f87941] text-[10px] font-black rounded-full uppercase tracking-wider"
                            >
                                {notifications.filter(n => n.unread).length} New
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <History size={16} strokeWidth={1.5} />
                </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-white dark:bg-[#1c1c1c]">
                <AnimatePresence mode='popLayout'>
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <NotificationItem
                                key={n.id}
                                {...n}
                                onRemove={() => removeNotification(n.id)}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-16 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-3"
                        >
                            <CheckCircle2 size={40} strokeWidth={1} />
                            <p className="text-xs font-medium uppercase tracking-widest">Inbox Cleared</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: Primary Action replaces secondary link */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                <button
                    onClick={markAllRead}
                    disabled={!hasUnread}
                    className="w-full py-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#f87941] disabled:text-slate-400 hover:bg-[#f87941] hover:text-white dark:hover:text-white transition-all rounded-xl border border-dashed border-[#f87941]/30 disabled:border-slate-200 flex items-center justify-center gap-2"
                >
                    Mark All as Read
                </button>
            </div>
        </DropdownMenu>
    );
};

const NotificationItem = ({ title, body, time, unread, onRemove }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 py-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex gap-4 border-b border-slate-50 dark:border-white/2 last:border-0 group relative items-center"
        >
            {/* Status Indicator */}
            <div className="shrink-0">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${unread ? 'bg-[#f87941] shadow-[0_0_10px_rgba(248,121,65,0.4)] scale-110' : 'bg-slate-200 dark:bg-slate-800 scale-100'}`} />
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-[13px] font-bold truncate ${unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {title}
                    </p>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                        • {time}
                    </span>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-1">
                    {body}
                </p>
            </div>

            {/* Quick Remove: Centered Vertically */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all duration-200"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationSystem;