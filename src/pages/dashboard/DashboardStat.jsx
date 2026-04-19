import React from 'react';
import clsx from 'clsx';
import Card from "../../components/ui/Card.jsx";

export const DashboardStat = ({ stats }) => (
    <section
        className={clsx(
            "flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4",
            "overflow-visible",
            "py-2"
        )}
    >
        {stats.map((stat, i) => (
            <Card
                key={i}
                className="p-8 rounded-xl border-[#f4f2f4] dark:border-white/10 group hover:border-[#F26389]"
                hover={true}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#fdfcfc] dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-lg text-[#F26389] group-hover:scale-110 transition-transform">
                        <stat.icon size={14} />
                    </div>

                    <span className={clsx(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        stat.trend === 'up'
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                    )}>
                        {stat.change}
                    </span>
                </div>

                <h3 className="text-2xl font-black tracking-tighter transition-colors group-hover:text-[#F26389]">
                    {stat.value}
                </h3>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mt-2">
                    {stat.label}
                </p>
            </Card>
        ))}
    </section>
);