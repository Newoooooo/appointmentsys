import React from 'react';
import { motion } from 'framer-motion';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import SearchField from "../input/SearchField.jsx";
import NotificationSystem from "../notification/NotificationSystem.jsx";
import UserProfile from "../dropdowns/UserProfile.jsx";

export const TopBar = ({ isOpen, toggleSidebar }) => (
    <header className="sticky top-0 z-40 h-20 bg-[#fdfcfc] dark:bg-[#141414] px-6 md:px-10 flex items-center justify-between border-b border-[#e6e4e6] dark:border-[#282828]">
        <div className="flex items-center gap-6 flex-1 max-w-xl">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-2.5 bg-[#f4f2f4] dark:bg-[#282828] rounded-xl text-[#2f3035] dark:text-[#fdfcfc] hover:text-[#f87941] transition-colors shrink-0"
            >
                {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </motion.button>

            <SearchField
                variant="topbar"
                placeholder="Search everything..."
                className="hidden md:block w-full"
            />
        </div>

        <div className="flex items-center gap-4 md:gap-8 shrink-0">
           <NotificationSystem/>

            <UserProfile/>
        </div>
    </header>
);