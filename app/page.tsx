'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="scroll-smooth">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            FitAI
          </Link>

          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</a>
            <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
            <a href="#tracking" className="text-gray-300 hover:text-cyan-400 transition-colors">Tracking</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-white hover:text-cyan-400 transition-colors hidden md:block">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium hidden md:block">
              Register
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="text-white p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-md px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <a
                href="#home"
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#features"
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#tracking"
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tracking
              </a>
              <Link
                href="/login"
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Fitness Tracker
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your fitness journey with intelligent tracking, personalized insights,
              and AI-powered recommendations to achieve your health goals faster than ever.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/login"
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-xl font-semibold shadow-2xl transform hover:scale-105"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-xl font-semibold shadow-2xl backdrop-filter"
            >
              Get Started Free
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Insights</h3>
              <p className="text-gray-300">Smart recommendations based on your data and fitness goals.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-300">Detailed progress tracking with predictive modeling.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Personalized Goals</h3>
              <p className="text-gray-300">Adaptive goal setting based on your performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold from-blue-600 to-cyan-600 mb-6">
              Revolutionary <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">AI Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform goes beyond basic tracking to provide intelligent insights and recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className=" p-8 rounded-2xl shadow-xl border-l-4 border-blue-500"> 
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Intelligent Workout Planning</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Our AI analyzes your fitness level, goals, and progress to create personalized workout plans
                  that adapt and evolve with your performance, ensuring optimal results.
                </p>
              </div>

              <div className=" p-8 rounded-2xl shadow-xl border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Nutrition Intelligence</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Get personalized meal recommendations, macro breakdowns, and dietary suggestions
                  based on your fitness goals, lifestyle, and nutritional needs.
                </p>
              </div>

              <div className=" p-8 rounded-2xl shadow-xl border-l-4 border-purple-500">
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Predictive Analytics</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Forecast your progress, identify potential plateaus, and get ahead of obstacles
                  with our advanced machine learning algorithms.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
                  alt="Fitness Dashboard"
                  className="w-full h-96 object-cover rounded-xl shadow-2xl"
                />
                <div className="mt-6 text-center">
                  <h4 className="text-xl font-bold mb-2">AI-Powered Dashboard</h4>
                  <p className="opacity-90">Real-time insights and recommendations at your fingertips</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitness Tracking Section */}
      <section id='tracking' className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Fitness Tracking</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Track every aspect of your fitness journey with precision and intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💪</div>
              <h3 className="text-xl font-semibold text-white mb-3">Workout Logging</h3>
              <p className="text-gray-300 text-sm">Track exercises, sets, reps, and progression over time</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Metrics</h3>
              <p className="text-gray-300 text-sm">Monitor strength gains, endurance improvements, and performance</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚖️</div>
              <h3 className="text-xl font-semibold text-white mb-3">Weight Tracking</h3>
              <p className="text-gray-300 text-sm">Monitor body composition and weight trends with insights</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Goal Management</h3>
              <p className="text-gray-300 text-sm">Set, track, and achieve personalized fitness objectives</p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
                alt="Fitness Tracking"
                className="w-full h-80 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h3 className="text-3xl font-bold text-white">All-in-One Fitness Solution</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                From workout routines to nutrition tracking, goal setting to progress visualization,
                our platform provides everything you need to succeed in your fitness journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Real-time data synchronization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Cross-device compatibility</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Advanced privacy controls</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Export and sharing capabilities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Fitness Journey?</span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have achieved their fitness goals with our AI-powered platform.
            Start your free trial today and experience the future of fitness tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/register"
              className="px-12 py-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 text-2xl font-bold shadow-2xl transform hover:scale-105"
            >
              Start Free Trial
            </Link>

            <Link
              href="/login"
              className="px-12 py-6 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 text-xl font-semibold"
            >
              Sign In to Account
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-gray-400">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
