
import React, { useEffect, useState } from 'react';

interface ImportInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Platform = 'Jira' | 'Trello' | 'GitHub' | 'Asana';

const platformInstructions: Record<Platform, React.ReactElement> = {
  Jira: (
    <>
      <h3 className="text-lg font-semibold text-gray-200 pt-2">Here’s how to do it:</h3>
      <ol className="list-decimal list-inside space-y-2 pl-2">
        <li>In Jira, navigate to your desired project and use the search or JQL to filter for the tickets you want to analyze (e.g., <code className="bg-gray-700 text-sm p-1 rounded">status = "To Do"</code>).</li>
        <li>Click the <span className="font-semibold">"Export"</span> button (often an icon in the top right) and select <span className="font-semibold">"Export Excel CSV (all fields)"</span>.</li>
        <li>Once the download is complete, come back here and upload the CSV file using the uploader.</li>
      </ol>
      <p className="pt-2">
        For more detailed instructions, you can visit the official Atlassian documentation.
        {' '}
        <a href="https://support.atlassian.com/automation/kb/how-to-export-issues-from-jira-cloud-in-csv-format/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">Learn more on Atlassian's site.</a>
      </p>
    </>
  ),
  Trello: (
     <>
      <h3 className="text-lg font-semibold text-gray-200 pt-2">Here’s how to do it:</h3>
      <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>In Trello, open the board you want to export. <span className="text-gray-400 text-xs">(Note: CSV export is a feature of Trello Standard, Premium, and Enterprise plans)</span>.</li>
          <li>Open the board menu by clicking the three dots (<span className="font-bold">...</span>) icon in the top-right corner.</li>
          <li>Select <span className="font-semibold">"Print and export"</span>.</li>
          <li>Click <span className="font-semibold">"Export as CSV"</span> and wait for the download to complete.</li>
          <li>Upload the downloaded file here.</li>
      </ol>
    </>
  ),
  GitHub: (
     <>
      <h3 className="text-lg font-semibold text-gray-200 pt-2">Here’s how to do it:</h3>
      <ol className="list-decimal list-inside space-y-2 pl-2">
          <li>GitHub doesn't have a built-in CSV export for issues. The easiest method is using a free GitHub Marketplace app.</li>
          <li>Go to the <a href="https://github.com/marketplace" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">GitHub Marketplace</a> and search for an app like <span className="font-semibold">"Issue Exporter"</span>.</li>
          <li>Install and authorize the app for the repository containing the issues you want to export.</li>
          <li>Follow the app's instructions to generate and download a CSV file.</li>
          <li>Upload the resulting CSV file here.</li>
      </ol>
    </>
  ),
  Asana: (
     <>
      <h3 className="text-lg font-semibold text-gray-200 pt-2">Here’s how to do it:</h3>
      <ol className="list-decimal list-inside space-y-2 pl-2">
        <li>In Asana, open the project you want to export.</li>
        <li>Click the dropdown arrow next to the project's name in the header.</li>
        <li>Go to <span className="font-semibold">"Export/Print"</span> and select <span className="font-semibold">"CSV"</span>.</li>
        <li>The export process will begin. You'll receive an email with a download link when it's ready.</li>
        <li>Use the link to download the file, then upload it here.</li>
      </ol>
    </>
  ),
};

const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ImportInstructionsModal: React.FC<ImportInstructionsModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<Platform>('Jira');
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity animate-[fade-in_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full transform transition-all animate-[slide-up_0.3s_ease-out]"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="jira-modal-title" className="text-2xl font-bold text-gray-100 flex items-center">
            <InfoIcon />
            Importing Tickets from Other Tools
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-gray-300 space-y-4">
          <p>
            While a direct API connection isn't feasible in this secure, browser-only environment, you can easily import your items by exporting them to a CSV file. Select your platform below for instructions.
          </p>
          
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              {(Object.keys(platformInstructions) as Platform[]).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors
                    ${activePlatform === platform
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                    }`}
                >
                  {platform}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="pt-2">
            {platformInstructions[activePlatform]}
          </div>
          
        </div>

        <div className="mt-8 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all"
          >
            Got It
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};
