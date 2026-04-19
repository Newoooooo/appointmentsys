import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Camera, PencilLine, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export const ServiceCard = ({ service, onSelectService, onDeleteService, onEditService }) => {
    const { id, category, subcategory, title, basePrice, duration, status, icon: Icon, categoryColor } = service;
    const [isHovered, setIsHovered] = useState(false);

    const accentColor = categoryColor || '#F26389';

    const accentSoft = useMemo(() => {
        // Build a subtle tint for icon/action backgrounds.
        if (!/^#[0-9A-F]{6}$/i.test(accentColor)) {
            return 'rgba(242, 99, 137, 0.12)';
        }
        const r = parseInt(accentColor.slice(1, 3), 16);
        const g = parseInt(accentColor.slice(3, 5), 16);
        const b = parseInt(accentColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }, [accentColor]);

    const formatCurrency = (value) => {
        return `₱${value.toLocaleString()}`;
    };

    const handleClick = () => {
        if (onSelectService) {
            onSelectService(service);
        }
    };

    const handleDeleteClick = (event) => {
        event.stopPropagation();
        if (onDeleteService) {
            onDeleteService(service.id);
        }
    };

    const handleEditClick = (event) => {
        event.stopPropagation();
        if (onEditService) {
            onEditService(service);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/5 rounded-2xl p-4 md:p-5 flex items-center justify-between transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer"
            style={{
                borderLeft: `4px solid ${accentColor}`,
                borderColor: isHovered ? accentSoft : undefined
            }}
        >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-8 rounded-r-full transition-all duration-300" style={{ backgroundColor: accentColor }} />

            {/* Identity */}
            <div className="flex items-center gap-5 w-full md:w-[30%] min-w-0">
                <div
                    className="w-10 h-10 shrink-0 rounded-xl border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center transition-all duration-300"
                    style={{
                        color: isHovered ? '#FFFFFF' : accentColor,
                        backgroundColor: isHovered ? accentColor : accentSoft
                    }}
                >
                    {Icon ? <Icon size={18} strokeWidth={2} /> : <Camera size={18} strokeWidth={2} />}
                </div>
                <div className="min-w-0">
                    <span className="text-[7px] font-black tracking-[0.2em] uppercase block mb-0.5" style={{ color: accentColor }}>{id}</span>
                    <h3 className="text-[12px] font-black uppercase tracking-tight truncate transition-colors" style={{ color: isHovered ? accentColor : undefined }}>
                        {title}
                    </h3>
                    {subcategory && (
                        <span className="text-[8px] font-bold text-[#b1b1b1] uppercase tracking-wider">
                            {subcategory}
                        </span>
                    )}
                </div>
            </div>

            {/* Category */}
            <div className="hidden md:block w-[15%] text-center">
                <span 
                    className="text-[9px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wider inline-block"
                    style={{ 
                        backgroundColor: accentColor,
                        opacity: 0.85
                    }}
                >
                    {category}
                </span>
            </div>

            {/* Price */}
            <div className="hidden md:block w-[15%] text-center">
                <span className="text-xs font-black tracking-tight text-[#2f3035] dark:text-white">
                    {formatCurrency(basePrice)}
                </span>
            </div>

            {/* Duration */}
            <div className="hidden md:block w-[15%] text-center border-l border-[#f4f2f4] dark:border-white/5">
                <span className="text-xs font-black tracking-tight text-[#2f3035] dark:text-white">
                    {duration}
                </span>
            </div>

            {/* Status & Action */}
            <div className="flex items-center justify-end gap-4 w-auto md:w-[25%]">
                <div className={clsx(
                    "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hidden lg:block",
                    status === 'Available' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                )}>
                    {status}
                </div>
                <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 transition-all"
                    style={{
                        color: '#b1b1b1',
                        backgroundColor: isHovered ? accentSoft : 'transparent'
                    }}
                    aria-label={`Delete ${title}`}
                    title="Delete service"
                >
                    <Trash2 size={12} />
                </button>
                <button
                    type="button"
                    onClick={handleEditClick}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 transition-all"
                    style={{
                        color: accentColor,
                        backgroundColor: isHovered ? accentSoft : 'transparent'
                    }}
                    aria-label={`Edit ${title}`}
                    title="Edit service"
                >
                    <PencilLine size={12} />
                </button>
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                    style={{
                        color: isHovered ? accentColor : '#b1b1b1',
                        backgroundColor: isHovered ? accentSoft : 'transparent'
                    }}
                >
                    <ArrowUpRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};
