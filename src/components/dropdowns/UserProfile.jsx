import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import DropdownMenu from "../dropdowns/DropdownMenu.jsx";
import { useAuth } from '../../contexts/AuthContext.jsx';

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
    const { user, userProfile, signOut } = useAuth();

    const handleLogout = useCallback(async (e) => {
        e.stopPropagation();
        await signOut();
    }, [signOut]);

    const displayName = user?.displayName || userProfile?.displayName || 'User';
    const email = user?.email || '';
    const photoURL = user?.photoURL;
    const role = userProfile?.role === 'admin' ? 'Administrator' : userProfile?.role === 'staff' ? 'Staff' : '';

    return (
        <DropdownMenu
            width="w-72"
            align="right"
            className="rounded-2xl border-slate-200/60 dark:border-white/10 shadow-xl"
            trigger={
                <div className="flex items-center gap-3 p-1 group cursor-pointer">
                    <div className="hidden md:flex flex-col items-end leading-tight">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{displayName}</span>
                        {role && <span className="text-[11px] text-slate-400 font-medium">{role}</span>}
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 overflow-hidden border border-slate-200 dark:border-white/10 rounded-xl shadow-sm bg-white shrink-0"
                    >
                        {photoURL ? (
                            <img
                                src={photoURL}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                alt="Profile"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F26389]/10 text-[#F26389] font-black text-lg">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </motion.div>
                </div>
            }
        >
            {/* Header */}
            <div className="px-5 py-5 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-medium text-slate-400 mb-0.5">Signed in as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{email}</p>
            </div>

            {/* Links Section */}
            <div className="p-2 space-y-0.5">
                <MenuLink to="/settings" icon={User} label="My Profile" />
                <MenuLink to="/settings" icon={Settings} label="Preferences" />
                <MenuLink to="/integrations" icon={HelpCircle} label="Help & Support" />
            </div>

            {/* Footer */}
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