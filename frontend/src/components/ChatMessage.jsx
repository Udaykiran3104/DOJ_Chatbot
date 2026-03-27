import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, ThumbsDown, RotateCcw, User, Scale, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export function ChatMessage({ message, previousUserMessage, onRetry }) {
  const isBot = message.role === 'bot';
  const { isDark } = useTheme();
  const emblemFilter = isDark
    ? 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))'
    : 'brightness(0) invert(0) drop-shadow(0 0 1px rgba(0, 0, 0, 0.18))';
  const [feedback, setFeedback] = React.useState(null); // 'up' | 'down' | null
  const [isSendingFeedback, setIsSendingFeedback] = React.useState(false);

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      className={`flex gap-4 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* Bot Icon */}
      {isBot && (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-doj-blue to-blue-800 dark:from-doj-blue dark:to-blue-900 flex items-center justify-center flex-shrink-0 shadow-lg relative"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="Bot" 
            className="w-6 h-6 filter"
            style={{
              filter: emblemFilter,
            }}
          />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-doj-dark"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isBot ? 'items-start' : 'items-end'}`}>
        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 shadow-lg relative ${
            isBot 
              ? 'bg-white dark:bg-doj-dark-secondary border border-gray-100 dark:border-doj-dark-border text-gray-800 dark:text-doj-dark-text rounded-2xl rounded-tl-none' 
              : 'bg-gradient-to-br from-doj-blue to-blue-700 dark:from-doj-blue dark:to-blue-800 text-white rounded-2xl rounded-tr-none'
          }`}
        >
          {/* Markdown Content */}
          <div className={`prose prose-sm max-w-none ${!isBot ? 'prose-invert' : 'dark:prose-invert'} prose-headings:text-doj-blue dark:prose-headings:text-doj-dark-text prose-p:text-gray-800 dark:prose-p:text-doj-dark-text prose-strong:text-doj-blue dark:prose-strong:text-doj-orange`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Error retry */}
        {isBot && message.isError && message.retry && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onRetry?.(message.retry)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-doj-blue text-white text-sm font-semibold shadow hover:opacity-95 transition"
            >
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Feedback buttons */}
        {isBot && !message.isError && previousUserMessage?.role === 'user' && (
          <div className="mt-3 flex items-center gap-2">
            <button
              disabled={isSendingFeedback}
              onClick={async () => {
                if (feedback) return;
                setIsSendingFeedback(true);
                try {
                  await axios.post('http://127.0.0.1:8000/feedback', {
                    query: previousUserMessage.content,
                    answer: message.content,
                    feedback: 'up',
                    sources: message.sources || [],
                    detected_language: message.language || null,
                    client: 'web',
                  });
                  setFeedback('up');
                } finally {
                  setIsSendingFeedback(false);
                }
              }}
              className={`p-2 rounded-full border shadow-sm transition ${
                feedback === 'up'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white dark:bg-doj-dark-secondary border-gray-200 dark:border-doj-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-doj-dark-tertiary'
              }`}
              aria-label="Thumbs up"
              title="Thumbs up"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              disabled={isSendingFeedback}
              onClick={async () => {
                if (feedback) return;
                setIsSendingFeedback(true);
                try {
                  await axios.post('http://127.0.0.1:8000/feedback', {
                    query: previousUserMessage.content,
                    answer: message.content,
                    feedback: 'down',
                    sources: message.sources || [],
                    detected_language: message.language || null,
                    client: 'web',
                  });
                  setFeedback('down');
                } finally {
                  setIsSendingFeedback(false);
                }
              }}
              className={`p-2 rounded-full border shadow-sm transition ${
                feedback === 'down'
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : 'bg-white dark:bg-doj-dark-secondary border-gray-200 dark:border-doj-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-doj-dark-tertiary'
              }`}
              aria-label="Thumbs down"
              title="Thumbs down"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}

        {/* Language Tag */}
        {isBot && message.language && message.language !== 'en' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            <Globe size={12} />
            <span>Detected: {message.language === 'hi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'}</span>
          </motion.div>
        )}
      </div>

      {/* User Icon */}
      {!isBot && (
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-doj-orange to-orange-600 dark:from-doj-orange dark:to-orange-700 flex items-center justify-center flex-shrink-0 shadow-lg"
        >
          <User size={20} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}