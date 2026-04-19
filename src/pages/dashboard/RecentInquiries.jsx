import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import Card from "../../components/ui/Card.jsx";

const sourceStyles = {
    whatsapp: "text-emerald-500",
    instagram: "text-pink-500",
    facebook: "text-blue-500",
    default: "text-gray-400"
};

export const RecentInquiries = ({ inquiries }) => (
    <div className="lg:col-span-5 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Recent Inquiries</h2>

            {/* Link with Filter Parameter */}
            <Link
                to="/inquiries?view=recent&status=pending"
                className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#F26389] hover:opacity-80 transition-all"
            >
                View All
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>

        <div className="space-y-2">
            {inquiries.map((iq, i) => (
                <Card key={i}
                      className="p-3.5 sm:p-4 rounded-xl border-[#f4f2f4] dark:border-white/10 group hover:border-[#F26389] transition-all bg-white dark:bg-[#111]"
                      hover={true}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {/* Top line: Name, Source & Time */}
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-tight text-[#2f3035] dark:text-white group-hover:text-[#F26389] transition-colors truncate">
                                        {iq.name}
                                    </h4>
                                    <span className={clsx(
                                        "text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-white/5",
                                        sourceStyles[iq.source?.toLowerCase()] || sourceStyles.default
                                    )}>
                                        {iq.source || 'Web'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-tighter shrink-0">
                                    <Clock size={10} strokeWidth={3} className="opacity-70" />
                                    {iq.timeAgo}
                                </div>
                            </div>

                            {/* Message line */}
                            <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-normal line-clamp-1">
                                {iq.message || "No message content provided..."}
                            </p>
                        </div>

                        {/* Action Link */}
                        <Link
                            to={`/inquiries/${iq.id || i}`}
                            className="p-1 text-gray-200 dark:text-gray-600 group-hover:text-[#F26389] transition-all transform group-hover:translate-x-0.5 shrink-0"
                        >
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);