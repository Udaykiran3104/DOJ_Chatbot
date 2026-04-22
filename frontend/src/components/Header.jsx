import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Scale, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileDropdown } from './ProfileDropdown';

const Header = ({ showBackToHome = false, onBackToHome, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const emblemFilter = isDark
    ? 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))'
    : 'brightness(0) invert(0) drop-shadow(0 0 1px rgba(0, 0, 0, 0.2))';

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white dark:bg-doj-dark-secondary shadow-lg dark:shadow-2xl fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-doj-dark-border backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackToHome && (
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToHome}
              className="p-2 rounded-full bg-gray-100 dark:bg-doj-dark-tertiary text-gray-700 dark:text-doj-dark-text hover:bg-gray-200 dark:hover:bg-doj-dark-border transition-colors shadow-md"
              aria-label="Back to home"
              title="Back to home"
            >
              <ArrowLeft size={20} />
            </motion.button>
          )}

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="Satyameva Jayate" 
              className="h-10 w-auto drop-shadow-md filter"
              style={{
                filter: emblemFilter,
              }}
            />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-doj-orange rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-doj-blue dark:text-doj-dark-text font-bold text-lg leading-tight">
              Department of Justice
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              MINISTRY OF LAW AND JUSTICE, GOVT. OF INDIA
            </p>
          </div>
        </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden md:flex items-center gap-2 text-doj-orange dark:text-doj-orange bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/50 shadow-md"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Scale size={16} className="text-doj-orange" />
            </motion.div>
            <ShieldCheck size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Legal Assistant</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-doj-dark-tertiary text-gray-700 dark:text-doj-dark-text hover:bg-gray-200 dark:hover:bg-doj-dark-border transition-colors shadow-md"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <ProfileDropdown onLogout={onLogout} />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;