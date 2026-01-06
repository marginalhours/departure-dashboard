import { useState } from 'react';

interface ApiKeySetupProps {
  onSetupComplete: (apiKey: string, stationCode: string) => void;
}

export default function ApiKeySetup({ onSetupComplete }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [stationCode, setStationCode] = useState('HIB');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() && stationCode.trim()) {
      onSetupComplete(apiKey.trim(), stationCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-black p-8">
        <h1 className="text-2xl font-mono mb-8 tracking-tight">TRAIN BOARD</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="stationCode" className="block text-sm font-mono mb-2 tracking-wide">
              STATION CODE
            </label>
            <input
              type="text"
              id="stationCode"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 font-mono focus:outline-none focus:ring-0 uppercase"
              placeholder="e.g. HIB"
              maxLength={3}
              required
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-mono mb-2 tracking-wide">
              API KEY
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 font-mono focus:outline-none focus:ring-0"
              placeholder="Enter National Rail API key"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 font-mono text-sm tracking-wide hover:bg-gray-800 transition-colors"
          >
            START
          </button>
        </form>

        <div className="mt-8 text-xs font-mono text-gray-600 space-y-1">
          <p>Get your API key from:</p>
          <a
            href="https://realtime.nationalrail.co.uk/OpenLDBWSRegistration"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            National Rail Enquiries
          </a>
        </div>
      </div>
    </div>
  );
}
