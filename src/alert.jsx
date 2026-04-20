import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: {
      wrapper: 'border-green-500/35 bg-white/70',
      iconWrap: 'bg-green-500/10 border-green-500/35',
      icon: <CheckCircle size={16} className="text-green-500" />,
      text: 'text-green-900',
      bar: 'bg-green-500',
      accent: 'bg-green-500',
    },
    error: {
      wrapper: 'border-red-500/35 bg-white/70',
      iconWrap: 'bg-red-500/10 border-red-500/35',
      icon: <AlertCircle size={16} className="text-red-500" />,
      text: 'text-red-900',
      bar: 'bg-red-500',
      accent: 'bg-red-500',
    },
    warning: {
      wrapper: 'border-amber-500/35 bg-white/70',
      iconWrap: 'bg-amber-500/10 border-amber-500/35',
      icon: <AlertTriangle size={16} className="text-amber-600" />,
      text: 'text-amber-900',
      bar: 'bg-amber-500',
      accent: 'bg-amber-500',
    },
    info: {
      wrapper: 'border-[#3f8b8c]/35 bg-white/70',
      iconWrap: 'bg-[#3f8b8c]/10 border-[#3f8b8c]/35',
      icon: <Info size={16} className="text-[#3f8b8c]" />,
      text: 'text-[#1e4445]',
      bar: 'bg-[#3f8b8c]',
      accent: 'bg-[#3f8b8c]',
    },
  };

  const s = styles[type] || styles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed top-6 right-6 z-[9999] min-w-[300px] max-w-sm overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-[0.5px] ring-white/80 font-[Outfit,sans-serif] ${s.wrapper}`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 w-[3px] h-full rounded-r-sm ${s.accent}`} />

      <div className="flex items-center gap-3 pl-[18px] pr-3.5 py-3.5">
        {/* Icon badge */}
        <div className={`w-8 h-8 rounded-[9px] border flex items-center justify-center flex-shrink-0 ${s.iconWrap}`}>
          {s.icon}
        </div>

        {/* Message */}
        <p className={`flex-1 text-[13.5px] font-medium leading-snug m-0 ${s.text}`}>
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 w-[26px] h-[26px] rounded-lg border border-[rgba(200,185,165,0.4)] bg-[rgba(240,235,228,0.5)] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[rgba(200,185,165,0.5)] hover:border-[rgba(200,185,165,0.7)]"
        >
          <X size={13} className="text-[#9a8a78]" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] opacity-35 ${s.bar}`}
      />
    </motion.div>
  );
};

export default Alert;