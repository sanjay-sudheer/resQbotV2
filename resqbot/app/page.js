"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function HomePage() {
  const [gridAnimations, setGridAnimations] = useState([]);

  useEffect(() => {
    const animations = Array.from({ length: 144 }, () => ({
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));

    setGridAnimations(animations);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-10">
        {gridAnimations.map((style, i) => (
          <div
            key={i}
            className="aspect-square bg-white/20 rounded-lg animate-fadeInOut"
            style={style}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          {/* Logo and Title */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Bot className="h-12 w-12 text-indigo-300" />
            <h1 className="text-5xl font-bold text-white tracking-tight">
              resQbot
            </h1>
          </div>

          {/* Description */}
          <p className="text-xl text-indigo-200 leading-relaxed">
            resQbot makes reporting city problems effortless. Using AI-powered
            prioritization and GPS tracking, it ensures quick action on issues that
            matter. Click below to start reporting directly on Telegram!
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="https://t.me/resQbot_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-indigo-900 bg-indigo-100 hover:bg-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              Open in Telegram
            </a>
            <Link
              href="/adminLogin"
              className="inline-flex items-center px-8 py-4 border border-indigo-300 text-lg font-medium rounded-xl text-indigo-100 hover:bg-indigo-800/30 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Animation Style */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 20;
            transform: scale(1.05);
          }
        }

        .animate-fadeInOut {
          animation: fadeInOut infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
