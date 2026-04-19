import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    UserPlus, Shield, Search, Plus, Key,
    Send, ChevronLeft, ChevronRight, CheckCircle2, Pencil, Trash2
} from 'lucide-react';
import clsx from 'clsx';
import { StaffService } from '../api/services.js';
import AddStaffModal from '../components/modals/AddStaffModal.jsx';

const StaffManagement = () => {
    const [staffData, setStaffData] = useState([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    
    useEffect(() => {
        StaffService.getStaff().then(data => {
            setStaffData(data);
            setIsLoadingStaff(false);
        }).catch(error => {
            console.error('Error loading staff:', error);
            setIsLoadingStaff(false);
        });
    }, []);

    const handleRefreshStaff = () => {
        StaffService.getStaff().then(data => {
            setStaffData(data);
        });
    };

    const handleEditStaff = (member) => {
        setEditingStaff(member);
        setStaffModalOpen(true);
    };

    const handleDeleteStaff = async (member) => {
        if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) return;
        setDeletingId(member.id);
        try {
            await StaffService.deleteStaffMember(member.id);
            setStaffData((prev) => prev.filter((s) => s.id !== member.id));
        } catch (err) {
            alert(`Failed to delete: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };
    return (
        <div className="h-screen max-h-screen bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden font-sans">

            {/* --- COMMAND HEADER --- */}
            <header className="flex flex-nowrap items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3 shrink-0 md:flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Find Personnel..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditingStaff(null); setStaffModalOpen(true); }} className="h-9 px-4 bg-[#F26389] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-[#F26389]/20 active:scale-95 transition-all">
                        <UserPlus size={14} strokeWidth={3} /> <span className="hidden md:inline">Invite Member</span>
                    </button>
                </div>
            </header>

            {/* --- REGISTRY LIST --- */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
                {/* Column Labels */}
                <div className="px-8 flex items-center text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.3em] mb-2">
                    <span className="flex-1">Personnel Identity</span>
                    <span className="w-48 hidden md:block px-4">Credentials</span>
                    <span className="w-36 hidden lg:block px-4 text-center">Privileges</span>
                    <span className="w-32 hidden lg:block text-right">Status</span>
                    <span className="w-16 text-right"></span>
                </div>

                {staffData.map((member) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-[24px] p-4 flex items-center gap-6 hover:border-[#F26389] transition-all"
                    >
                        {/* 1. Identity */}
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 flex items-center justify-center text-[10px] font-black text-[#F26389] shrink-0">
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="truncate">
                                <h3 className="text-[11px] font-black uppercase tracking-tight truncate">{member.name}</h3>
                                <p className="text-[9px] text-[#b1b1b1] font-bold truncate">{member.email}</p>
                            </div>
                        </div>

                        {/* 2. Password / Credentials Action */}
                        <div className="w-48 hidden md:block px-4 border-l border-[#f4f2f4] dark:border-white/5">
                            <button className="w-full h-9 flex items-center justify-between px-3 rounded-xl bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 group/btn hover:border-[#F26389] transition-all">
                                <div className="flex items-center gap-2">
                                    <Key size={12} className="text-[#b1b1b1] group-hover/btn:text-[#F26389]" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1]">Send Key</span>
                                </div>
                                <Send size={10} className="text-[#b1b1b1] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>

                        {/* 3. Privilege */}
                        <div className="w-36 hidden lg:flex justify-center border-l border-[#f4f2f4] dark:border-white/5 px-4">
                            <div className="inline-flex items-center gap-1.5 text-[#F26389]">
                                <Shield size={12} strokeWidth={2.5} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{member.access}</span>
                            </div>
                        </div>

                        {/* 4. Account Status */}
                        <div className="w-32 hidden lg:flex justify-end border-l border-[#f4f2f4] dark:border-white/5 px-4">
                            <div className={clsx(
                                "flex items-center gap-2 px-2 py-1 rounded-lg border",
                                member.status === 'Active' ? "border-emerald-500/20 text-emerald-500" : "border-[#b1b1b1]/20 text-[#b1b1b1]"
                            )}>
                                <CheckCircle2 size={10} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">{member.status}</span>
                            </div>
                        </div>

                        {/* 5. Cmd */}
                        <div className="w-20 flex justify-end gap-1">
                            <button
                                type="button"
                                onClick={() => handleEditStaff(member)}
                                className="p-2 rounded-lg text-[#767676] hover:text-[#F26389] hover:bg-[#F26389]/5 transition-all"
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteStaff(member)}
                                disabled={deletingId === member.id}
                                className="p-2 rounded-lg text-[#767676] hover:text-red-500 hover:bg-red-500/5 transition-all disabled:opacity-40"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                <button className="w-full border-2 border-dashed border-[#f4f2f4] dark:border-white/10 rounded-[24px] p-4 flex items-center justify-center gap-3 text-[#b1b1b1] hover:text-[#F26389] hover:border-[#F26389]/50 transition-all group">
                    <Plus size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Authorize New Team Account</span>
                </button>
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <footer className="mt-auto pt-4 border-t border-[#f4f2f4] dark:border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4 text-[9px] font-black text-[#b1b1b1] uppercase tracking-widest">
                    <span>Showing 1-4 of 24</span>
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] hover:border-[#F26389] transition-all">
                        <ChevronLeft size={14} />
                    </button>
                    {[1, 2, 3].map((page) => (
                        <button
                            key={page}
                            className={clsx(
                                "w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all",
                                page === 1 ? "bg-[#F26389] text-white" : "text-[#b1b1b1] hover:bg-[#f4f2f4] dark:hover:bg-white/5"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] hover:border-[#F26389] transition-all">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </footer>

            {/* Add Staff Modal */}
            <AddStaffModal
                isOpen={staffModalOpen}
                onClose={() => {
                    setStaffModalOpen(false);
                    setEditingStaff(null);
                }}
                onSuccess={handleRefreshStaff}
                initialData={editingStaff}
            />
        </div>
    );
};

export default StaffManagement;