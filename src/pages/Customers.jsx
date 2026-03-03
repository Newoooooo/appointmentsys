import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, UserPlus, MapPin, CreditCard,
    MoreHorizontal, ChevronLeft, ChevronRight,
    Zap, Globe, Filter
} from 'lucide-react';
import clsx from 'clsx';

// --- DATA MOCK ---
const clientData = [
    { id: 'CLT-882', name: 'Sophia Chen', email: 'sophia.c@tech.io', loc: 'San Francisco, CA', spend: '$3,100', status: 'VIP', lastActive: '2h ago' },
    { id: 'CLT-883', name: 'Marcus Wright', email: 'm.wright@design.com', loc: 'New York, NY', spend: '$1,240', status: 'Regular', lastActive: '5h ago' },
    { id: 'CLT-884', name: 'Elena Rodriguez', email: 'elena.rod@studio.com', loc: 'Austin, TX', spend: '$850', status: 'New', lastActive: '1d ago' },
    { id: 'CLT-885', name: 'Jameson Locke', email: 'j.locke@unsc.gov', loc: 'Seattle, WA', spend: '$5,420', status: 'VIP', lastActive: '12m ago' },
];

const Customers = () => {
    return (
        <div className="h-screen max-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

            {/* --- COMMAND HEADER --- */}
            <header className="flex flex-nowrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 shrink-0 md:flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Client Registry..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button className="h-9 w-9 flex items-center justify-center border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#b1b1b1] hover:border-[#f87941] transition-all">
                        <Filter size={14} />
                    </button>
                    <button className="h-9 px-4 bg-[#f87941] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all">
                        <UserPlus size={14} strokeWidth={3} /> <span className="hidden md:inline">Add Client</span>
                    </button>
                </div>
            </header>

            {/* --- REGISTRY LIST --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
                {/* Column Labels */}
                <div className="px-8 flex items-center text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.3em] mb-2">
                    <span className="flex-1">Client Profile</span>
                    <span className="w-48 hidden md:block px-4">Geography</span>
                    <span className="w-36 hidden lg:block px-4 text-center">Value Index</span>
                    <span className="w-32 hidden lg:block text-right">Segment</span>
                    <span className="w-16 text-right"></span>
                </div>

                {clientData.map((client) => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[24px] p-4 flex items-center gap-6 hover:border-[#f87941] transition-all"
                    >
                        {/* 1. Identity */}
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[10px] font-black text-[#f87941] shrink-0 group-hover:bg-[#f87941] group-hover:text-white transition-colors">
                                {client.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="truncate">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[11px] font-black uppercase tracking-tight truncate">{client.name}</h3>
                                    <span className="text-[7px] font-black opacity-30 tracking-tighter hidden sm:inline">{client.id}</span>
                                </div>
                                <p className="text-[9px] text-[#b1b1b1] font-bold truncate">{client.email}</p>
                            </div>
                        </div>

                        {/* 2. Geography */}
                        <div className="w-48 hidden md:flex items-center gap-3 px-4 border-l border-[#f4f2f4] dark:border-white/5">
                            <Globe size={12} className="text-[#b1b1b1]" />
                            <div className="truncate">
                                <p className="text-[9px] font-black uppercase tracking-tight truncate">{client.loc}</p>
                                <p className="text-[7px] text-[#b1b1b1] font-bold uppercase tracking-widest">{client.lastActive}</p>
                            </div>
                        </div>

                        {/* 3. Value Index */}
                        <div className="w-36 hidden lg:flex flex-col items-center border-l border-[#f4f2f4] dark:border-white/5 px-4">
                            <div className="flex items-center gap-1.5">
                                <CreditCard size={10} className="text-[#f87941]" />
                                <span className="text-[11px] font-black tracking-tighter">{client.spend}</span>
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] mt-0.5">LTV Index</span>
                        </div>

                        {/* 4. Segment Status */}
                        <div className="w-32 hidden lg:flex justify-end border-l border-[#f4f2f4] dark:border-white/5 px-4">
                            <div className={clsx(
                                "px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest",
                                client.status === 'VIP' ? "border-[#f87941]/30 text-[#f87941] bg-[#f87941]/5" : "border-[#b1b1b1]/20 text-[#b1b1b1]"
                            )}>
                                {client.status}
                            </div>
                        </div>

                        {/* 5. Cmd */}
                        <div className="w-16 flex justify-end">
                            <button className="p-2 text-[#b1b1b1] hover:text-[#2f3035] dark:hover:text-white transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <footer className="mt-auto pt-4 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-[9px] font-black text-[#b1b1b1] uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <Zap size={10} className="text-[#f87941]" />
                        Active Registry: 1,204 Nodes
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] hover:border-[#f87941] transition-all">
                        <ChevronLeft size={14} />
                    </button>
                    {[1, 2, 3].map((page) => (
                        <button
                            key={page}
                            className={clsx(
                                "w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all",
                                page === 1 ? "bg-[#f87941] text-white shadow-lg shadow-[#f87941]/20" : "text-[#b1b1b1] hover:bg-[#f4f2f4] dark:hover:bg-white/5"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] hover:border-[#f87941] transition-all">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Customers;