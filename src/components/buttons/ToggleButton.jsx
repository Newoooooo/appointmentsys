import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const ToggleButton = ({ options, value, onChange, className }) => {
    return (
        <div className={clsx("flex bg-[#f4f2f4] dark:bg-[#222] p-1 rounded-xl", className)}>
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={clsx(
                        "p-2 rounded-lg relative transition-colors",
                        value === option.id ? "text-[#2f3035] dark:text-white" : "text-[#b1b1b1]"
                    )}
                >
                    {value === option.id && (
                        <motion.div
                            layoutId="toggle-bg"
                            className="absolute inset-0 bg-white dark:bg-[#3f3f3f] rounded-lg shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {option.icon ? (
                        <option.icon size={18} strokeWidth={2.5} className="relative z-10" />
                    ) : (
                        <span className="relative z-10 text-[10px] font-black uppercase px-2">
                            {option.label}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ToggleButton;