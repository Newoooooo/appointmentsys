import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ children, className, hover = true, whileTap, ...rest }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5 } : {}}
            whileTap={whileTap}
            className={clsx(
                "bg-white dark:bg-[#1c1c1c] rounded-[32px] border border-[#e6e4e6] dark:border-[#282828] transition-all",
                "overflow-visible relative",
                className
            )}
            {...rest}
        >
            {children}
        </motion.div>
    );
};

export default Card;