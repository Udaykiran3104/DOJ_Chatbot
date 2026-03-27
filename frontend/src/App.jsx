import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TypingIndicator } from './components/TypingIndicator';
import { LandingPage } from './components/LandingPage';

function App() {
  const [screen, setScreen] = useState('landing'); // 'landing' | 'home' | 'chat'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Keep Landing only on refresh, and make browser back work between Home/Chat.
    window.history.replaceState({ screen: 'landing' }, '');
    const onPopState = (event) => {
      const next = event.state?.screen;
      if (next === 'home') {
        setScreen('home');
        setMessages([]);
        setInput('');
        setIsLoading(false);
        return;
      }
      if (next === 'chat') {
        // Only restore if we actually have chat content; otherwise show Home.
        setScreen(messages.length > 0 ? 'chat' : 'home');
        return;
      }
      setScreen('landing');
      setMessages([]);
      setInput('');
      setIsLoading(false);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToHome = () => {
    setScreen('home');
    setMessages([]);
    setInput('');
    setIsLoading(false);
    window.history.pushState({ screen: 'home' }, '');
  };

  const goToChat = () => {
    setScreen('chat');
    window.history.pushState({ screen: 'chat' }, '');
  };

  const handleEnterChat = () => {
    goToHome();
  };

  const handleSend = async (manualQuery = null, options = {}) => {
    const query = manualQuery || input;
    if (!query.trim()) return;

    if (screen !== 'chat') goToChat();

    try {
      // 2. Prepare History
      const history = options.history ?? messages
        .filter((_, i) => i % 2 !== 0) // Basic filter to get pairs
        .map((msg, i) => [messages[i * 2]?.content, msg.content]);

      // 1. Add User Message (skip when retrying)
      const userMessage = { role: 'user', content: query };
      if (!options.isRetry) {
        setMessages(prev => [...prev, userMessage]);
      }
      setInput('');
      setIsLoading(true);

      // 3. API Call
      const response = await axios.post('http://127.0.0.1:8000/chat', {
        query: query,
        history: history
      });

      // 4. Add Bot Response
      const botMessage = {
        role: 'bot',
        content: response.data.answer,
        sources: response.data.sources,
        language: response.data.detected_language,
        isError: false,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = {
        role: 'bot',
        content: "I apologize, but I am unable to connect to the Department of Justice server. Please check your internet connection or try again later.",
        isError: true,
        retry: {
          query: query,
          history: options.history ?? messages
            .filter((_, i) => i % 2 !== 0)
            .map((msg, i) => [messages[i * 2]?.content, msg.content]),
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-[100dvh] bg-doj-bg dark:bg-doj-dark font-sans transition-colors duration-300 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {screen === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="min-h-[100dvh]"
            >
              <LandingPage onEnter={handleEnterChat} />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, scale: 1.05, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col min-h-[100dvh]"
            >
              <Header
                showBackToHome={screen === 'chat'}
                onBackToHome={goToHome}
              />

              <main className="flex-1 overflow-y-auto relative scroll-smooth">
                <div className="max-w-5xl mx-auto h-full flex flex-col">
                  
                  <AnimatePresence mode="wait">
                    {screen === 'home' ? (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                      >
                        <WelcomeScreen onSuggestionClick={(query) => handleSend(query)} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 p-4 space-y-6 pb-20"
                      >
                        {messages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                          >
                            <ChatMessage
                              message={msg}
                              previousUserMessage={index > 0 ? messages[index - 1] : null}
                              onRetry={(retry) => handleSend(retry.query, { isRetry: true, history: retry.history })}
                            />
                          </motion.div>
                        ))}
                        
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-start gap-4"
                          >
                            <div className="w-10 h-10 rounded-full bg-doj-blue dark:bg-doj-blue flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse-slow">
                              <img 
                                 src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                                 className="w-6 h-6 filter" 
                                 alt="DoJ Emblem"
                                 style={{
                                   filter: 'brightness(0) invert(1) drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))',
                                 }}
                              />
                            </div>
                            <div className="bg-white dark:bg-doj-dark-secondary border border-gray-100 dark:border-doj-dark-border rounded-2xl rounded-tl-none p-4 shadow-lg">
                              <TypingIndicator />
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </main>

              <ChatInput 
                input={input} 
                setInput={setInput} 
                handleSend={() => handleSend()} 
                isLoading={isLoading} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App;