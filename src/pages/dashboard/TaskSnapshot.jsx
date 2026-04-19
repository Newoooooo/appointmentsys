import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import clsx from "clsx";
import Card from "../../components/ui/Card.jsx";

export const TaskSnapshot = ({ tasks }) => (
    <div className="lg:col-span-6 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Priority Tasks</h2>
            <Link
                to="/tasks?filter=priority&value=high"
                className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#F26389] hover:opacity-80 transition-all"
            >
                View All
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>

        <div className="space-y-2">
            {tasks.map((task, i) => (
                <Card key={i}
                      className="p-3.5 sm:p-4 rounded-xl border-[#f4f2f4] dark:border-white/10 group hover:border-[#F26389] transition-all bg-white dark:bg-[#111]"
                      hover={true}
                >
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Radio Button - Background Removed */}
                        <div className={clsx(
                            "transition-colors shrink-0",
                            task.completed
                                ? "text-emerald-500"
                                : "text-gray-300 dark:text-gray-700 group-hover:text-[#F26389]"
                        )}>
                            {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Task Title */}
                            <h4 className={clsx(
                                "text-[11px] sm:text-xs font-black uppercase tracking-tight transition-colors truncate",
                                task.completed
                                    ? "text-gray-300 dark:text-gray-700 line-through"
                                    : "text-[#2f3035] dark:text-white group-hover:text-[#F26389]"
                            )}>
                                {task.title}
                            </h4>

                            {/* Metadata line */}
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                    Due {task.dueDate}
                                </p>
                                <span className="text-[9px] text-gray-300 dark:text-gray-800">•</span>
                                <span className={clsx(
                                    "text-[8px] font-black uppercase tracking-widest",
                                    task.priority === 'High' ? "text-red-500/80" : "text-blue-500/80"
                                )}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>

                        {/* Status Indicator (Optional/Hidden on Mobile if preferred) */}
                        {!task.completed && task.priority === 'High' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse hidden sm:block" />
                        )}
                    </div>
                </Card>
            ))}
        </div>
    </div>
);