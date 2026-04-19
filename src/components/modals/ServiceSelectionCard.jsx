import React, { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const formatCurrency = (value) => `\u20b1${Number(value || 0).toLocaleString()}`;

const toSoftRgba = (hex) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return 'rgba(242, 99, 137, 0.12)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
};

export const ServiceSelectionCard = ({ service, isSelected, onSelect }) => {
    const accentColor = service?.categoryColor || '#F26389';
    const softBg = useMemo(() => toSoftRgba(accentColor), [accentColor]);

    const subtitle = service?.subcategory || service?.category || 'Uncategorized';

    return (
        <button
            type="button"
            onClick={() => onSelect(service.id)}
            className="w-full text-left border rounded-2xl p-4 transition-all active:scale-[0.99] bg-white dark:bg-[#111]"
            style={{
                borderColor: isSelected ? accentColor : '#e5e7eb',
                boxShadow: isSelected ? `0 0 0 2px ${softBg}` : 'none'
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                        color: isSelected ? accentColor : '#9ca3af',
                        backgroundColor: isSelected ? softBg : 'transparent'
                    }}
                    aria-hidden="true"
                >
                    {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-tight text-[#2f3035] truncate">
                                {service.title}
                            </h4>
                            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                                {subtitle}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-black" style={{ color: accentColor }}>
                                {formatCurrency(service.basePrice)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {service.duration && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[#f3f4f6] text-[#4b5563]">
                                {service.duration}
                            </span>
                        )}
                        {service.category && (
                            <span
                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                                style={{ backgroundColor: softBg, color: accentColor }}
                            >
                                {service.category}
                            </span>
                        )}
                        {service.status && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[#f9fafb] text-[#9ca3af]">
                                {service.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};

export default ServiceSelectionCard;
