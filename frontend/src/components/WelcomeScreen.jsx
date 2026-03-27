import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Gavel, BookOpen, FileText, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function WelcomeScreen({ onSuggestionClick }) {
  const { isDark } = useTheme();
  const suggestedQuestions = [
    { text: "What are my legal rights?", icon: Scale },
    { text: "How do I file a complaint?", icon: FileText },
    { text: "What is the appeal process?", icon: Gavel },
    { text: "Where can I find legal resources?", icon: BookOpen }
  ];

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

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-doj-blue/5 dark:bg-doj-orange/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-doj-orange/5 dark:bg-doj-blue/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl relative z-10"
      >
        <motion.div variants={itemVariants} className="relative mb-8">
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
              className="w-32 h-32 md:w-40 md:h-40 mx-auto drop-shadow-2xl filter"
              style={{
                filter: isDark
                  ? 'brightness(0) invert(1) drop-shadow(0 0 3px rgba(255, 255, 255, 0.9))'
                  : 'brightness(0) invert(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.18))',
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
              <Sparkles className="w-6 h-6 text-doj-orange" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-doj-blue dark:text-doj-dark-text mb-4 bg-gradient-to-r from-doj-blue to-doj-orange dark:from-doj-dark-text dark:to-doj-orange bg-clip-text text-transparent"
        >
          Satyameva Jayate
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed"
        >
          Welcome to the Department of Justice AI Assistant. 
          <br />
          <span className="text-doj-blue dark:text-doj-orange font-semibold">
            Get instant, accurate answers grounded in official legal documents.
          </span>
        </motion.p>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {suggestedQuestions.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSuggestionClick(item.text)}
                className="group p-5 bg-white dark:bg-doj-dark-secondary border-2 border-gray-200 dark:border-doj-dark-border rounded-xl shadow-md hover:shadow-xl hover:border-doj-orange dark:hover:border-doj-orange transition-all text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-doj-blue/5 to-doj-orange/5 dark:from-doj-blue/10 dark:to-doj-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-3">
                  <div className="p-2 bg-doj-blue/10 dark:bg-doj-orange/20 rounded-lg group-hover:bg-doj-orange/20 dark:group-hover:bg-doj-orange/30 transition-colors">
                    <Icon className="w-5 h-5 text-doj-blue dark:text-doj-orange" />
                  </div>
                  <span className="text-gray-700 dark:text-doj-dark-text font-medium text-sm flex-1 group-hover:text-doj-blue dark:group-hover:text-doj-orange transition-colors">
                    {item.text}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <Scale className="w-4 h-4" />
          <span>Powered by AI • Trusted Legal Information</span>
          <Scale className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </div>
  );
}