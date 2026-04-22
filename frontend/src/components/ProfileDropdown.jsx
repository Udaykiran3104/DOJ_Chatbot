import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function ProfileDropdown({ onLogout }) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Profile Picture Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-doj-blue dark:border-doj-orange overflow-hidden hover:shadow-lg transition-shadow"
        title="Open user menu"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-doj-blue dark:text-doj-orange" />
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-64 bg-white dark:bg-doj-dark-secondary rounded-lg shadow-xl border border-gray-200 dark:border-doj-dark-border overflow-hidden"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200 dark:border-doj-dark-border bg-gray-50 dark:bg-doj-dark-secondary/50">
              <p className="text-sm font-semibold text-gray-900 dark:text-doj-dark-text truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            {/* Phone Number Placeholder */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-doj-dark-border">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Phone Number</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Not provided
              </p>
            </div>

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ backgroundColor: isDark ? '#1a2b3d' : '#f3f4f6' }}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-doj-dark/60 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
