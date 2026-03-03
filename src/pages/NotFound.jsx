import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-9xl font-black text-amber-500/20 mb-4"
                >
                    404
                </motion.div>

                <h1 className="text-3xl font-bold text-slate-900 mb-4">Page not found</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    The booking you're looking for might have been moved, canceled, or never existed in this timeline.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/app"
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                        <Home size={18} /> Back to Dashboard
                    </Link>
                    <Link
                        to="/support"
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                    >
                        <HelpCircle size={18} /> Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;