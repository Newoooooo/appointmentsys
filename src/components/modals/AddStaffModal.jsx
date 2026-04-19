import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { StaffService } from '../../api/services';

export const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        access: 'Staff',
        status: 'Active',
        availability: 'full-time'
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
            if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
                setError('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }

            await StaffService.addStaffMember(formData);

            setFormData({
                name: '',
                email: '',
                role: '',
                access: 'Staff',
                status: 'Active',
                availability: 'full-time'
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add staff member');
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
                            <h2 className="text-lg font-black uppercase tracking-wide">Invite Staff Member</h2>
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
                                    placeholder="Jordan Smith"
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
                                    placeholder="jordan@dreamsnap.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">Role/Title *</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                    placeholder="Photographer"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Access Level</label>
                                    <select
                                        name="access"
                                        value={formData.access}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Availability</label>
                                    <select
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                    </select>
                                </div>
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
                                    {isSubmitting ? 'Inviting...' : 'Invite Member'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddStaffModal;
