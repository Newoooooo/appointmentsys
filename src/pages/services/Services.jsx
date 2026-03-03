import React, {useMemo, useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Stethoscope, Camera, Briefcase, Scissors,
    ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";
import {ServiceCard} from "./ServiceCard.jsx";
import {ServiceFooter} from "./ServiceFooter.jsx";

const servicesData = [
    { id: 'SRV-001', category: 'Medical', title: 'Initial Dental Exam', billing: { rate: '$120' }, duration: '45m', status: 'Available', icon: Stethoscope },
    { id: 'SRV-002', category: 'Creative', title: 'Brand Campaign', billing: { rate: '$2,400' }, duration: '2w', status: 'Waitlist', icon: Camera },
    { id: 'SRV-003', category: 'Professional', title: 'Tax Consultation', billing: { rate: '$150/hr' }, duration: '60m', status: 'Available', icon: Briefcase },
    { id: 'SRV-004', category: 'Lifestyle', title: 'Signature Cut', billing: { rate: '$65' }, duration: '45m', status: 'Available', icon: Scissors },
];

const Services = () => {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filteredData = useMemo(() => {
        return servicesData.filter(item => {
            const matchesFilter = filter === 'All' || item.category === filter;
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, search]);


    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

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
                        options={["Medical", "Creative", "Professional", "Lifestyle"]}
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
                        {filteredData.map((service) => (
                            <ServiceCard key={service.id} service={service}/>
                        ))}
                    </AnimatePresence>

                    {/* New SKU Register Trigger */}
                    <button className="group mt-2 py-4 border-2 border-dashed border-[#f4f2f4] dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[#b1b1b1] hover:border-[#f87941]/30 hover:text-[#f87941] transition-all">
                        <Plus size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Add Service</span>
                    </button>
                </div>
            </div>

            <ServiceFooter currentCount={filteredData.length} totalCount={servicesData.length}/>
        </div>
    );
};

export default Services;