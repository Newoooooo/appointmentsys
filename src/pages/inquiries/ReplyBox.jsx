import React from 'react';
import { Plus, CheckCircle, Send } from 'lucide-react';

export const ReplyBox = ({ replyText, setReplyText }) => (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#080808]/90 backdrop-blur-md border-t border-[#f4f2f4] dark:border-white/5 pb-6 md:pb-6">
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            <button className="h-8 px-4 shrink-0 flex items-center gap-2 bg-[#F26389] text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                <Plus size={12} strokeWidth={3}/> Action
            </button>
            <button className="h-8 px-4 shrink-0 flex items-center gap-2 border border-[#f4f2f4] dark:border-white/10 text-[#b1b1b1] rounded-full text-[8px] font-black uppercase tracking-widest">
                <CheckCircle size={12}/> Resolve
            </button>
        </div>

        <div className="relative">
            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="MESSAGE..."
                className="w-full h-14 min-h-[56px] bg-[#f4f2f4] dark:bg-[#111] border-none rounded-2xl p-4 pr-16 text-[11px] font-bold uppercase outline-none focus:ring-1 ring-[#F26389] transition-all resize-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-[#F26389] text-white rounded-xl flex items-center justify-center">
                <Send size={16} strokeWidth={3} />
            </button>
        </div>
    </div>
);

