import React, {useMemo, useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, LayoutList
} from 'lucide-react';
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";
import {ServiceCard} from "./ServiceCard.jsx";
import {ServiceFooter} from "./ServiceFooter.jsx";
import AdminBookingModal from "../../components/AdminBookingModal.jsx";
import { ServiceService, BookingService } from "../../api/services.js";

const Services = () => {
    const [services, setServices] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    useEffect(() => {
        ServiceService.getServices().then(data => {
            setServices(data);
            setIsLoadingServices(false);
        });
    }, []);

    const filteredData = useMemo(() => {
        return services.filter(item => {
            const matchesFilter = filter === 'All' || item.category === filter;
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                                  item.subcategory?.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, search, services]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setModalOpen(true);
    };

    const handleBookingConfirm = async (bookingData) => {
        const result = await BookingService.createBooking(bookingData);
        if (result.success && result.appointment) {
            console.log('Booking created successfully:', result.appointment);
            // You can emit an event or call a callback to update the Schedules page
            // For now, we'll just show success in the UI
        }
        return result;
    };

    const categories = ['All', 'Studio', 'Event'];


    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans h-full">

            {/* --- HEADER --- */}
            <header className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Registry..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown
                        activeFilter={filter}
                        onSelect={setFilter}
                        options={categories}
                    />
                    <button className="h-10 w-10 bg-[#f87941] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all">
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                <div className="flex flex-col gap-2">
                    {/* Table Labels */}
                    <div className="hidden md:flex px-8 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">
                        <span className="w-[30%]">Service</span>
                        <span className="w-[15%] text-center">Category</span>
                        <span className="w-[15%] text-center">Unit Price</span>
                        <span className="w-[15%] text-center">Timeframe</span>
                        <span className="w-[25%] text-right">Status</span>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {isLoadingServices ? (
                            <div key="loading" className="py-8 text-center text-[#b1b1b1]">
                                <p className="text-[10px] font-bold uppercase">Loading services...</p>
                            </div>
                        ) : (
                            filteredData.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onSelectService={handleServiceSelect}
                                />
                            ))
                        )}
                    </AnimatePresence>

                    {/* New SKU Register Trigger */}
                    {!isLoadingServices && filteredData.length === 0 && (
                        <div key="empty" className="py-8 text-center text-[#b1b1b1]">
                            <p className="text-[10px] font-bold uppercase">No services found</p>
                        </div>
                    )}

                    {!isLoadingServices && (
                        <button className="group mt-2 py-4 border-2 border-dashed border-[#f4f2f4] dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[#b1b1b1] hover:border-[#f87941]/30 hover:text-[#f87941] transition-all">
                            <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Add Service</span>
                        </button>
                    )}
                </div>
            </div>

            {!isLoadingServices && <ServiceFooter currentCount={filteredData.length} totalCount={services.length}/>}

            {/* Admin Booking Modal */}
            <AdminBookingModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedService(null);
                }}
                service={selectedService}
                onConfirm={handleBookingConfirm}
            />
        </div>
    );
};

export default Services;