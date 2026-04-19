import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ServiceService, CategoryService } from '../../api/services';

const DEFAULT_FORM_STATE = {
    title: '',
    category: '',
    subcategory: '',
    basePrice: '',
    durationMinutes: 60,
    slotStartHour: '07',
    slotEndHour: '21',
    slotStepMinutes: 30,
    status: 'Available',
    categoryColor: ''
};

const toDurationLabel = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = minutes / 60;
    if (Number.isInteger(hours)) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours.toFixed(1)} hours`;
};

const parseDuration = (durationValue) => {
    if (typeof durationValue === 'number' && durationValue > 0) return durationValue;
    if (typeof durationValue !== 'string') return 60;

    const match = durationValue.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 60;

    const numeric = Number.parseFloat(match[1]);
    if (!Number.isFinite(numeric)) return 60;
    if (durationValue.toLowerCase().includes('min')) return Math.round(numeric);
    return Math.round(numeric * 60);
};

export const AddServiceModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialData = null,
    mode = 'add',
    categories: externalCategories = null
}) => {
    const [categories, setCategories] = useState([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
    const [addons, setAddons] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = mode === 'edit' && Boolean(initialData?.id);

    const selectedCategory = useMemo(() => (
        categories.find((category) => category.name === formData.category)
    ), [categories, formData.category]);

    useEffect(() => {
        if (!isOpen) return;

        const boot = async () => {
            setIsCategoriesLoading(true);
            setError('');

            try {
                const categoryData = externalCategories?.length
                    ? externalCategories
                    : await CategoryService.getCategories();
                const normalizedCategories = (categoryData || []).sort((a, b) => a.name.localeCompare(b.name));
                setCategories(normalizedCategories);

                if (isEditMode) {
                    const matchedCategory = normalizedCategories.find((item) => item.name === initialData.category);
                    const durationMinutes = Number(initialData.durationMinutes) || parseDuration(initialData.duration);

                    setFormData({
                        title: initialData.title || '',
                        category: initialData.category || normalizedCategories[0]?.name || '',
                        subcategory: initialData.subcategory || matchedCategory?.subcategories?.[0]?.name || '',
                        basePrice: String(initialData.basePrice ?? ''),
                        durationMinutes,
                        slotStartHour: initialData.slotSettings?.startHour || '07',
                        slotEndHour: initialData.slotSettings?.endHour || '21',
                        slotStepMinutes: Number(initialData.slotSettings?.stepMinutes) || 30,
                        status: initialData.status || 'Available',
                        categoryColor: initialData.categoryColor || matchedCategory?.color || ''
                    });
                    setAddons(initialData.addons || []);
                    return;
                }

                const firstCategory = normalizedCategories[0];
                setFormData({
                    ...DEFAULT_FORM_STATE,
                    category: firstCategory?.name || '',
                    categoryColor: firstCategory?.color || '',
                    subcategory: firstCategory?.subcategories?.[0]?.name || ''
                });
                setAddons([]);
            } catch (err) {
                console.error('Error loading categories:', err);
                setError('Failed to load categories');
            } finally {
                setIsCategoriesLoading(false);
            }
        };

        boot();
    }, [externalCategories, initialData, isEditMode, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            const matched = categories.find((category) => category.name === value);
            setFormData((prev) => ({
                ...prev,
                category: value,
                categoryColor: matched?.color || '',
                subcategory: matched?.subcategories?.[0]?.name || ''
            }));
            return;
        }

        if (name === 'durationMinutes' || name === 'slotStepMinutes') {
            setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddAddon = () => {
        const newId = `a${Date.now()}`;
        setAddons((prev) => [...prev, { id: newId, name: '', defaultPrice: 0 }]);
    };

    const handleAddonChange = (index, field, value) => {
        setAddons((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: field === 'defaultPrice' ? parseFloat(value) || 0 : value
            };
            return updated;
        });
    };

    const handleRemoveAddon = (index) => {
        setAddons((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (!formData.title.trim() || !formData.basePrice) {
                throw new Error('Please fill in all required fields');
            }

            if (!formData.category) {
                throw new Error('Please select a category');
            }

            if (Number(formData.durationMinutes) < 15) {
                throw new Error('Duration must be at least 15 minutes');
            }

            if (Number(formData.slotEndHour) <= Number(formData.slotStartHour)) {
                throw new Error('Slot end hour must be later than slot start hour');
            }

            for (const addon of addons) {
                if (!addon.name.trim()) {
                    throw new Error('Add-on names cannot be empty');
                }

                if (addon.defaultPrice < 0) {
                    throw new Error('Add-on prices cannot be negative');
                }
            }

            const payload = {
                title: formData.title.trim(),
                category: formData.category,
                subcategory: formData.subcategory,
                basePrice: parseFloat(formData.basePrice),
                durationMinutes: Number(formData.durationMinutes),
                duration: toDurationLabel(Number(formData.durationMinutes)),
                status: formData.status,
                categoryColor: selectedCategory?.color || formData.categoryColor,
                slotSettings: {
                    startHour: formData.slotStartHour,
                    endHour: formData.slotEndHour,
                    stepMinutes: Number(formData.slotStepMinutes)
                },
                addons: addons.map(({ id, name, defaultPrice }) => ({
                    id,
                    name: name.trim(),
                    defaultPrice
                }))
            };

            if (isEditMode) {
                await ServiceService.updateService(initialData.id, payload);
            } else {
                await ServiceService.addService(payload);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} service`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#111] rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black uppercase tracking-wide">{isEditMode ? 'Edit Service' : 'Add Service'}</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {isCategoriesLoading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">Loading categories...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Service Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    placeholder="e.g., Kids Dream Package"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Subcategory</label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        {categories
                                            .find(c => c.name === formData.category)
                                            ?.subcategories?.map(subcat => (
                                                <option key={subcat.id} value={subcat.name}>{subcat.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Base Price *</label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        placeholder="3000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        min="15"
                                        step="15"
                                        value={formData.durationMinutes}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Slot Step (minutes)</label>
                                    <select
                                        name="slotStepMinutes"
                                        value={formData.slotStepMinutes}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value={15}>15</option>
                                        <option value={30}>30</option>
                                        <option value={60}>60</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Slot Start Hour</label>
                                    <input
                                        type="number"
                                        name="slotStartHour"
                                        min="0"
                                        max="23"
                                        value={formData.slotStartHour}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Slot End Hour</label>
                                    <input
                                        type="number"
                                        name="slotEndHour"
                                        min="1"
                                        max="24"
                                        value={formData.slotEndHour}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Add-ons Section */}
                            <div className="border-t border-gray-300 dark:border-white/10 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold uppercase">Pre-set Add-ons</label>
                                    <button
                                        type="button"
                                        onClick={handleAddAddon}
                                        className="px-3 py-1 text-[11px] font-bold uppercase bg-[#F26389]/10 text-[#F26389] border border-[#F26389]/30 rounded-lg hover:bg-[#F26389]/20 transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                
                                {addons.length > 0 ? (
                                    <div className="space-y-3 max-h-56 overflow-y-auto">
                                        {addons.map((addon, index) => (
                                            <div key={addon.id} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={addon.name}
                                                    onChange={(e) => handleAddonChange(index, 'name', e.target.value)}
                                                    placeholder="Add-on name"
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                />
                                                <input
                                                    type="number"
                                                    value={addon.defaultPrice}
                                                    onChange={(e) => handleAddonChange(index, 'defaultPrice', e.target.value)}
                                                    placeholder="Price"
                                                    className="w-20 px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAddon(index)}
                                                    className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No add-ons yet</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg font-bold uppercase text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-[#F26389] text-white rounded-lg font-bold uppercase text-sm hover:bg-[#BF637C] disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting
                                        ? (isEditMode ? 'Updating...' : 'Adding...')
                                        : (isEditMode ? 'Update Service' : 'Add Service')}
                                </button>
                            </div>
                        </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddServiceModal;
