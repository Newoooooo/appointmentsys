import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CustomerService } from '../../api/services';

export const AddCustomerModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        loc: '',
        status: 'New',
        spend: '₱0'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (!formData.name.trim() || !formData.email.trim()) {
                setError('Please fill in required fields');
                setIsSubmitting(false);
                return;
            }

            await CustomerService.addCustomer({
                ...formData,
                lastActive: new Date().toISOString().split('T')[0]
            });

            setFormData({
                name: '',
                email: '',
                loc: '',
                status: 'New',
                spend: '₱0'
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add customer');
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
                            <h2 className="text-lg font-black uppercase tracking-wide">Add Customer</h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    placeholder="Maria Santos"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    placeholder="maria@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Location</label>
                                <input
                                    type="text"
                                    name="loc"
                                    value={formData.loc}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    placeholder="Manila, PH"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Customer Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                >
                                    <option value="New">New</option>
                                    <option value="Regular">Regular</option>
                                    <option value="VIP">VIP</option>
                                </select>
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
                                    {isSubmitting ? 'Adding...' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddCustomerModal;
