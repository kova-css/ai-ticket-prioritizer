
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Loader } from './components/Loader';
import { ToggleSwitch } from './components/ToggleSwitch';
import { Dashboard } from './components/Dashboard';
import { WarningBanner } from './components/WarningBanner';
import { Footer } from './components/Footer';
import { ImportInstructionsModal } from './components/JiraConnectModal';
import { analyzeTickets } from './services/geminiService';
import { parseCsv, convertToCsv } from './utils/csvParser';
import type { Ticket, RankedTicket } from './types';

const SAMPLE_CSV_DATA = `id,summary,description,reporter
1,UI alignment issue on dashboard,"The main chart on the dashboard is misaligned on Firefox browsers.","Alice"
2,API call fails with 500 error,"When trying to save user settings, the /api/settings endpoint returns a 500 internal server error. This is a blocker.","Bob"
3,Login button color is wrong,"The login button should be blue, but it's green. Low priority visual bug.","Charlie"
4,Critical security vulnerability,"User session tokens are exposed in the browser's local storage, allowing for potential account takeover. Urgent fix needed.","Security Team"
5,Typo in welcome email,"The welcome email says 'Wlecome' instead of 'Welcome'.","Dana"
6,App crashes on startup on Android 12,"The application immediately crashes upon opening on devices running Android 12. Multiple customer reports received.","QA"
7,Image uploads are failing,"Users are reporting that image uploads are timing out and failing for files larger than 1MB.","Eve"
8,Pagination not working on search results,"The pagination on the search results page is broken; it always shows the first page.","Frank"
9,Incorrect currency symbol for UK users,"Users in the UK are seeing '$' instead of '£' for prices.","Grace"
10,Password reset link expired,"The password reset link in the email is already expired when the user clicks it. This is a critical issue preventing user access.","Heidi"
`;

type SortConfig = {
  key: keyof RankedTicket | string;
  direction: 'ascending' | 'descending';
} | null;

export default function App(): React.ReactElement {
  const [parsedTickets, setParsedTickets] = useState<Ticket[]>([]);
  const [rankedTickets, setRankedTickets] = useState<RankedTicket[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Expert Mode State
  const [isExpertMode, setIsExpertMode] = useState<boolean>(false);
  const [ticketType, setTicketType] = useState<string>('bug');
  const [customTicketType, setCustomTicketType] = useState<string>('');
  const [urgencyWeight, setUrgencyWeight] = useState<number>(1.5);
  const [severityWeight, setSeverityWeight] = useState<number>(1.0);
  const [isCategorizationEnabled, setIsCategorizationEnabled] = useState<boolean>(false);

  // Filter, Sort & Export State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'priorityRank', direction: 'ascending' });
  const [exportFiltered, setExportFiltered] = useState<boolean>(true);

  // Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearAllState = () => {
    setFileName(null);
    setParsedTickets([]);
    setRankedTickets(null);
    setError(null);
    setSearchQuery('');
    setSortConfig({ key: 'priorityRank', direction: 'ascending' });
  };

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsed = parseCsv(text);
          if (parsed.length === 0) {
            setError("CSV file is empty or invalid. Please upload a file with content.");
            setParsedTickets([]);
            setRankedTickets(null);
            return;
          }
          setParsedTickets(parsed);
          setRankedTickets(null); 
          setError(null);
          setSearchQuery('');
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("Failed to parse CSV file. Please ensure it's a valid CSV format.");
          }
          console.error(e);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsText(file);
    } else {
      clearAllState();
    }
  }, []);

  const handleLoadSampleData = useCallback(() => {
    try {
      const parsed = parseCsv(SAMPLE_CSV_DATA);
      setParsedTickets(parsed);
      setFileName("sample_bug_reports.csv");
      setRankedTickets(null);
      setError(null);
      setSearchQuery('');
    } catch (e) {
      setError("Failed to parse sample data. Please report this issue.");
      console.error(e);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (parsedTickets.length === 0) {
      setError("No ticket data to analyze. Please upload a valid CSV file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRankedTickets(null);
    setSearchQuery('');


    let effectiveTicketContext = 'tickets'; // Default context
    if (isExpertMode) {
      switch (ticketType) {
        case 'bug':
          effectiveTicketContext = 'bug reports';
          break;
        case 'customer':
          effectiveTicketContext = 'customer service tickets';
          break;
        case 'other':
          effectiveTicketContext = customTicketType.trim() || 'items';
          break;
      }
    }

    try {
      const analysisResults = await analyzeTickets(
        parsedTickets, 
        effectiveTicketContext,
        isExpertMode ? urgencyWeight : 1.5,
        isExpertMode ? severityWeight : 1.0,
        isExpertMode && isCategorizationEnabled
      );

      if (analysisResults.length !== parsedTickets.length) {
        throw new Error("AI analysis returned a mismatched number of items. Please try again.");
      }
      
      const mergedTickets = parsedTickets.map((ticket, index) => ({
        ...ticket,
        ...analysisResults[index],
      } as Omit<RankedTicket, 'priorityRank'>));

      const sortedAndRanked = mergedTickets
        .sort((a, b) => (b.priorityScore as number) - (a.priorityScore as number))
        .map((ticket, index) => ({
          ...ticket,
          priorityRank: index + 1,
        } as RankedTicket));

      setRankedTickets(sortedAndRanked);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`An error occurred during AI analysis: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [parsedTickets, isExpertMode, ticketType, customTicketType, urgencyWeight, severityWeight, isCategorizationEnabled]);

  const filteredTickets = useMemo(() => {
    if (!rankedTickets) return null;

    return rankedTickets.filter(ticket => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' || 
            Object.values(ticket).some(value => 
                String(value).toLowerCase().includes(searchLower)
            );

        return matchesSearch;
    });
  }, [rankedTickets, searchQuery]);

  const sortedAndFilteredTickets = useMemo(() => {
    if (!filteredTickets) return null;
    let sortableItems = [...filteredTickets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (Array.isArray(aValue) && Array.isArray(bValue)) {
            const aStr = aValue.join(', ');
            const bStr = bValue.join(', ');
             if (aStr < bStr) return sortConfig.direction === 'ascending' ? -1 : 1;
             if (aStr > bStr) return sortConfig.direction === 'ascending' ? 1 : -1;
             return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTickets, sortConfig]);

  const handleRequestSort = (key: keyof RankedTicket | string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const tableHeaders = useMemo(() => {
    if (!rankedTickets || rankedTickets.length === 0) return [];
    const allHeaders = Object.keys(rankedTickets[0]);
    
    const preferredOrder = [
      'priorityRank', 
      'priorityScore', 
      'category', 
      'tags', 
      'urgency', 
      'severity'
    ];
    
    const aiHeaders = preferredOrder.filter(h => allHeaders.includes(h));
    const originalHeaders = allHeaders.filter(key => !preferredOrder.includes(key));
    
    return [...aiHeaders, ...originalHeaders];
  }, [rankedTickets]);

  const handleDownload = useCallback(() => {
    const dataToExport = exportFiltered ? sortedAndFilteredTickets : rankedTickets;
    if (!dataToExport || dataToExport.length === 0) {
      alert("There is no data to export.");
      return;
    };

    const csvString = convertToCsv(dataToExport);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-t;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const originalFileName = fileName ? fileName.replace(/\.csv$/, '') : 'tickets';
    link.setAttribute('download', `${originalFileName}_prioritized.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sortedAndFilteredTickets, rankedTickets, fileName, exportFiltered]);

  const handleClearFilters = () => {
    setSearchQuery('');
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-7xl mx-auto flex-grow">
        <Header />
        <main className="mt-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
            
            <div className="flex items-center justify-center space-x-3 mb-6">
              <span className={`text-sm font-medium transition-colors ${!isExpertMode ? 'text-white' : 'text-gray-400'}`}>Standard Mode</span>
              <button
                type="button"
                onClick={() => setIsExpertMode(!isExpertMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isExpertMode ? 'bg-green-600' : 'bg-gray-600'}`}
                aria-pressed={isExpertMode}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isExpertMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${isExpertMode ? 'text-white' : 'text-gray-400'}`}>Expert Mode</span>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden space-y-6 ${isExpertMode ? 'max-h-[500px] opacity-100 pt-6 border-t border-gray-700' : 'max-h-0 opacity-0'}`}>
              <div className="w-full max-w-lg mx-auto">
                <label htmlFor="ticketType" className="block text-sm font-medium text-gray-300 mb-2">Ticket Type</label>
                <select 
                  id="ticketType"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  <option value="bug">Bug Reports</option>
                  <option value="customer">Customer Service Tickets</option>
                  <option value="other">Other...</option>
                </select>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${ticketType === 'other' ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <label htmlFor="customTicketType" className="block text-sm font-medium text-gray-300 mb-2">Describe the ticket content:</label>
                  <input 
                    type="text"
                    id="customTicketType"
                    value={customTicketType}
                    onChange={(e) => setCustomTicketType(e.target.value)}
                    placeholder="e.g., Feature requests, IT issues"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>
              </div>

              <div className="w-full max-w-lg mx-auto">
                <p className="block text-sm font-medium text-gray-300 mb-2">Priority Formula Weights</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="urgencyWeight" className="block text-xs font-medium text-gray-400">Urgency</label>
                        <input
                            type="number"
                            id="urgencyWeight"
                            value={urgencyWeight}
                            onChange={(e) => setUrgencyWeight(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="severityWeight" className="block text-xs font-medium text-gray-400">Severity</label>
                        <input
                            type="number"
                            id="severityWeight"
                            value={severityWeight}
                            onChange={(e) => setSeverityWeight(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        />
                    </div>
                </div>
              </div>
              
               <div className="w-full max-w-lg mx-auto">
                <ToggleSwitch
                  label="Enable Ticket Categorization"
                  enabled={isCategorizationEnabled}
                  onChange={setIsCategorizationEnabled}
                />
              </div>
            </div>

            <div className={isExpertMode ? 'mt-6' : ''}>
              <FileUpload 
                fileName={fileName}
                onFileChange={handleFileChange}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                hasData={parsedTickets.length > 0}
                onLoadSample={handleLoadSampleData}
                onImportInstructionsClick={() => setIsImportModalOpen(true)}
              />
            </div>
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                <p>{error}</p>
              </div>
            )}
          </div>

          {isLoading && <Loader />}

          {rankedTickets && !isLoading && (
            <div className={`mt-10 transition-all duration-700 ease-in-out ${rankedTickets ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
               <WarningBanner />
               <Dashboard 
                onSearchChange={setSearchQuery}
                onClearFilters={handleClearFilters}
                searchQuery={searchQuery}
               />

              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2 gap-4">
                <h2 className="text-2xl font-bold text-gray-100">
                  Analysis Results {sortedAndFilteredTickets && `(${sortedAndFilteredTickets.length} of ${rankedTickets.length} shown)`}
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="export-toggle" className="text-sm text-gray-400 whitespace-nowrap">Export filtered only</label>
                        <ToggleSwitch 
                            id="export-toggle"
                            enabled={exportFiltered}
                            onChange={setExportFiltered}
                        />
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900 transition-all duration-200"
                    >
                      Download CSV
                    </button>
                </div>
              </div>
              <ResultsTable 
                data={sortedAndFilteredTickets || []}
                headers={tableHeaders}
                sortConfig={sortConfig}
                onSort={handleRequestSort}
              />
            </div>
          )}
        </main>
      </div>
      <Footer />
      <ImportInstructionsModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
