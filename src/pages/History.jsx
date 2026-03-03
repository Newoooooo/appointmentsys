import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, Download, ArrowUpRight, Clock,
    User, ChevronLeft, ChevronRight, Hash, Calendar,
    CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import clsx from 'clsx';

// --- DATA MOCK ---
const historyData = [
    { id: 'BK-9021', customer: 'Oliver Twist', service: 'Deep Tissue', staff: 'Jordan S.', amount: '$120', status: 'Completed', date: 'MAY 12, 2026', time: '14:30' },
    { id: 'BK-9022', customer: 'Mila Kunis', service: 'Signature Facial', staff: 'Elena R.', amount: '$85', status: 'Refunded', date: 'MAY 12, 2026', time: '11:00' },
    { id: 'BK-9023', customer: 'Arthur Dent', service: 'Hot Stone', staff: 'Jordan S.', amount: '$150', status: 'Completed', date: 'MAY 11, 2026', time: '09:15' },
    { id: 'BK-9024', customer: 'Sarah Connor', service: 'Tech Support', staff: 'Alex P.', amount: '$200', status: 'Completed', date: 'MAY 11, 2026', time: '08:00' },
];

const HistoryView = () => {
    return (
        <div className="h-screen max-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

            {/* --- COMMAND HEADER --- */}
            <header className="flex flex-nowrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 shrink-0 md:flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Ledger..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button className="h-9 w-9 flex items-center justify-center border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#b1b1b1] hover:border-[#f87941] transition-all">
                        <Download size={14} />
                    </button>
                    <button className="h-9 px-4 bg-[#f87941] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all">
                        <FileText size={14} strokeWidth={3} /> <span className="hidden md:inline">Export Report</span>
                    </button>
                </div>
            </header>

            {/* --- LEDGER LIST --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
                {/* Column Labels */}
                <div className="px-8 flex items-center text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.3em] mb-2">
                    <span className="flex-1">Transaction Ref</span>
                    <span className="w-48 hidden md:block px-4">Operator</span>
                    <span className="w-36 hidden lg:block px-4 text-center">Value</span>
                    <span className="w-32 hidden lg:block text-right">Status</span>
                    <span className="w-16 text-right"></span>
                </div>

                {historyData.map((item, i) => (
                    <React.Fragment key={item.id}>
                        {/* Chronological Separator */}
                        {(i === 0 || historyData[i-1].date !== item.date) && (
                            <div className="flex items-center gap-4 px-4 py-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f87941] whitespace-nowrap">{item.date}</span>
                                <div className="h-px w-full bg-[#f4f2f4] dark:bg-white/5" />
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[24px] p-4 flex items-center gap-6 hover:border-[#f87941] transition-all"
                        >
                            {/* 1. Transaction Identity */}
                            <div className="flex-1 flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex flex-col items-center justify-center text-[#b1b1b1] shrink-0">
                                    <span className="text-[8px] font-black leading-none">{item.time}</span>
                                    <Clock size={10} className="mt-1" />
                                </div>
                                <div className="truncate">
                                    <h3 className="text-[11px] font-black uppercase tracking-tight truncate">{item.customer}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Hash size={10} className="text-[#f87941]" />
                                        <p className="text-[9px] text-[#b1b1b1] font-bold uppercase">{item.service} • {item.id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Operator / Staff */}
                            <div className="w-48 hidden md:flex items-center gap-3 px-4 border-l border-[#f4f2f4] dark:border-white/5">
                                <div className="w-6 h-6 rounded-lg bg-[#f4f2f4] dark:bg-white/5 flex items-center justify-center text-[8px] font-black">
                                    {item.staff.split(' ')[0][0]}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-tight">{item.staff}</p>
                                    <p className="text-[7px] text-[#b1b1b1] font-bold uppercase tracking-widest italic">Verified</p>
                                </div>
                            </div>

                            {/* 3. Value Column */}
                            <div className="w-36 hidden lg:flex flex-col items-center border-l border-[#f4f2f4] dark:border-white/5 px-4">
                                <span className="text-[12px] font-black tracking-tighter">{item.amount}</span>
                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] mt-0.5">Settlement</span>
                            </div>

                            {/* 4. Status */}
                            <div className="w-32 hidden lg:flex justify-end border-l border-[#f4f2f4] dark:border-white/5 px-4">
                                <div className={clsx(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
                                    item.status === 'Completed' ? "border-emerald-500/20 text-emerald-500" : "border-red-500/20 text-red-400"
                                )}>
                                    {item.status === 'Completed' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{item.status}</span>
                                </div>
                            </div>

                            {/* 5. Cmd */}
                            <div className="w-16 flex justify-end">
                                <button className="p-2 text-[#b1b1b1] hover:text-[#f87941] transition-colors">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </React.Fragment>
                ))}
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <footer className="mt-auto pt-4 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-[9px] font-black text-[#b1b1b1] uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <Calendar size={10} className="text-[#f87941]" />
                        Archive Span: Q2 2026
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

export default HistoryView;