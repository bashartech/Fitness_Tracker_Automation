'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import ReactMarkdown from 'react-markdown';

const FitnessChatbot = () => {
  const { refreshData } = useDashboard(); // Get the refresh function from context
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Fitness Tracker AI Assistant. You can ask me to add workouts, nutrition logs, weight measurements, or goals!",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Get the authentication token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('fitness-token') : null;
    console.log("INPUT---> ", inputMessage)


    if (!token) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "You need to be logged in to use the AI assistant. Please log in first.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to our API proxy endpoint with authentication
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: inputMessage }),
      });
      console.log("INPUT---> ", inputMessage)
      console.log("RESPONSE---> ", response)

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botMessage]);

        // Check if the response indicates data was modified, and trigger refresh if so
        // We'll look for keywords that suggest data was changed
        const responseText = data.response.toLowerCase();
        if (responseText.includes('added') || responseText.includes('updated') || responseText.includes('created') || responseText.includes('deleted')) {
          // Add a small delay before refreshing to allow the message to be displayed
          setTimeout(() => {
            refreshData();
          }, 1000);
        }
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I encountered an error processing your request: " + (data.error || "Unknown error"),
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-96 flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fitness AI Assistant</h3>

      <div className="flex-1 overflow-y-auto mb-4 max-h-60 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.sender === 'bot' ? (
                <div className="text-sm prose prose-sm max-w-none">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{message.text}</p>
              )}
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your fitness goals..."
          className="flex-1 border text-gray-900 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isTyping}
        />
        <button
          onClick={handleSendMessage}
          disabled={isTyping || !inputMessage.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default FitnessChatbot;