import { useState, useEffect } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import DepartureBoard from './components/DepartureBoard';
import { RailApiService } from './services/railApi';

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [stationCode, setStationCode] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = RailApiService.getApiKey();
    const savedStation = RailApiService.getStationCode();
    if (savedKey && savedStation) {
      setApiKey(savedKey);
      setStationCode(savedStation);
    }
  }, []);

  const handleSetupComplete = (key: string, station: string) => {
    RailApiService.saveApiKey(key);
    RailApiService.saveStationCode(station);
    setApiKey(key);
    setStationCode(station);
  };

  const handleReset = () => {
    RailApiService.clearAll();
    setApiKey(null);
    setStationCode(null);
  };

  if (!apiKey || !stationCode) {
    return <ApiKeySetup onSetupComplete={handleSetupComplete} />;
  }

  return <DepartureBoard apiKey={apiKey} stationCode={stationCode} onReset={handleReset} />;
}
