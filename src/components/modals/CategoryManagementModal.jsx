import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

export const CategoryManagementModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        color: '#F26389',
        subcategories: [{ id: `sub-${Date.now()}`, name: '' }]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const COLOR_PRESETS = [
        '#F26389', // Pink
        '#6366F1', // Indigo
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#8B5CF6', // Violet
        '#EC4899', // Rose
        '#06B6D4', // Cyan
        '#EF4444', // Red
        '#3B82F6', // Blue
        '#14B8A6', // Teal
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                color: initialData.color || '#F26389',
                subcategories: initialData.subcategories || [{ id: `sub-${Date.now()}`, name: '' }]
            });
        } else {
            setFormData({
                name: '',
                color: '#F26389',
                subcategories: [{ id: `sub-${Date.now()}`, name: '' }]
            });
        }
        setError('');
    }, [isOpen, initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleColorChange = (color) => {
        setFormData(prev => ({
            ...prev,
            color
        }));
    };

    const handleHexInputChange = (value) => {
        // Validate hex color format
        if (/^#[0-9A-F]{6}$/i.test(value) || value === '' || value.startsWith('#')) {
            setFormData(prev => ({
                ...prev,
                color: value
            }));
        }
    };

    const handleSubcategoryChange = (index, value) => {
        setFormData(prev => {
            const updated = [...prev.subcategories];
            updated[index] = {
                ...updated[index],
                name: value
            };
            return {
                ...prev,
                subcategories: updated
            };
        });
    };

    const handleAddSubcategory = () => {
        setFormData(prev => ({
            ...prev,
            subcategories: [
                ...prev.subcategories,
                { id: `sub-${Date.now()}`, name: '' }
            ]
        }));
    };

    const handleRemoveSubcategory = (index) => {
        if (formData.subcategories.length === 1) {
            setError('At least one subcategory is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }

        if (formData.subcategories.length === 0) {
            setError('At least one subcategory is required');
            return;
        }

        const emptySubcategories = formData.subcategories.some(sub => !sub.name.trim());
        if (emptySubcategories) {
            setError('All subcategories must have a name');
            return;
        }

        if (!/^#[0-9A-F]{6}$/i.test(formData.color)) {
            setError('Invalid color format. Please use a valid hex color (e.g., #F26389)');
            return;
        }

        setIsSubmitting(true);

        try {
            const cleanedData = {
                name: formData.name.trim(),
                color: formData.color.toUpperCase(),
                subcategories: formData.subcategories
                    .filter(sub => sub.name.trim())
                    .map(sub => ({
                        id: sub.id,
                        name: sub.name.trim()
                    }))
            };

            onSuccess?.(cleanedData);
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred');
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-[#111] rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-[#111] border-b border-[#f4f2f4] dark:border-white/5 px-6 py-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-[#F26389] uppercase tracking-[0.4em]">Categories</p>
                            <h2 className="text-lg font-black uppercase tracking-tight">
                                {initialData ? 'Edit Category' : 'Create New Category'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center text-[#b1b1b1] hover:text-[#F26389] hover:bg-[#F26389]/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-3"
                            >
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                            </motion.div>
                        )}

                        {/* Category Name */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2f3035] dark:text-[#fdfcfc] block mb-3">
                                Category Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Studio, Event, Workshop"
                                className="w-full px-4 py-3 bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#2f3035] dark:text-[#fdfcfc] placeholder-[#b1b1b1] focus:outline-none focus:border-[#F26389] transition-colors"
                            />
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2f3035] dark:text-[#fdfcfc] block mb-3">
                                Category Color
                            </label>
                            
                            {/* Hex Input */}
                            <div className="flex gap-3 items-center mb-4">
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => handleHexInputChange(e.target.value)}
                                    placeholder="#F26389"
                                    maxLength={7}
                                    className="px-4 py-3 bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#2f3035] dark:text-[#fdfcfc] focus:outline-none focus:border-[#F26389] transition-colors font-mono text-sm w-32"
                                />
                                <div
                                    className={`w-12 h-12 rounded-xl border-2 border-[#f4f2f4] dark:border-white/10 transition-all`}
                                    style={{ backgroundColor: formData.color }}
                                />
                            </div>

                            {/* Color Presets */}
                            <div className="grid grid-cols-5 gap-2">
                                {COLOR_PRESETS.map((preset) => (
                                    <motion.button
                                        key={preset}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => handleColorChange(preset)}
                                        className={`w-full aspect-square rounded-xl border-2 transition-all ${
                                            formData.color.toUpperCase() === preset
                                                ? 'border-[#2f3035] dark:border-white shadow-lg shadow-black/20'
                                                : 'border-[#f4f2f4] dark:border-white/10'
                                        }`}
                                        style={{ backgroundColor: preset }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Subcategories */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2f3035] dark:text-[#fdfcfc]">
                                    Subcategories
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddSubcategory}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#F26389] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.subcategories.map((sub, index) => (
                                    <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex gap-2 items-center"
                                    >
                                        <input
                                            type="text"
                                            value={sub.name}
                                            onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                                            placeholder={`Subcategory ${index + 1}`}
                                            className="flex-1 px-4 py-2.5 bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-lg text-[#2f3035] dark:text-[#fdfcfc] placeholder-[#b1b1b1] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSubcategory(index)}
                                            disabled={formData.subcategories.length === 1}
                                            className="w-10 h-10 flex items-center justify-center text-[#b1b1b1] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-[#f4f2f4] dark:border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-[#fdfcfc] dark:bg-[#0c0c0c] text-[#2f3035] dark:text-[#fdfcfc] border border-[#f4f2f4] dark:border-white/10 rounded-xl font-black text-sm uppercase tracking-widest hover:border-[#F26389] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-[#F26389] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
