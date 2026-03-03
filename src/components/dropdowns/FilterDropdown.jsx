import React from 'react';
import { Filter, Check } from 'lucide-react';
import clsx from 'clsx';
import DropdownMenu from './DropdownMenu';

const FilterDropdown = ({ options, activeFilter, onSelect, align = "right" }) => {
    const isActive = activeFilter !== 'all';

    return (
        <DropdownMenu
            width="w-72"
            align={align}
            className="rounded-2xl border-slate-200/60 dark:border-white/10 shadow-xl"
            trigger={
                <button className={clsx(
                    "p-2.5 rounded-xl border transition-all relative",
                    isActive
                        ? 'border-[#f87941] text-[#f87941] bg-[#f87941]/5'
                        : 'border-[#e6e4e6] dark:border-white text-[#b1b1b1]'
                )}>
                    <Filter size={14} />
                    {isActive && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#f87941] rounded-full" />
                    )}
                </button>
            }
        >
            <div className="py-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onSelect(opt)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-[11px] font-black uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <span className={activeFilter === opt ? "text-[#f87941]" : "opacity-60"}>
                            {opt}
                        </span>
                        {activeFilter === opt && <Check size={14} className="text-[#f87941]" />}
                    </button>
                ))}
            </div>
        </DropdownMenu>
    );
};

export default FilterDropdown;