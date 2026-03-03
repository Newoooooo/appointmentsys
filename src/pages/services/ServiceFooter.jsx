import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const ServiceFooter = ({ currentCount, totalCount }) => {
    return (
        <footer className="mt-auto pt-4 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="text-[9px] font-black text-[#b1b1b1] uppercase tracking-widest">
                <span className="hidden sm:inline">Showing {currentCount} of {totalCount} Services</span>
                <span className="sm:hidden">{currentCount} / {totalCount}</span>
            </div>

            <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] hover:border-[#f87941] transition-all">
                    <ChevronLeft size={14} />
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        className={clsx(
                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                            page === 1 ? "bg-[#f87941] text-white shadow-sm" : "text-[#b1b1b1] hover:bg-[#f4f2f4] dark:hover:bg-white/5"
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
    );
};

