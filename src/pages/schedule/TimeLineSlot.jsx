import clsx from "clsx";
import { Plus } from "lucide-react";
import { AppointmentCard } from "./AppointmentCard";

export const TimelineSlot = ({ hour, appt, staffColor }) => (
    <div className="group flex gap-6 min-h-[80px]">
        {/* Time Gutter */}
        <div className="w-10 pt-2 shrink-0 text-right">
            <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter group-hover:opacity-100 transition-opacity">
                {hour.split(':')[0]}
            </span>
        </div>

        {/* Spine & Content Area */}
        <div className="flex-1 border-l border-[#f4f2f4] dark:border-white/5 pl-8 pb-6 relative">
            {/* Spine Dot */}
            <div className={clsx(
                "absolute -left-[4px] top-3 w-2 h-2 rounded-full border-2 border-[#fdfcfc] dark:border-[#080808] transition-colors z-10",
                appt ? staffColor?.bg : "bg-[#f4f2f4] dark:bg-white/10"
            )} />

            {appt ? (
                <AppointmentCard appt={appt} staffColor={staffColor} />
            ) : (
                <button className="h-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] opacity-0 group-hover:opacity-100 transition-all">
                    <Plus size={10} strokeWidth={3} /> Slot Available
                </button>
            )}
        </div>
    </div>
);