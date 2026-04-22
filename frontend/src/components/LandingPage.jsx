import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, Sparkles, ShieldCheck, Award, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-doj-bg dark:bg-doj-dark flex items-stretch justify-center">
      <div className="absolute top-4 right-4 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/80 dark:bg-doj-dark-secondary/80 text-gray-700 dark:text-doj-dark-text hover:bg-white dark:hover:bg-doj-dark-border transition-colors shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-doj-dark-border/50"
          aria-label="Toggle dark mode"
          title="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-doj-blue/10 dark:bg-doj-blue/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-doj-orange/10 dark:bg-doj-orange/20 rounded-full blur-3xl"
          animate={{
            x: [0, -120, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 dark:bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -80, 80, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating justice symbols */}
        <motion.div
          className="absolute top-1/4 left-1/4 hidden md:block"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Scale className="w-12 h-12 md:w-16 md:h-16 text-doj-blue/20 dark:text-doj-blue/30" />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-between px-4 py-6 sm:py-8 md:py-10 lg:py-12 min-h-[100dvh]"
      >
        {/* Emblem Section */}
        <motion.div variants={itemVariants} className="relative mb-4 md:mb-6 lg:mb-8">
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
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto drop-shadow-2xl filter"
              style={{
                filter: isDark
                  ? 'brightness(0) invert(1) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))'
                  : 'brightness(0) invert(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))',
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
              <Sparkles className="w-8 h-8 text-doj-orange" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2"
              animate={{
                rotate: -360,
                scale: [1, 1.3, 1],
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity }
              }}
            >
              <Award className="w-6 h-6 text-doj-blue dark:text-doj-orange" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title Section */}
        <motion.div variants={itemVariants} className="text-center mb-4 md:mb-6 lg:mb-8 px-4">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 lg:mb-5 bg-gradient-to-r from-doj-blue via-doj-orange to-doj-blue dark:from-doj-dark-text dark:via-doj-orange dark:to-doj-dark-text bg-clip-text text-transparent"
            style={{
              backgroundSize: '200% auto',
            }}
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            Satyameva Jayate
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-semibold mb-2 md:mb-3"
          >
            Department of Justice
          </motion.p>
          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400"
          >
            Ministry of Law and Justice, Government of India
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.div variants={itemVariants} className="text-center mb-6 md:mb-8 lg:mb-10 max-w-4xl px-4">
          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            Your trusted AI-powered legal assistant
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">
              <span className="text-doj-blue dark:text-doj-orange font-bold">
                Get instant, accurate answers grounded in official legal documents
              </span>
            </span>
          </motion.p>
        </motion.div>

        {/* CTA Button - Centered after tagline */}
        <motion.div variants={itemVariants} className="mb-6 md:mb-8 lg:mb-10">
          <motion.button
            onClick={() => navigate('/auth')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 bg-gradient-to-r from-doj-blue to-blue-700 dark:from-doj-blue dark:to-blue-800 text-white rounded-full font-bold text-base sm:text-lg md:text-xl shadow-2xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-doj-orange to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <span className="relative flex items-center gap-2 sm:gap-3">
              Get Started
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight size={20} className="sm:w-6 sm:h-6" />
              </motion.div>
            </span>
          </motion.button>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-auto pt-4 sm:pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-8 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 px-4 pb-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-doj-blue dark:text-doj-orange" />
            <span className="font-medium">24/7 Available</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-doj-blue dark:text-doj-orange" />
            <span className="font-medium">Secure & Trusted</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-doj-blue dark:text-doj-orange" />
            <span className="font-medium">Official Documents</span>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}

