import React from 'react';
import clsx from 'clsx';

export const ChatBubble = ({ message, date, isReply = false }) => (
    <div className={clsx("max-w-[85%]", isReply && "ml-auto")}>
        <div className={clsx(
            "p-4 rounded-2xl text-[12px] font-medium leading-relaxed",
            isReply
                ? "bg-[#f87941] text-white rounded-tr-none shadow-lg shadow-[#f87941]/10"
                : "bg-[#f4f2f4] dark:bg-[#1a1a1a] rounded-tl-none"
        )}>
            {message}
        </div>
        <div className={clsx(
            "text-[8px] font-black uppercase mt-2",
            isReply ? "text-[#f87941] text-right mr-1" : "text-[#b1b1b1] ml-1"
        )}>
            {isReply ? "Sent" : date}
        </div>
    </div>
);
