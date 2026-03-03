import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Lock, Globe, CreditCard, Blocks, MessageSquare,
    ArrowUpRight, Settings as SettingsIcon, Terminal,
    ShieldCheck
} from 'lucide-react';

const settingSections = [
    { id: 'SET-01', title: 'Business Profile', icon: Globe, desc: 'Manage public registry and studio metadata.', status: 'Public' },
    { id: 'SET-02', title: 'Security Protocol', icon: Lock, desc: 'Update passwords and 2FA authentication levels.', status: 'Secure' },
    { id: 'SET-03', title: 'Communications', icon: Bell, desc: 'Configure SMS and Email relay reminders.', status: 'Active' },
    { id: 'SET-04', title: 'Financial / Billing', icon: CreditCard, desc: 'Manage ledger subscription and invoice history.', status: 'Paid' },
    { id: 'SET-05', title: 'External Modules', icon: Blocks, desc: 'Sync with Google Calendar and external API nodes.', status: 'Syncing' },
    { id: 'SET-06', title: 'System Support', icon: MessageSquare, desc: 'Direct uplink to tech support and feature requests.', status: 'Online' },
];

const Settings = () => {
    return (
        /* Removed h-screen and overflow-hidden to kill the double scroll */
        <div className="min-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] font-sans">

            {/* --- STICKY COMMAND HEADER --- */}
            <header className="sticky top-0 z-10 bg-[#fdfcfc]/80 dark:bg-[#080808]/80 backdrop-blur-md px-4 lg:px-6 py-6 border-b border-[#f4f2f4] dark:border-white/5">
                <div className="flex flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 shrink-0 md:flex-1">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-[#f87941] uppercase tracking-[0.4em]">Configuration</p>
                            <h1 className="text-xl font-black uppercase tracking-tight">Core Settings</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button className="h-9 px-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#b1b1b1] hover:border-[#f87941] transition-all flex items-center gap-2">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Audit Log</span>
                        </button>
                        <button className="h-9 px-4 bg-[#f87941] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all">
                            <SettingsIcon size={14} /> <span className="hidden md:inline">Save Changes</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="p-4 lg:p-6 space-y-6">

                {/* Section: Modular Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {settingSections.map((section) => (
                        <motion.div
                            key={section.id}
                            whileHover={{ y: -2 }}
                            className="group bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-8 flex flex-col hover:border-[#f87941]/50 transition-all duration-300 min-h-[320px]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#b1b1b1] group-hover:text-[#f87941] transition-colors">
                                    <section.icon size={20} />
                                </div>
                                <span className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase">{section.id}</span>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-xs font-black uppercase tracking-widest">{section.title}</h3>
                                <p className="text-[10px] text-[#b1b1b1] font-medium leading-relaxed italic line-clamp-2">
                                    "{section.desc}"
                                </p>
                            </div>

                            <div className="mt-auto pt-5 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    {section.status}
                                </span>
                                <button className="p-2 text-[#b1b1b1] hover:text-[#f87941] transition-colors">
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section: Developer Portal */}
                <div className="bg-[#2f3035] dark:bg-[#111] rounded-[32px] p-10 border border-[#444] dark:border-white/10 relative overflow-hidden group">
                    {/* Decorative Background Icon */}
                    <Terminal className="absolute -right-4 -bottom-4 w-64 h-64 opacity-5 text-white pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">System Integrations & API</h3>
                            <p className="text-sm text-[#b1b1b1] max-w-2xl leading-relaxed">
                                Deploy custom hooks and manage authentication tokens for third-party node connections. Ensure all proprietary endpoints are secured via RSA-4096 protocols.
                            </p>
                        </div>
                        <button className="h-14 px-10 bg-[#f87941] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all whitespace-nowrap">
                            Launch Developer Hub
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;