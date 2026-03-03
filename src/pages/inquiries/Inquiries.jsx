import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send } from 'lucide-react';
import clsx from 'clsx';
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";

// Import separated components
import {InquiryCard} from "./InquiryCard";
import {ConversationHeader} from "./ConversationHeader";
import {ChatBubble} from "./ChatBubble";
import {ReplyBox} from "./ReplyBox";

const inquiriesData = [
    { id: 'INQ-101', name: 'Isabella Rossi', source: 'instagram', service: 'Balayage Consultation', date: '2h ago', message: 'Hi! Do you have any openings for next Saturday for a full color change?', status: 'new' },
    { id: 'INQ-102', name: 'Thomas Müller', source: 'facebook', service: 'Deep Tissue Therapy', date: '5h ago', message: 'I have a gift card from December, can I use it for the 90-minute session?', status: 'replied', lastReply: 'Yes Thomas! You can definitely use that.' },
    { id: 'INQ-103', name: 'Clara Simons', source: 'whatsapp', service: 'Bridal Trial', date: '1d ago', message: 'Looking to book a party of 5 for a wedding in September.', status: 'new' },
    { id: 'INQ-104', name: 'Marcus Chen', source: 'instagram', service: 'Skin Fade', date: '3d ago', message: 'Do you take walk-ins or is it strictly appointment only?', status: 'replied', lastReply: 'Strictly appointment only, Marcus!' },
];

const Inquiries = () => {
    const [activeInq, setActiveInq] = useState(inquiriesData[0]);
    const [view, setView] = useState('list');
    const [replyText, setReplyText] = useState('');

    const handleSelectInquiry = (inq) => {
        setActiveInq(inq);
        setView('detail');
    };

    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown activeFilter="This Week" align="right" options={["This Week", "Last Week", "This Month"]} />
                    <button className="h-9 w-9 bg-[#f87941] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#f87941]/20 shrink-0">
                        <Send size={14} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden relative">
                {/* LEFT: FEED */}
                <div className={clsx(
                    "w-full md:w-[380px] shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300",
                    view === 'detail' ? "hidden md:flex" : "flex"
                )}>
                    <div className="flex items-center justify-between px-1 mb-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">Inbox</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pl-4 pr-1 border-l border-[#f4f2f4] dark:border-white/5 pb-4">
                        {inquiriesData.map((inq) => (
                            <InquiryCard
                                key={inq.id}
                                inq={inq}
                                isActive={activeInq.id === inq.id}
                                onClick={() => handleSelectInquiry(inq)}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT: CONVERSATION PANEL */}
                <div className={clsx(
                    "fixed inset-0 z-50 md:z-10 md:relative md:inset-auto md:flex-1",
                    "bg-[#fdfcfc] dark:bg-[#080808] md:bg-white md:dark:bg-[#111]",
                    "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                    view === 'list' ? "translate-x-full md:translate-x-0 hidden md:flex" : "translate-x-0 flex"
                )}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeInq.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col h-full w-full"
                        >
                            <ConversationHeader
                                name={activeInq.name}
                                service={activeInq.service}
                                setView={setView}
                            />

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar pb-32">
                                <ChatBubble message={activeInq.message} date={activeInq.date} />
                                {activeInq.lastReply && (
                                    <ChatBubble message={activeInq.lastReply} isReply={true} />
                                )}
                            </div>

                            <ReplyBox replyText={replyText} setReplyText={setReplyText} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Inquiries;