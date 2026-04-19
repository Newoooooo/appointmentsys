import React, {useMemo, useState, useEffect} from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Tags
} from 'lucide-react';
import {ServiceCard} from "./ServiceCard.jsx";
import {ServiceFooter} from "./ServiceFooter.jsx";
import AdminBookingModal from "../../components/AdminBookingModal.jsx";
import AddServiceModal from "../../components/modals/AddServiceModal.jsx";
import { CategoryManagementModal } from '../../components/modals/CategoryManagementModal.jsx';
import { ServiceService, BookingService, CategoryService } from "../../api/services.js";

const Services = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [categoryError, setCategoryError] = useState('');

    useEffect(() => {
        handleRefreshServices();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await CategoryService.getCategories();
            const sorted = (data || []).sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sorted);
            if (!activeCategory && sorted.length > 0) {
                setActiveCategory(sorted[0].name);
            }
        } catch (error) {
            setCategoryError(error.message || 'Failed to load categories');
        }
    };

    const handleRefreshServices = async () => {
        try {
            setIsLoadingServices(true);
            const data = await ServiceService.getServices();
            setServices(data || []);
        } finally {
            setIsLoadingServices(false);
        }
    };

    useEffect(() => {
        if (!activeCategory || activeCategory === 'All') return;
        if (!categories.some((category) => category.name === activeCategory)) {
            setActiveCategory(categories[0]?.name || '');
        }
    }, [activeCategory, categories]);

    const categoryTabs = useMemo(() => {
        const names = categories.map((category) => category.name).filter(Boolean);
        return ['All', ...names];
    }, [categories]);

    const filteredData = useMemo(() => {
        if (!activeCategory) return [];

        return services.filter(item => {
            const matchesFilter = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                                  item.subcategory?.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [activeCategory, search, services]);

    const activeAccentColor = useMemo(() => {
        if (!activeCategory || activeCategory === 'All') return '#F26389';

        const selectedCategoryData = categories.find((category) => category.name === activeCategory);
        return selectedCategoryData?.color || services.find(item => item.category === activeCategory)?.categoryColor || '#F26389';
    }, [activeCategory, categories, services]);

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

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            await ServiceService.deleteService(serviceId);
            setServices((prev) => prev.filter((service) => service.id !== serviceId));
        } catch (error) {
            alert(`Failed to delete service: ${error.message}`);
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setServiceModalOpen(true);
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleCategorySuccess = async (categoryData) => {
        try {
            setCategoryError('');

            if (editingCategory) {
                await CategoryService.updateCategory(editingCategory.id, categoryData);
                setCategories(prev => prev.map(category => (
                    category.id === editingCategory.id
                        ? { id: editingCategory.id, ...categoryData }
                        : category
                )));
                if (activeCategory === editingCategory.name) {
                    setActiveCategory(categoryData.name);
                }
            } else {
                const createdCategory = await CategoryService.addCategory(categoryData);
                setCategories(prev => [...prev, createdCategory].sort((a, b) => a.name.localeCompare(b.name)));
                setActiveCategory(createdCategory.name);
            }

            setEditingCategory(null);
            setIsCategoryModalOpen(false);
        } catch (error) {
            setCategoryError(error.message || 'Failed to save category');
        }
    };

    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans h-full">

            {/* --- HEADER --- */}
            <header className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Registry..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="h-10 px-3 border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] hover:text-[#F26389] hover:border-[#F26389] transition-all"
                    >
                        Manage Categories
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingService(null);
                            setServiceModalOpen(true);
                        }}
                        className="h-10 px-3 border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] hover:text-[#F26389] hover:border-[#F26389] transition-all flex items-center gap-1.5"
                    >
                        <Tags size={12} />
                        Add Service
                    </button>
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setServiceModalOpen(true);
                        }}
                        className="h-10 w-10 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all"
                        style={{
                            backgroundColor: activeAccentColor,
                            boxShadow: `0 8px 20px ${activeAccentColor}33`
                        }}
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <div className="mb-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {categoryTabs.map((categoryName) => {
                        const categoryData = categories.find((category) => category.name === categoryName);
                        const chipColor = categoryData?.color || '#F26389';
                        const isActive = activeCategory === categoryName;

                        return (
                            <button
                                key={categoryName}
                                type="button"
                                onClick={() => setActiveCategory(categoryName)}
                                className="shrink-0 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                                style={{
                                    borderColor: isActive ? chipColor : '#f4f2f4',
                                    color: isActive ? chipColor : '#b1b1b1',
                                    backgroundColor: isActive ? `${chipColor}14` : 'transparent'
                                }}
                            >
                                {categoryName}
                            </button>
                        );
                    })}
                </div>
                {categoryError && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mt-1">{categoryError}</p>
                )}
            </div>

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
                        ) : !activeCategory ? (
                            <div key="select-category" className="py-8 text-center text-[#b1b1b1]">
                                <p className="text-[10px] font-bold uppercase">Select a category to view services</p>
                            </div>
                        ) : (
                            filteredData.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onSelectService={handleServiceSelect}
                                    onDeleteService={handleDeleteService}
                                    onEditService={handleEditService}
                                />
                            ))
                        )}
                    </AnimatePresence>

                    {/* New SKU Register Trigger */}
                    {!isLoadingServices && activeCategory && filteredData.length === 0 && (
                        <div key="empty" className="py-8 text-center text-[#b1b1b1]">
                            <p className="text-[10px] font-bold uppercase">No services found</p>
                        </div>
                    )}

                    {!isLoadingServices && (
                        <button
                            onClick={() => {
                                setEditingService(null);
                                setServiceModalOpen(true);
                            }}
                            className="group mt-2 py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all"
                            style={{
                                borderColor: `${activeAccentColor}4D`,
                                color: activeAccentColor
                            }}
                        >
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

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={serviceModalOpen}
                onClose={() => {
                    setServiceModalOpen(false);
                    setEditingService(null);
                }}
                onSuccess={handleRefreshServices}
                initialData={editingService}
                mode={editingService ? 'edit' : 'add'}
                categories={categories}
            />

            <CategoryManagementModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                initialData={editingCategory}
                onSuccess={handleCategorySuccess}
            />
        </div>
    );
};

export default Services;