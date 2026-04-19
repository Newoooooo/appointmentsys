import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, LayoutList, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const VIEW_OPTIONS = [
  { value: 'month', label: 'Month', icon: Calendar },
  { value: 'week', label: 'Week', icon: LayoutDashboard },
  { value: 'day', label: 'Day', icon: LayoutList },
];

const CalendarToolbar = ({ view, onViewChange, label, onPrev, onNext, onAdd, selectedCategory, categories = [], onCategoryChange }) => (
  <header className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-[#f4f2f4] dark:border-white/5">
    <div className="flex items-center gap-2">
      <button type="button" onClick={onPrev} className="h-9 w-9 rounded-xl border border-[#e6e4e6] dark:border-white/10 text-[#b1b1b1] hover:border-[#F26389] hover:text-[#F26389] transition-all flex items-center justify-center" aria-label="Previous">
        <ChevronLeft size={14} />
      </button>
      <button type="button" onClick={onNext} className="h-9 w-9 rounded-xl border border-[#e6e4e6] dark:border-white/10 text-[#b1b1b1] hover:border-[#F26389] hover:text-[#F26389] transition-all flex items-center justify-center" aria-label="Next">
        <ChevronRight size={14} />
      </button>
      <div className="ml-1">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1]">{view} View</p>
        <p className="text-sm font-black tracking-tight text-[#2f3035] dark:text-white">{label}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <div className="flex bg-[#f4f2f4] dark:bg-[#111] p-1 rounded-xl border border-[#f4f2f4] dark:border-white/10">
        {VIEW_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onViewChange(value)}
            className={clsx('p-1.5 rounded-lg transition-all', view === value ? 'bg-white dark:bg-white/10 shadow-sm text-[#F26389]' : 'text-[#b1b1b1]')}
            title={value.charAt(0).toUpperCase() + value.slice(1)}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-9 px-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="h-9 w-9 bg-[#F26389] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#F26389]/20"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  </header>
);

export default CalendarToolbar;
