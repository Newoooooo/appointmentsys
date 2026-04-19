import React, { memo, forwardRef, useState } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const VARIANTS = {
    // --- PILL VARIANT (Absolute icon, Heavy tracking) ---
    pill: {
        wrapper: "relative w-full md:w-auto", // Removed hidden md:block
        input: "pl-14 pr-6 py-4 bg-white dark:bg-[#282828] border border-[#e6e4e6] dark:border-[#3f3835] rounded-[24px] text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#F26389] w-full md:w-64 transition-all placeholder:text-[#b1b1b1]",
        icon: "absolute left-6 top-1/2 -translate-y-1/2 text-[#b1b1b1]",
    },
    // --- HEADER VARIANT (Flex container, Ring focus) ---
    header: {
        wrapper: "flex-1 flex items-center bg-[#f4f2f4] dark:bg-[#1a1a1a] px-4 py-2.5 rounded-2xl gap-3 group transition-all focus-within:ring-2 focus-within:ring-[#F26389]/20",
        input: "bg-transparent border-none outline-none text-[11px] font-medium w-full placeholder:text-[#b1b1b1] placeholder:font-black placeholder:uppercase placeholder:tracking-widest",
        icon: "text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors",
    },
    topbar: {
        wrapper: "relative w-full group",
        input: "w-full bg-[#f4f2f4] dark:bg-[#1a1a1a] border border-transparent focus:border-[#e6e4e6] dark:focus:border-[#282828] py-2.5 pl-12 pr-16 rounded-xl text-sm focus:outline-none transition-all placeholder:text-[#b1b1b1] font-medium",
        icon: "absolute left-4 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors",
    },
    minimal: {
        wrapper: "relative w-full",
        input: "w-full pl-10 py-2 border-b border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none text-sm",
        icon: "absolute left-2 top-1/2 -translate-y-1/2 text-gray-400",
    },
    expandable: {
        wrapper: "relative flex items-center justify-end",
        input: "bg-[#f4f2f4] dark:bg-[#1a1a1a] border-none py-2.5 pl-12 pr-4 rounded-xl text-sm focus:outline-none placeholder:text-[#b1b1b1] font-medium",
        icon: "absolute left-4 top-1/2 -translate-y-1/2 text-[#b1b1b1] z-10",
        mobileTrigger: "p-2.5 bg-[#f4f2f4] dark:bg-[#1a1a1a] rounded-xl text-[#b1b1b1] md:hidden"
    }
};

const SearchField = memo(forwardRef(({
                                         variant = "pill", // Set pill as default to match your provided snippet
                                         placeholder = "Search...",
                                         className,
                                         inputClassName,
                                         iconSize = 16,
                                         ...props
                                     }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const style = VARIANTS[variant] || VARIANTS.pill;

    // Handle Expandable structure
    if (variant === "expandable") {
        return (
            <div className={clsx(style.wrapper, className)}>
                <AnimatePresence mode="wait">
                    {!isExpanded ? (
                        <motion.button
                            key="search-trigger"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setIsExpanded(true)}
                            className={clsx(style.mobileTrigger)}
                        >
                            <Search size={iconSize} />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="search-input"
                            initial={{ width: 40, opacity: 0 }}
                            animate={{ width: "100%", opacity: 1 }}
                            exit={{ width: 40, opacity: 0 }}
                            className="relative flex items-center w-full md:w-auto"
                        >
                            <Search className={style.icon} size={iconSize} />
                            <input
                                ref={ref}
                                autoFocus
                                type="text"
                                placeholder={placeholder}
                                className={clsx(style.input, "w-full md:w-64", inputClassName)}
                                {...props}
                            />
                            <button onClick={() => setIsExpanded(false)} className="absolute right-3 p-1 text-[#b1b1b1] md:hidden">
                                <X size={14} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="hidden md:block relative">
                    <Search className={style.icon} size={iconSize} />
                    <input ref={ref} type="text" placeholder={placeholder} className={clsx(style.input, "w-64", inputClassName)} {...props} />
                </div>
            </div>
        );
    }

    // Standard structure (Pill, Header, Minimal, Topbar)
    return (
        <div className={clsx(style.wrapper, className)}>
            <Search
                className={style.icon}
                size={iconSize}
                aria-hidden="true"
            />
            <input
                ref={ref}
                type="text"
                placeholder={placeholder}
                spellCheck="false"
                className={clsx(style.input, inputClassName)}
                {...props}
            />
        </div>
    );
}));

SearchField.displayName = "SearchField";

export default SearchField;