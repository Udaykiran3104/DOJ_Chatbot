import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, ThumbsDown, RotateCcw, User, Scale, Globe, Menu, Plus, MessageCircle, Sparkles, Gavel, BookOpen, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import Header from './Header';
import ChatInput from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

const API_URL = 'http://localhost:8000';

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

// Individual Chat Message Component
function MessageBubble({ message, previousUserMessage, onRetry }) {
  return <ChatMessage message={message} previousUserMessage={previousUserMessage} onRetry={onRetry} />;
}

// Main Chat Interface Component
export function ChatInterface({ initialQuery = null, onBackToHome }) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentChats] = useState([
    "What are my legal rights?",
    "How to file a complaint",
    "Appeal process information"
  ]);
  const messagesEndRef = useRef(null);

  const emblemFilter = isDark
    ? 'brightness(0) invert(1) drop-shadow(0 0 3px rgba(255, 255, 255, 0.9))'
    : 'brightness(0) invert(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.18))';

  const suggestedQuestions = [
    { text: "What are my legal rights?", icon: Scale },
    { text: "How do I file a complaint?", icon: FileText },
    { text: "What is the appeal process?", icon: Gavel },
    { text: "Where can I find legal resources?", icon: BookOpen }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If initial query provided, send it automatically
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Handle sending message
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/chat/ask`, {
        question: message,
      });

      const botMessage = {
        id: messages.length + 2,
        role: 'bot',
        content: response.data.answer,
        sources: response.data.sources || [],
        language: response.data.detected_language || null,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: messages.length + 2,
        role: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isError: true,
        timestamp: new Date(),
        retry: message,
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (message) => {
    handleSendMessage(message);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setError('');
  };

  const handleSuggestionClick = (question) => {
    handleSendMessage(question);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const isWelcomeState = messages.length === 0;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-doj-dark overflow-hidden">
      {/* LEFT SIDEBAR - Fixed */}
      <motion.div
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-doj-dark-secondary/80 border-r border-gray-200 dark:border-doj-dark-border backdrop-blur-sm flex flex-col h-full"
      >
        {/* Sidebar Top Section */}
        <div className="flex-shrink-0 p-4 flex flex-col gap-6">
          {/* Hamburger Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-700 dark:text-doj-dark-text hover:bg-gray-200 dark:hover:bg-doj-dark-border transition-colors self-start ml-1"
            title="Close sidebar"
          >
            <Menu size={20} />
          </motion.button>

          {/* New Chat Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="flex items-center gap-3 py-2.5 px-4 bg-gray-200/60 dark:bg-doj-dark-border/50 rounded-full text-gray-700 dark:text-doj-dark-text font-medium text-sm hover:bg-gray-300/60 dark:hover:bg-gray-600 transition-colors w-fit ml-1"
            title="Start new chat"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </motion.button>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="px-5 py-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Recent
            </h4>
          </div>

          <div className="px-3 space-y-0.5">
            {recentChats.length > 0 ? (
              recentChats.map((chat, index) => (
                <motion.button
                  key={index}
                  className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors text-left text-sm"
                >
                  <MessageCircle size={16} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {chat}
                  </span>
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-4 text-xs text-gray-400 dark:text-gray-500">
                No conversations yet
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hamburger Toggle (when sidebar closed) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-24 z-50 p-2 rounded-lg bg-doj-blue dark:bg-doj-blue text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg"
            title="Open sidebar"
          >
            <Menu size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* RIGHT MAIN CONTENT AREA - flex flex-col h-screen */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* HEADER - Pinned to Top */}
        <Header showBackToHome={true} onBackToHome={onBackToHome} />

        {/* MAIN CONTENT - Flex-1, scrollable */}
        {isWelcomeState ? (
          /* ========== WELCOME STATE ========== */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto"
          >
            {/* Emblem Section */}
            <motion.div variants={itemVariants} className="relative mb-6">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative inline-block"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                  alt="Emblem" 
                  className="w-24 h-24 md:w-32 md:h-32 mx-auto drop-shadow-2xl filter"
                  style={{
                    filter: emblemFilter,
                  }}
                />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Sparkles className="w-5 h-5 text-doj-orange" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title - Satyameva Jayate */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-doj-blue dark:text-doj-dark-text mb-4 bg-gradient-to-r from-doj-blue to-doj-orange dark:from-doj-dark-text dark:to-doj-orange bg-clip-text text-transparent"
            >
              Satyameva Jayate
            </motion.h1>

            {/* Welcome Message */}
            <motion.div
              variants={itemVariants}
              className="text-center mb-8 max-w-2xl"
            >
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                Welcome to the Department of Justice AI Assistant.
              </p>
              <p className="text-doj-blue dark:text-doj-orange font-semibold text-base md:text-lg">
                Get instant, accurate answers grounded in official legal documents.
              </p>
            </motion.div>

            {/* Powered By */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-8"
            >
              <Scale className="w-4 h-4" />
              <span>Powered by AI • Trusted Legal Information</span>
              <Scale className="w-4 h-4" />
            </motion.div>

            {/* Suggestion Cards Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
            >
              {suggestedQuestions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(item.text)}
                    className="group bg-white dark:bg-doj-dark-secondary border-2 border-gray-200 dark:border-doj-dark-border rounded-lg shadow-md hover:shadow-lg hover:border-doj-orange dark:hover:border-doj-orange transition-all text-left relative overflow-hidden p-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-doj-blue/5 to-doj-orange/5 dark:from-doj-blue/10 dark:to-doj-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-3">
                      <div className="p-2 bg-doj-blue/10 dark:bg-doj-orange/20 rounded group-hover:bg-doj-orange/20 dark:group-hover:bg-doj-orange/30 transition-colors flex-shrink-0">
                        <Icon className="w-5 h-5 text-doj-blue dark:text-doj-orange" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-doj-dark-text font-medium flex-1 group-hover:text-doj-blue dark:group-hover:text-doj-orange transition-colors line-clamp-3">
                        {item.text}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        ) : (
          /* ========== ACTIVE CHAT STATE ========== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50 dark:from-doj-dark dark:to-doj-dark-secondary">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  previousUserMessage={idx > 0 ? messages[idx - 1] : null}
                  onRetry={handleRetry}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-doj-dark-secondary text-gray-800 dark:text-doj-dark-text rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 dark:border-doj-dark-border">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm max-w-md"
              >
                {error}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* CHAT INPUT - Pinned to Bottom */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}