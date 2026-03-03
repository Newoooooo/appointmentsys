import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/navigation/Sidebar.jsx';
import { TopBar } from '../components/navigation/Topbar.jsx';

const AppLayout = () => {
    const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setIsOpen(true);
            else setIsOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) setIsOpen(false);
    }, [location]);

    return (
        <div className="flex min-h-screen bg-[#fdfcfc] dark:bg-[#141414] text-[#2f3035] dark:text-[#e6e4e6] transition-colors duration-300 font-sans overflow-hidden">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-[#2f3035]/50 z-[50] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <Sidebar isOpen={isOpen} />

            <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${isOpen ? 'lg:pl-[280px]' : 'lg:pl-0'}`}>
                <TopBar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
                <div className="flex-1 relative p-4 md:p-10 overflow-hidden flex flex-col">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;