import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export const AppointmentCard = ({ appt, categoryColor, onClick }) => {
    const color = categoryColor || '#F26389';

    return (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(appt);
            }}
            className="h-full bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-2xl p-4 space-y-3 group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all max-w-2xl overflow-hidden relative"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
        >
            <div className="flex justify-between items-start">
                <span
                    className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest"
                    style={{ color, backgroundColor: `${color}18` }}
                >
                    {appt.category || appt.type}
                </span>
                <span className="text-[8px] font-black opacity-30">{appt.id}</span>
            </div>

            <h3 className="text-xs font-black uppercase tracking-tight leading-snug group-hover:transition-colors" style={{ color: undefined }}>
                {appt.name}
            </h3>

            <div className="flex items-center justify-between pt-3 border-t border-[#f4f2f4] dark:border-white/5">
                <p className="text-[8px] font-bold text-[#767676] dark:text-[#a0a0a0] uppercase flex items-center gap-1.5">
                    <Clock size={10} /> {(appt.startTime || appt.time)}{appt.endTime ? ` - ${appt.endTime}` : ''} • {appt.room}
                </p>
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>
                    {appt.staff?.split(' ')?.pop()}
                </span>
            </div>
        </motion.div>
    );
};