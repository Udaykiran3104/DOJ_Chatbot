import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Scale } from 'lucide-react';

const ChatInput = ({ value, onChange, onSend, isLoading }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  const handleSendClick = () => {
    onSend(value);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white dark:bg-doj-dark-secondary p-4 border-t border-gray-200 dark:border-doj-dark-border fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 shadow-lg"
    >
      <div className="max-w-5xl mx-auto relative flex items-end gap-3">
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 3px rgba(12, 50, 94, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)'
              : '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
          className="relative flex-1 bg-gray-50 dark:bg-doj-dark-tertiary border-2 border-gray-300 dark:border-doj-dark-border rounded-2xl focus-within:border-doj-blue dark:focus-within:border-doj-orange transition-all"
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your legal query here..."
            className="w-full bg-transparent border-none p-4 max-h-32 focus:ring-0 resize-none text-gray-700 dark:text-doj-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            rows={1}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 bottom-3 text-gray-400 dark:text-gray-500 hover:text-doj-blue dark:hover:text-doj-orange transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-doj-dark-border"
            aria-label="Voice input"
          >
            <Mic size={18} />
          </motion.button>
        </motion.div>

        <motion.button
          whileHover={value.trim() && !isLoading ? { scale: 1.05 } : {}}
          whileTap={value.trim() && !isLoading ? { scale: 0.95 } : {}}
          onClick={handleSendClick}
          disabled={!value.trim() || isLoading}
          className={`relative p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 overflow-hidden ${
            value.trim() && !isLoading
              ? 'bg-gradient-to-br from-doj-blue to-blue-700 dark:from-doj-blue dark:to-blue-800 text-white hover:shadow-xl'
              : 'bg-gray-200 dark:bg-doj-dark-tertiary text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Scale size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Send size={20} />
              </motion.div>
            )}
          </AnimatePresence>
          {value.trim() && !isLoading && (
            <motion.div
              className="absolute inset-0 bg-white opacity-20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </motion.button>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center justify-center gap-2"
      >
        <Scale size={12} />
        <span>Powered by AI • Information provided is for reference only.</span>
        <Scale size={12} />
      </motion.p>
    </motion.div>
  );
};

export default ChatInput;