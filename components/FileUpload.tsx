
import React, { useRef } from 'react';

interface FileUploadProps {
  fileName: string | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  hasData: boolean;
  onLoadSample: () => void;
  onImportInstructionsClick: () => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({ fileName, onFileChange, onAnalyze, isLoading, hasData, onLoadSample, onImportInstructionsClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="w-full max-w-lg border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer group hover:border-green-500 transition-colors duration-300"
        onClick={handleFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".csv"
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <UploadIcon />
          <p className="mt-2 text-gray-400">
            <span className="font-semibold text-green-500 group-hover:text-green-400 transition-colors">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">CSV files only</p>
        </div>
      </div>
       <div className="text-center">
         <p className="text-sm text-gray-500">
          Don't have a file?{' '}
          <button
            type="button"
            onClick={onLoadSample}
            className="font-semibold text-green-500 hover:text-green-400 transition-colors underline focus:outline-none"
          >
            Try with a sample file
          </button>
        </p>
        <p className="text-sm text-gray-500 mt-1">
            Or,{' '}
            <button
              type="button"
              onClick={onImportInstructionsClick}
              className="font-semibold text-green-500 hover:text-green-400 transition-colors underline focus:outline-none"
            >
              learn how to import from other tools
            </button>
        </p>
      </div>
      {fileName && (
        <p className="text-gray-400">Selected file: <span className="font-medium text-gray-100">{fileName}</span></p>
      )}
      <button
        onClick={onAnalyze}
        disabled={isLoading || !hasData}
        className="w-full max-w-lg px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:shadow-none"
      >
        {isLoading ? 'Analyzing...' : 'Prioritize Tickets'}
      </button>
    </div>
  );
};
