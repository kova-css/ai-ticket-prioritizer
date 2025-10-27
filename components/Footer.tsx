
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto text-center mt-12 pb-8 px-4">
      <p className="text-xs text-gray-500">
        This tool uses generative AI. The analysis provided is for informational purposes only and should be independently verified. Do not upload sensitive or confidential information.
      </p>
      <p className="text-xs text-gray-500 mt-2">
        <a
          href="https://www.kovacss.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors"
        >
          Made by kova.css
        </a>
      </p>
    </footer>
  );
};
