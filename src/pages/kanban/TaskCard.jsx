import { Clock, GripVertical, AlertCircle } from "lucide-react";
import React from "react";
import Card from "../../components/ui/Card.jsx";
import clsx from "clsx";

export const TaskCard = ({ task }) => {
    // Priority specific styles
    const isHigh = task.priority === 'high';

    return (
        <Card
            whileTap={{ scale: 0.97 }}
            className="bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl p-4 space-y-4 group shadow-sm hover:border-[#F26389]/30 transition-all duration-300"
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {/* Tag with subtle priority indicator */}
                    <span className={clsx(
                        "text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-[0.15em] border transition-colors",
                        isHigh
                            ? "text-[#F26389] bg-[#F26389]/10 border-[#F26389]/20"
                            : "text-[#b1b1b1] bg-[#f4f2f4] dark:bg-white/5 border-transparent"
                    )}>
                        {task.tag}
                    </span>

                    {isHigh && (
                        <div className="flex items-center gap-1 text-[7px] font-black text-[#F26389] uppercase tracking-widest opacity-60">
                            <div className="w-1 h-1 rounded-full bg-[#F26389] animate-pulse" />
                            Priority
                        </div>
                    )}
                </div>
                <GripVertical size={12} className="text-[#b1b1b1] opacity-30 group-hover:opacity-100 transition-opacity cursor-grab" />
            </div>

            <div className="space-y-1">
                <h3 className="text-[11px] md:text-xs font-black uppercase tracking-tight leading-tight group-hover:text-[#F26389] transition-colors duration-300">
                    {task.title}
                </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#f4f2f4] dark:border-white/5 mt-1">
                <div className="flex items-center gap-3">
                    <p className="text-[8px] font-bold text-[#b1b1b1] uppercase flex items-center gap-1.5 tracking-wider">
                        <Clock size={10} className="text-[#F26389]/40" />
                        {task.time}
                    </p>
                </div>

                {/* ID with a subtle priority status dot */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-[#b1b1b1] opacity-20 tracking-tighter group-hover:opacity-40 transition-opacity">
                        {task.id}
                    </span>
                    <div className={clsx(
                        "w-1 h-1 rounded-full",
                        isHigh ? "bg-[#F26389]" : "bg-[#b1b1b1]/40"
                    )} />
                </div>
            </div>
        </Card>
    );
};