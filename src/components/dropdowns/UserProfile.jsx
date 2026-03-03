import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import DropdownMenu from "../dropdowns/DropdownMenu.jsx";

const MenuLink = memo(({ to, icon: Icon, label }) => (
    <Link
        to={to}
        className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
    >
        <div className="flex items-center gap-3">
            <Icon size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-300" />
    </Link>
));

const UserProfile = () => {
    const handleLogout = useCallback((e) => {
        e.stopPropagation();
        console.log("Logging out...");
    }, []);

    return (
        <DropdownMenu
            width="w-72"
            align="right"
            className="rounded-2xl border-slate-200/60 dark:border-white/10 shadow-xl"
            trigger={
                <div className="flex items-center gap-3 p-1 group cursor-pointer">
                    <div className="hidden md:flex flex-col items-end leading-tight">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sarah Jenkins</span>
                        <span className="text-[11px] text-slate-400 font-medium">Administrator</span>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 overflow-hidden border border-slate-200 dark:border-white/10 rounded-xl shadow-sm bg-white shrink-0"
                    >
                        <img
                            src="https://i.pravatar.cc/150?u=sarah"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            alt="Profile"
                        />
                    </motion.div>
                </div>
            }
        >
            {/* Minimal Header */}
            <div className="px-5 py-5 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-medium text-slate-400 mb-0.5">Signed in as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">sarah.jenkins@bookly.io</p>
            </div>

            {/* Links Section */}
            <div className="p-2 space-y-0.5">
                <MenuLink to="/profile" icon={User} label="My Profile" />
                <MenuLink to="/settings" icon={Settings} label="Preferences" />
                <MenuLink to="/help" icon={HelpCircle} label="Help & Support" />
            </div>

            {/* Simple, Clean Footer */}
            <div className="p-2 mt-1 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
                >
                    <LogOut size={18} strokeWidth={1.5} />
                    <span className="text-sm font-semibold">Sign Out</span>
                </button>
            </div>
        </DropdownMenu>
    );
};

export default memo(UserProfile);