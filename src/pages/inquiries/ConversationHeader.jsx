import React from 'react';
import { ChevronLeft as BackIcon, MoreHorizontal } from 'lucide-react';

export const ConversationHeader = ({ name, service, setView }) => (
    <div className="p-4 md:p-6 border-b border-[#f4f2f4] dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
            <button
                onClick={() => setView('list')}
                className="md:hidden p-2.5 bg-[#f4f2f4] dark:bg-white/5 rounded-xl text-[#F26389] active:scale-95 transition-transform"
            >
                <BackIcon size={22} strokeWidth={3} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#F26389]/10 flex items-center justify-center text-[#F26389] font-black text-sm">
                {name[0]}
            </div>

            <div>
                <h2 className="text-[11px] md:text-sm font-black uppercase tracking-tight leading-none">{name}</h2>
                <p className="text-[8px] font-bold text-[#b1b1b1] uppercase tracking-[0.2em] mt-1">{service}</p>
            </div>
        </div>
        <button className="p-2 text-[#b1b1b1]">
            <MoreHorizontal size={20} />
        </button>
    </div>
);
