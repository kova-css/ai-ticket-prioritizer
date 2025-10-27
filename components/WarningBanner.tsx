
import React from 'react';

const WarningIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

export const WarningBanner: React.FC = () => {
    return (
        <div className="mb-10 bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg flex items-center" role="alert">
            <WarningIcon />
            <div>
                <p className="font-bold">Please Note:</p>
                <p className="text-sm">AI-generated analysis may contain inaccuracies. Always review the results carefully and use them as a guide, not as a final determination.</p>
            </div>
        </div>
    );
};