import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
        AI Ticket Prioritizer
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400">
        Upload a CSV of tickets, and let Gemini analyze and rank them by priority to streamline your workflow.
      </p>
    </header>
  );
};