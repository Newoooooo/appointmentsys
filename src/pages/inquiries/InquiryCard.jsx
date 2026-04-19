import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, MessageCircle, Globe } from 'lucide-react';
import clsx from 'clsx';

const SourceIcon = ({ source, size = 12 }) => {
    switch (source) {
        case 'instagram': return <Instagram size={size} className="text-pink-500" />;
        case 'facebook': return <Facebook size={size} className="text-blue-600" />;
        case 'whatsapp': return <MessageCircle size={size} className="text-emerald-500" />;
        default: return <Globe size={size} className="text-[#b1b1b1]" />;
    }
};

export const InquiryCard = ({ inq, isActive, onClick }) => (
    <motion.div
        key={inq.id}
        onClick={onClick}
        whileHover={{ x: 4 }}
        className={clsx(
            "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
            isActive
                ? "bg-white dark:bg-[#111] border-[#F26389] shadow-md shadow-[#F26389]/5"
                : "bg-transparent border-transparent hover:border-[#f4f2f4] dark:hover:border-white/10"
        )}
    >
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <SourceIcon source={inq.source} />
                <span className="text-[8px] font-black text-[#b1b1b1] uppercase tracking-widest">{inq.source}</span>
            </div>
            <span className="text-[8px] font-black opacity-30 tracking-widest">{inq.date}</span>
        </div>
        <h3 className={clsx(
            "text-xs font-black uppercase tracking-tight",
            isActive ? "text-[#F26389]" : "text-[#2f3035] dark:text-[#fdfcfc]"
        )}>{inq.name}</h3>
        <p className="text-[10px] text-[#b1b1b1] line-clamp-1 mt-1 font-medium italic opacity-70">"{inq.message}"</p>
    </motion.div>
);
