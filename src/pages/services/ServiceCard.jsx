import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';

export const ServiceCard = ({ service, onSelectService }) => {
    const { id, category, subcategory, title, basePrice, duration, status, icon: Icon } = service;

    const formatCurrency = (value) => {
        return `₱${value.toLocaleString()}`;
    };

    const handleClick = () => {
        if (onSelectService) {
            onSelectService(service);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="group relative bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/5 rounded-2xl p-4 md:p-5 flex items-center justify-between transition-all hover:shadow-xl hover:shadow-[#000]/5 hover:border-[#f87941]/20 cursor-pointer"
        >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 bg-[#f87941] rounded-r-full transition-all duration-300" />

            {/* Identity */}
            <div className="flex items-center gap-5 w-full md:w-[30%] min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#f87941] group-hover:bg-[#f87941] group-hover:text-white transition-all duration-300">
                    <Icon size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                    <span className="text-[7px] font-black text-[#f87941] tracking-[0.2em] uppercase block mb-0.5">{id}</span>
                    <h3 className="text-[12px] font-black uppercase tracking-tight truncate group-hover:text-[#f87941] transition-colors">
                        {title}
                    </h3>
                    {subcategory && (
                        <span className="text-[8px] font-bold text-[#b1b1b1] uppercase tracking-wider">
                            {subcategory}
                        </span>
                    )}
                </div>
            </div>

            {/* Category */}
            <div className="hidden md:block w-[15%] text-center">
                <span className="text-[9px] font-bold text-[#b1b1b1] border border-[#f4f2f4] dark:border-white/10 px-2 py-1 rounded-md uppercase tracking-wider">
                    {category}
                </span>
            </div>

            {/* Price */}
            <div className="hidden md:block w-[15%] text-center">
                <span className="text-xs font-black tracking-tight text-[#2f3035] dark:text-white">
                    {formatCurrency(basePrice)}
                </span>
            </div>

            {/* Duration */}
            <div className="hidden md:block w-[15%] text-center border-l border-[#f4f2f4] dark:border-white/5">
                <span className="text-xs font-black tracking-tight text-[#2f3035] dark:text-white">
                    {duration}
                </span>
            </div>

            {/* Status & Action */}
            <div className="flex items-center justify-end gap-4 w-auto md:w-[25%]">
                <div className={clsx(
                    "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hidden lg:block",
                    status === 'Available' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                )}>
                    {status}
                </div>
                <button className="w-9 h-9 flex items-center justify-center text-[#b1b1b1] hover:text-[#f87941] hover:bg-[#f87941]/5 rounded-xl transition-all">
                    <ArrowUpRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};
