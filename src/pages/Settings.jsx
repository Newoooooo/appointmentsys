import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bell, Lock, Globe, CreditCard, Blocks, MessageSquare,
    ArrowUpRight, Settings as SettingsIcon, Terminal,
    ShieldCheck, Palette, Plus, Edit2, Trash2, Moon, Sun, Monitor
} from 'lucide-react';
import { CategoryManagementModal } from '../components/modals/CategoryManagementModal';
import { CategoryService } from '../api/services';
import { useTheme } from '../hooks/useTheme';

const settingSections = [
    { id: 'SET-01', title: 'Business Profile', icon: Globe, desc: 'Manage public registry and studio metadata.', status: 'Public' },
    { id: 'SET-02', title: 'Security Protocol', icon: Lock, desc: 'Update passwords and 2FA authentication levels.', status: 'Secure' },
    { id: 'SET-03', title: 'Communications', icon: Bell, desc: 'Configure SMS and Email relay reminders.', status: 'Active' },
    { id: 'SET-04', title: 'Financial / Billing', icon: CreditCard, desc: 'Manage ledger subscription and invoice history.', status: 'Paid' },
    { id: 'SET-05', title: 'External Modules', icon: Blocks, desc: 'Sync with Google Calendar and external API nodes.', status: 'Syncing' },
    { id: 'SET-06', title: 'System Support', icon: MessageSquare, desc: 'Direct uplink to tech support and feature requests.', status: 'Online' },
];

const Settings = () => {
    const { theme, setTheme } = useTheme();
    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await CategoryService.getCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Error loading categories:', err);
            setError('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await CategoryService.deleteCategory(categoryId);
            setCategories(prev => prev.filter(c => c.id !== categoryId));
        } catch (err) {
            setError(err.message || 'Failed to delete category');
        }
    };

    const handleCategorySuccess = async (categoryData) => {
        try {
            if (editingCategory) {
                await CategoryService.updateCategory(editingCategory.id, categoryData);
                setCategories(prev =>
                    prev.map(c =>
                        c.id === editingCategory.id
                            ? { id: editingCategory.id, ...categoryData }
                            : c
                    )
                );
            } else {
                const newCategory = await CategoryService.addCategory(categoryData);
                setCategories(prev => [...prev, newCategory]);
            }
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
        } catch (err) {
            setError(err.message || 'Failed to save category');
        }
    };
    return (
        /* Removed h-screen and overflow-hidden to kill the double scroll */
        <div className="min-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] font-sans">

            {/* --- STICKY COMMAND HEADER --- */}
            <header className="sticky top-0 z-10 bg-[#fdfcfc]/80 dark:bg-[#080808]/80 backdrop-blur-md px-4 lg:px-6 py-6 border-b border-[#f4f2f4] dark:border-white/5">
                <div className="flex flex-nowrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 shrink-0 md:flex-1">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-[#F26389] uppercase tracking-[0.4em]">Configuration</p>
                            <h1 className="text-xl font-black uppercase tracking-tight">Core Settings</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button className="h-9 px-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[#b1b1b1] hover:border-[#F26389] transition-all flex items-center gap-2">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Audit Log</span>
                        </button>
                        <button className="h-9 px-4 bg-[#F26389] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#F26389]/20 active:scale-95 transition-all">
                            <SettingsIcon size={14} /> <span className="hidden md:inline">Save Changes</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="p-4 lg:p-6 space-y-6">

                {/* Section: Theme Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#F26389]">
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest">Theme Preferences</h3>
                            <p className="text-[10px] text-[#b1b1b1] font-medium">Choose your preferred theme</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`p-6 rounded-2xl border-2 transition-all ${
                                theme === 'light'
                                    ? 'border-[#F26389] bg-[#F26389]/5'
                                    : 'border-[#f4f2f4] dark:border-white/10 hover:border-[#F26389]/50'
                            }`}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#fdfcfc] border border-[#f4f2f4] flex items-center justify-center">
                                    <Sun size={20} className="text-[#F26389]" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-sm uppercase tracking-wide">Light</h4>
                                    <p className="text-[10px] text-[#b1b1b1]">Bright & clean</p>
                                </div>
                            </div>
                            {theme === 'light' && (
                                <div className="flex items-center gap-2 text-[#F26389]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F26389]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setTheme('dark')}
                            className={`p-6 rounded-2xl border-2 transition-all ${
                                theme === 'dark'
                                    ? 'border-[#F26389] bg-[#F26389]/5'
                                    : 'border-[#f4f2f4] dark:border-white/10 hover:border-[#F26389]/50'
                            }`}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0c0c0c] border border-white/10 flex items-center justify-center">
                                    <Moon size={20} className="text-[#F26389]" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-sm uppercase tracking-wide">Dark</h4>
                                    <p className="text-[10px] text-[#b1b1b1]">Easy on eyes</p>
                                </div>
                            </div>
                            {theme === 'dark' && (
                                <div className="flex items-center gap-2 text-[#F26389]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F26389]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                                </div>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Section: Category Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#F26389]">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest">Service Categories</h3>
                                <p className="text-[10px] text-[#b1b1b1] font-medium">Manage categories and assign colors</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddCategory}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#F26389] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            <Plus size={16} /> Add Category
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-3 mb-4"
                        >
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-[#b1b1b1]">Loading categories...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-[#f4f2f4] dark:border-white/10 rounded-xl">
                            <p className="text-[#b1b1b1] mb-3">No categories yet</p>
                            <p className="text-[10px] text-[#b1b1b1]">Create your first category to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#f4f2f4] dark:border-white/5">
                                        <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#b1b1b1]">Name</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#b1b1b1]">Color</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#b1b1b1]">Subcategories</th>
                                        <th className="text-center px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#b1b1b1]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(category => (
                                        <motion.tr
                                            key={category.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-[#f4f2f4] dark:border-white/5 hover:bg-[#fdfcfc] dark:hover:bg-[#0c0c0c] transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-[#2f3035] dark:text-[#fdfcfc]">{category.name}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-lg border border-[#f4f2f4] dark:border-white/10"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className="text-[#b1b1b1] font-mono text-xs">{category.color}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[#2f3035] dark:text-[#fdfcfc] font-semibold">
                                                    {category.subcategories?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="p-2 text-[#b1b1b1] hover:text-[#F26389] hover:bg-[#F26389]/10 rounded-lg transition-all"
                                                        title="Edit category"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="p-2 text-[#b1b1b1] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Section: Modular Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {settingSections.map((section) => (
                        <motion.div
                            key={section.id}
                            whileHover={{ y: -2 }}
                            className="group bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[32px] p-8 flex flex-col hover:border-[#F26389]/50 transition-all duration-300 min-h-[320px]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[#b1b1b1] group-hover:text-[#F26389] transition-colors">
                                    <section.icon size={20} />
                                </div>
                                <span className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase">{section.id}</span>
                            </div>

                            <div className="space-y-2 mb-8">
                                <h3 className="text-xs font-black uppercase tracking-widest">{section.title}</h3>
                                <p className="text-[10px] text-[#b1b1b1] font-medium leading-relaxed italic line-clamp-2">
                                    "{section.desc}"
                                </p>
                            </div>

                            <div className="mt-auto pt-5 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    {section.status}
                                </span>
                                <button className="p-2 text-[#b1b1b1] hover:text-[#F26389] transition-colors">
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section: Developer Portal */}
                <div className="bg-[#2f3035] dark:bg-[#111] rounded-[32px] p-10 border border-[#444] dark:border-white/10 relative overflow-hidden group">
                    {/* Decorative Background Icon */}
                    <Terminal className="absolute -right-4 -bottom-4 w-64 h-64 opacity-5 text-white pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">System Integrations & API</h3>
                            <p className="text-sm text-[#b1b1b1] max-w-2xl leading-relaxed">
                                Deploy custom hooks and manage authentication tokens for third-party node connections. Ensure all proprietary endpoints are secured via RSA-4096 protocols.
                            </p>
                        </div>
                        <button className="h-14 px-10 bg-[#F26389] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all whitespace-nowrap">
                            Launch Developer Hub
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <CategoryManagementModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                onSuccess={handleCategorySuccess}
                initialData={editingCategory}
            />
        </div>
    );
};

export default Settings;