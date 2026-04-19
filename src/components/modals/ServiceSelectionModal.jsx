import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ServiceSelectionCard from './ServiceSelectionCard';

export const ServiceSelectionModal = ({
    isOpen,
    onClose,
    services,
    selectedServiceId,
    onConfirmSelection
}) => {
    const [search, setSearch] = useState('');
    const [pendingServiceId, setPendingServiceId] = useState(selectedServiceId || '');

    useEffect(() => {
        if (isOpen) {
            setPendingServiceId(selectedServiceId || '');
            setSearch('');
        }
    }, [isOpen, selectedServiceId]);

    const filteredServices = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return services;

        return services.filter((service) => {
            return (
                service.title?.toLowerCase().includes(query) ||
                service.category?.toLowerCase().includes(query) ||
                service.subcategory?.toLowerCase().includes(query)
            );
        });
    }, [services, search]);

    const selectedService = useMemo(
        () => services.find((service) => service.id === pendingServiceId) || null,
        [pendingServiceId, services]
    );

    const handleConfirm = () => {
        if (!pendingServiceId) return;
        onConfirmSelection(pendingServiceId);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-60 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50" />

                    <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[86vh] flex flex-col overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-[#f4f2f4] dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#2f3035] dark:text-white">Select a Service</h3>
                                <p className="text-[11px] text-[#9ca3af] mt-1">Tap any card to choose a package</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-[#f3f4f6] dark:hover:bg-white/10 transition-colors"
                                aria-label="Close service picker"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="px-5 py-3 border-b border-[#f4f2f4] dark:border-white/10">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by service, category, or package"
                                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e5e7eb] dark:border-white/10 bg-white dark:bg-[#0c0c0c] text-sm focus:outline-none focus:border-[#F26389]"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfd] dark:bg-[#0b0b0b]">
                            {filteredServices.length === 0 ? (
                                <div className="py-10 text-center text-[#9ca3af] text-sm font-bold uppercase tracking-wider">
                                    No services found
                                </div>
                            ) : (
                                filteredServices.map((service) => (
                                    <ServiceSelectionCard
                                        key={service.id}
                                        service={service}
                                        isSelected={pendingServiceId === service.id}
                                        onSelect={setPendingServiceId}
                                    />
                                ))
                            )}
                        </div>

                        <div className="px-5 py-4 border-t border-[#f4f2f4] dark:border-white/10 bg-white dark:bg-[#111]">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]">Selected</p>
                                <p className="text-xs font-black uppercase tracking-tight text-[#2f3035] dark:text-white truncate">
                                    {selectedService ? selectedService.title : 'None'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-10 rounded-xl border border-[#e5e7eb] dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-[#f9fafb] dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!pendingServiceId}
                                    className="flex-1 h-10 rounded-xl bg-[#F26389] text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-[#BF637C] transition-colors"
                                >
                                    Confirm Service
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ServiceSelectionModal;
