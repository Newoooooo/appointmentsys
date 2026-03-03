import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const DropdownMenu = ({
                          trigger,
                          children,
                          align = 'right',
                          width = 'sm:w-[420px]', // Increased default width for a "premium" feel
                          className,
                          closeOnInsideClick = false
                      }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const alignmentClasses = {
        left: 'left-0 origin-top-left',
        right: 'right-0 origin-top-right',
        center: 'left-1/2 -translate-x-1/2 origin-top'
    };

    return (
        <div className="relative inline-block" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={clsx(
                            "absolute mt-3 z-50",
                            // MOBILE: Full width minus padding
                            "w-[calc(100vw-2rem)] max-sm:left-4 max-sm:right-4",
                            // DESKTOP: Reset to the specific width prop (e.g., w-72)
                            "sm:w-auto sm:min-w-[18rem]",
                            width,
                            "max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:mx-auto",
                            "bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-xl", // Higher opacity for readability
                            "border border-slate-200 dark:border-white/10",
                            "rounded-[24px] shadow-2xl shadow-black/10 overflow-hidden",
                            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(DropdownMenu);