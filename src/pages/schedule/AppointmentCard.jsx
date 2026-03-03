import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

export const AppointmentCard = ({ appt, staffColor }) => (
    <motion.div
        whileHover={{ x: 4 }}
        className="bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-2xl p-4 space-y-3 group cursor-grab shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all max-w-2xl"
    >
        <div className="flex justify-between items-start">
            <span className="text-[8px] font-black text-[#f87941] bg-[#f87941]/5 px-2 py-0.5 rounded uppercase tracking-widest">
                {appt.type}
            </span>
            <span className="text-[8px] font-black opacity-30">{appt.id}</span>
        </div>

        <h3 className="text-xs font-black uppercase tracking-tight leading-snug group-hover:text-[#f87941] transition-colors">
            {appt.name}
        </h3>

        <div className="flex items-center justify-between pt-3 border-t border-[#f4f2f4] dark:border-white/5">
            <p className="text-[8px] font-bold text-[#b1b1b1] uppercase flex items-center gap-1.5">
                <Clock size={10} /> {appt.time} • Room {appt.room}
            </p>
            <span className={clsx("text-[8px] font-black uppercase tracking-widest", staffColor?.text)}>
                {appt.staff}
            </span>
        </div>
    </motion.div>
);