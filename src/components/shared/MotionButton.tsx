'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MotionButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function MotionButton({ className, variant = 'primary', size = 'md', children, ...props }: MotionButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider border-2 border-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-bauhaus-blue text-white hover:bg-blue-600 bauhaus-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:bauhaus-shadow-sm",
    secondary: "bg-white text-foreground hover:bg-gray-100 bauhaus-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:bauhaus-shadow-sm dark:bg-neutral-800 dark:text-white",
    danger: "bg-bauhaus-red text-white hover:bg-red-600 bauhaus-shadow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none active:bauhaus-shadow-sm",
    ghost: "bg-transparent border-transparent hover:bg-foreground/10 text-foreground",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-16 px-8 text-base",
    icon: "h-12 w-12 p-2",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

