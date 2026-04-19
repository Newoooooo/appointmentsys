import React from 'react';
import { motion } from 'framer-motion';
import {
    Search, Plus, ArrowUpRight, Database, Slack,
    Chrome, Globe, Settings2,
    TrendingUp, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

const integrationModules = [
    { id: 'MOD-001', name: 'Stripe', status: 'Connected', type: 'Financial', icon: Database, desc: 'Enterprise ledger & payment orchestration.', impact: 'Fast Payouts' },
    { id: 'MOD-002', name: 'Slack', status: 'Inactive', type: 'Social', icon: Slack, desc: 'Real-time notification stream for personnel.', impact: 'Team Sync' },
    { id: 'MOD-003', name: 'Chrome', status: 'Connected', type: 'Utility', icon: Chrome, desc: 'Two-way browser calendar synchronization.', impact: 'No Conflicts' },
    { id: 'MOD-004', name: 'Twilio', status: 'Connected', type: 'Comm', icon: Globe, desc: 'Automated SMS & Voice relay protocols.', impact: 'Auto-Remind' },
];

const IntegrationsPage = () => {
    return (
        /* Removed h-screen and overflow-hidden to resolve double scroll */
        <div className="min-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] font-sans">

            {/* --- STICKY COMMAND HEADER --- */}
            <header className="sticky top-0 z-50 bg-[#fdfcfc]/80 dark:bg-[#080808]/80 backdrop-blur-md px-4 lg:px-6 py-6 border-b border-[#f4f2f4] dark:border-white/5">
                <div className="flex flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 shrink-0 md:flex-1">
                        <div className="relative group min-w-[140px] md:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="Find Module..."
                                className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button className="h-9 w-9 flex items-center justify-center border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#b1b1b1] hover:border-[#F26389] transition-all">
                            <Settings2 size={14} />
                        </button>
                        <button className="h-9 px-4 bg-[#F26389] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#F26389]/20 active:scale-95 transition-all">
                            <Plus size={14} strokeWidth={3} /> <span className="hidden md:inline">Request API</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MODULE GRID --- */}
            <main className="p-4 lg:p-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {integrationModules.map((mod) => (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-6 flex flex-col group hover:border-[#F26389]/50 transition-all duration-300"
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#F26389] group-hover:scale-105 transition-transform duration-500">
                                        <mod.icon size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <span className="text-[8px] font-black text-[#F26389] uppercase tracking-[0.2em]">{mod.type} // {mod.id}</span>
                                        <h3 className="text-sm font-black uppercase tracking-tight mt-0.5">{mod.name}</h3>
                                    </div>
                                </div>
                                <div className={clsx(
                                    "px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                                    mod.status === 'Connected' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-[#b1b1b1]/20 text-[#b1b1b1]"
                                )}>
                                    {mod.status}
                                </div>
                            </div>

                            {/* Impact Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-6 text-[8px] font-black uppercase">
                                <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/5 rounded-xl p-3">
                                    <p className="text-[#b1b1b1] mb-1">Key Benefit</p>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                        <span>{mod.impact}</span>
                                    </div>
                                </div>
                                <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/5 rounded-xl p-3">
                                    <p className="text-[#b1b1b1] mb-1">Performance</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={10} className="text-[#F26389]" />
                                        <span>Optimized</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-[#b1b1b1] font-medium leading-relaxed italic mb-6 line-clamp-2">
                                "{mod.desc}"
                            </p>

                            <div className="mt-auto pt-5 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between">
                                <button className="text-[9px] font-black uppercase tracking-widest text-[#b1b1b1] hover:text-[#F26389] transition-colors">
                                    Learn More
                                </button>
                                <button className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    mod.status === 'Connected' ? "bg-[#f4f2f4] dark:bg-white/5 text-[#b1b1b1]" : "bg-[#F26389] text-white shadow-lg shadow-[#F26389]/20"
                                )}>
                                    {mod.status === 'Connected' ? 'Manage' : 'Connect'} <ArrowUpRight size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Placeholder Add */}
                    <button className="border-2 border-dashed border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-[#b1b1b1] hover:border-[#F26389]/50 hover:text-[#F26389] transition-all group">
                        <div className="w-12 h-12 rounded-full bg-[#f4f2f4] dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Marketplace</p>
                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-1">Acquire New Modules</p>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default IntegrationsPage;