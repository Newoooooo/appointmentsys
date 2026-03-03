import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Card from "../../components/ui/Card.jsx";

export const DailyAgenda = ({ schedule }) => {
    // Current date for filtering the full schedule view
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="lg:col-span-7 space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Daily Agenda</h2>

                <Link
                    to={`/bookings?date=${today}&view=day`}
                    className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#f87941] hover:opacity-80 transition-all"
                >
                    View All
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="space-y-2">
                {schedule.map((item, i) => (
                    <Card key={i}
                          className="p-0 rounded-xl border-[#f4f2f4] dark:border-white/10 group hover:border-[#f87941] flex items-stretch overflow-hidden bg-white dark:bg-[#111]"
                          hover={true}
                    >
                        {/* TIME GUTTER - Ultra clean */}
                        <div className="w-14 sm:w-16 bg-[#fdfcfc] dark:bg-[#0c0c0c] border-r border-[#f4f2f4] dark:border-white/10 flex flex-col items-center justify-center shrink-0 transition-colors group-hover:bg-[#f87941]/5">
                            <span className="text-base sm:text-lg font-black tracking-tighter text-[#2f3035] dark:text-white group-hover:text-[#f87941] transition-colors leading-none">
                                {item.time.split(':')[0]}
                            </span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {parseInt(item.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                            </span>
                        </div>

                        {/* MAIN CONTENT */}
                        <div className="flex-1 p-3.5 sm:p-4 flex items-center justify-between min-w-0 gap-3">
                            <div className="flex-1 min-w-0">
                                {/* Client Name */}
                                <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-[#2f3035] dark:text-white group-hover:text-[#f87941] transition-colors truncate mb-0.5">
                                    {item.client}
                                </h4>

                                {/* Service & Staff: Text-only metadata for speed-reading */}
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                        {item.service}
                                    </p>
                                    <span className="text-[9px] text-gray-200 dark:text-gray-800">•</span>
                                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest truncate">
                                        {item.staff}
                                    </p>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Minimalist Status Indicator */}
                                {item.status === 'Active' ? (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest hidden sm:inline">Active</span>
                                    </div>
                                ) : (
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest hidden sm:inline">{item.status}</span>
                                )}

                                <Link
                                    to={`/bookings/${item.id}`}
                                    className="p-1.5 text-gray-200 dark:text-gray-700 group-hover:text-[#f87941] transition-all transform group-hover:translate-x-0.5"
                                >
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};