'use client';

import { useState } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import FitnessChatbot from './FitnessChatbot';

const FloatingChatbot = ({ onRefresh }: { onRefresh?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating chatbot button */}
      {!isOpen && (
        <button
          onClick={toggleChatbot}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Open Fitness Chatbot"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chatbot panel */}
      {isOpen && (
        <div className="w-80 md:w-96 transition-all duration-300">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
              <h3 className="font-medium">Fitness AI Assistant</h3>
              <button
                onClick={toggleChatbot}
                className="text-white hover:text-gray-200 focus:outline-none"
                aria-label="Close chatbot"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="h-96">
              <DashboardProvider onRefresh={onRefresh || (() => {})}>
                <FitnessChatbot />
              </DashboardProvider>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;