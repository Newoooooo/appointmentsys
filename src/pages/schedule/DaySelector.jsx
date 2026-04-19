import clsx from 'clsx';

export const DaySelector = ({ fullWeek, activeDay, onSelectDay }) => (
    <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
        {fullWeek.map((day) => (
            <button
                key={day.fullDate}
                onClick={() => onSelectDay(day.fullDate)}
                className={clsx(
                    'flex-1 min-w-20 flex flex-col items-center py-3 rounded-2xl transition-all border',
                    activeDay === day.fullDate
                        ? 'bg-[#2f3035] dark:bg-[#F26389] border-[#2f3035] dark:border-[#F26389] text-white shadow-lg'
                        : 'bg-white dark:bg-[#111] border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1]'
                )}
            >
                <span className="text-[8px] font-black uppercase tracking-widest mb-1">{day.label}</span>
                <span className="text-sm font-black tracking-tighter">{day.dateNumber}</span>
            </button>
        ))}
    </div>
);
