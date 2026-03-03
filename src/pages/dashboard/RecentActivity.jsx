import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Clock, CreditCard, UserPlus, TrendingUp } from "lucide-react";
import Card from "../../components/ui/Card.jsx";

export const RecentActivity = ({ activities }) => {
    const getIcon = (type) => {
        switch(type) {
            case 'payment': return CreditCard;
            case 'client': return UserPlus;
            default: return TrendingUp;
        }
    };

    return (
        <div className="lg:col-span-6 space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Activity Log</h2>

                <Link
                    to="/activity?filter=recent"
                    className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#f87941] hover:opacity-80 transition-all"
                >
                    View All
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            <div className="space-y-2">
                {activities.map((act, i) => {
                    const Icon = getIcon(act.type);
                    return (
                        <Card key={i}
                              className="p-3.5 sm:p-4 rounded-xl border-[#f4f2f4] dark:border-white/10 group hover:border-[#f87941] transition-all bg-white dark:bg-[#111]"
                              hover={true}
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                {/* Minimalist Icon - Background removed */}
                                <div className="text-[#f87941]/60 group-hover:text-[#f87941] transition-colors shrink-0">
                                    <Icon size={16} strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Activity Message */}
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-[#2f3035] dark:text-white group-hover:text-[#f87941] transition-colors truncate">
                                            {act.message}
                                        </h4>

                                        {/* Amount or Timestamp on the right */}
                                        {act.amount ? (
                                            <span className="text-[11px] sm:text-xs font-black tracking-tighter text-emerald-500 shrink-0">
                                                +${act.amount}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-tighter shrink-0">
                                                <Clock size={10} strokeWidth={3} className="opacity-70" />
                                                {act.timestamp}
                                            </div>
                                        )}
                                    </div>

                                    {/* Type Label & Mobile Time */}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                            {act.type}
                                        </span>
                                        {act.amount && (
                                            <>
                                                <span className="text-[9px] text-gray-200 dark:text-gray-800">•</span>
                                                <span className="text-[8px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-tighter">
                                                    {act.timestamp}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Link to specific activity detail */}
                                <Link
                                    to={`/activity/${act.id || i}`}
                                    className="p-1.5 text-gray-200 dark:text-gray-700 group-hover:text-[#f87941] transition-all transform group-hover:translate-x-0.5 shrink-0"
                                >
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};