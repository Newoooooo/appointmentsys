import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-[#f87941]/20 border-t-[#f87941] rounded-full"
            />
        </div>
    );
};

export default LoadingOverlay;