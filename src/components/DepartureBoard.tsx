import { useEffect, useState, useMemo } from "react";
import { RailApiService } from "../services/railApi";
import { ApiResponse, TrainService } from "../types";
import { HeroCountdown } from "./HeroCountdown";
import { parseTrainTime, getMinutesUntilDeparture } from "../utils/timeUtils";

interface DepartureBoardProps {
  apiKey: string;
  stationCode: string;
  onReset: () => void;
}

export default function DepartureBoard({
  apiKey,
  stationCode,
  onReset,
}: DepartureBoardProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const REFRESH_INTERVAL = 20000; // 20 seconds

  const fetchDepartures = async () => {
    try {
      setLoading(true);
      setError(null);
      const railApi = new RailApiService(apiKey);
      const response = await railApi.getDepartures(stationCode, 10);
      setData(response);
      setLastUpdate(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch departures"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
    const interval = setInterval(fetchDepartures, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [apiKey, stationCode]);

  // Update current time every second for smooth countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string): string => {
    if (time === "On time") return "ON TIME";
    if (time === "Cancelled") return "CANC";
    if (time === "Delayed") return "DELAY";
    return time;
  };

  const getDestinationName = (service: TrainService): string => {
    return service.destination?.[0]?.locationName || "Unknown";
  };

  // Select all trains departing within 8 minutes for hero units
  const selectedTrains = useMemo(() => {
    if (!data?.trainServices) return [];

    const eligible = data.trainServices
      .map((train) => {
        const departureTime = parseTrainTime(train.std, train.etd);
        if (!departureTime) return null;

        const minutesUntil = getMinutesUntilDeparture(
          departureTime,
          currentTime
        );
        if (minutesUntil > 8 || minutesUntil <= 0) return null;

        return { train, departureTime, minutesUntil };
      })
      .filter(
        (
          item
        ): item is {
          train: TrainService;
          departureTime: Date;
          minutesUntil: number;
        } => item !== null
      )
      .sort((a, b) => a.minutesUntil - b.minutesUntil);

    return eligible;
  }, [data?.trainServices, currentTime]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-mono">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full border-2 border-black p-8">
          <div className="text-xl font-mono mb-4">ERROR</div>
          <div className="font-mono text-sm mb-6">{error}</div>
          <button
            onClick={onReset}
            className="w-full bg-black text-white py-2 font-mono text-sm"
          >
            RESET
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-mono tracking-tight">
              {data?.locationName || stationCode}
            </h1>
            <div className="text-sm font-mono mt-1 text-gray-600">
              UPDATED:{" "}
              {lastUpdate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
          <button
            onClick={onReset}
            className="border-2 border-black px-4 py-2 font-mono text-xs hover:bg-black hover:text-white transition-colors"
          >
            RESET
          </button>
        </div>

        {/* Messages */}
        {data?.nrccMessages && data.nrccMessages.length > 0 && (
          <div className="border-2 border-black p-4 mb-6 bg-black text-white">
            {data.nrccMessages.map((msg, idx) => (
              <div key={idx} className="font-mono text-xs leading-relaxed">
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* Hero Countdowns - All Trains Departing in Next 8 Minutes */}
        {selectedTrains.length > 0 && (
          <div className="mb-6">
            {selectedTrains.map((selectedTrain, idx) => (
              <HeroCountdown
                key={selectedTrain.train.serviceID || idx}
                train={selectedTrain.train}
                departureTime={selectedTrain.departureTime}
                currentTime={currentTime}
                isPrimary={idx === 0}
              />
            ))}
          </div>
        )}

        {/* Departures Table */}
        <div className="border-2 border-black">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-black bg-black text-white font-mono text-xs md:text-sm">
            <div className="col-span-2">TIME</div>
            <div className="col-span-5">DESTINATION</div>
            <div className="col-span-2">PLATFORM</div>
            <div className="col-span-3">DEPARTING</div>
          </div>

          {/* Table Body */}
          {!data?.trainServices || data.trainServices.length === 0 ? (
            <div className="p-8 text-center font-mono text-gray-600">
              NO DEPARTURES
            </div>
          ) : (
            data.trainServices.map((service, idx) => {
              // Check if this service is in the selected trains
              const isHighlighted = selectedTrains.some((st) =>
                st.train.serviceID && service.serviceID
                  ? st.train.serviceID === service.serviceID
                  : st.train.std === service.std &&
                    st.train.etd === service.etd &&
                    getDestinationName(st.train) ===
                      getDestinationName(service) &&
                    st.train.platform === service.platform
              );

              // Check if train is cancelled
              const isCancelled = service.etd === "Cancelled";

              // Calculate delay in minutes
              const hasIndefiniteDelay = service.etd === "Delayed";
              let delayMinutes = 0;

              if (
                !isCancelled &&
                service.etd !== "On time" &&
                !hasIndefiniteDelay
              ) {
                // Parse both times to calculate delay
                const stdMatch = service.std.match(/^(\d{2}):(\d{2})$/);
                const etdMatch = service.etd.match(/^(\d{2}):(\d{2})$/);

                if (stdMatch && etdMatch) {
                  const stdMinutes =
                    parseInt(stdMatch[1]) * 60 + parseInt(stdMatch[2]);
                  const etdMinutes =
                    parseInt(etdMatch[1]) * 60 + parseInt(etdMatch[2]);
                  delayMinutes = etdMinutes - stdMinutes;

                  // Handle midnight crossover
                  if (delayMinutes < -720) delayMinutes += 1440;
                  if (delayMinutes > 720) delayMinutes -= 1440;
                }
              }

              const isDelayed = hasIndefiniteDelay || delayMinutes > 0;

              // Determine underline color based on delay severity
              let departureUnderlineClass = "";
              if (isDelayed && !isCancelled) {
                if (hasIndefiniteDelay || delayMinutes >= 10) {
                  departureUnderlineClass =
                    "underline decoration-red-600 decoration-4"; // Bright red for severe delays
                } else if (delayMinutes > 0) {
                  departureUnderlineClass =
                    "underline decoration-red-400 decoration-4"; // Light red for minor delays
                }
              }

              return (
                <div
                  key={service.serviceID || idx}
                  className={`grid grid-cols-12 gap-4 p-4 font-mono text-sm md:text-base transition-colors ${
                    isHighlighted ? "bg-gray-50" : ""
                  } ${isCancelled ? "bg-gray-100 opacity-60" : ""} ${
                    idx !== data.trainServices!.length - 1
                      ? "border-b border-black"
                      : ""
                  }`}
                >
                  <div
                    className={`col-span-2 font-bold ${
                      isCancelled ? "text-gray-400" : ""
                    }`}
                  >
                    {service.std}
                  </div>
                  <div
                    className={`col-span-5 truncate ${
                      isCancelled ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {getDestinationName(service)}
                  </div>
                  <div
                    className={`col-span-2 ${
                      isCancelled ? "text-gray-400" : ""
                    }`}
                  >
                    {service.platform || "-"}
                  </div>
                  <div
                    className={`col-span-3 font-bold ${
                      isCancelled ? "text-gray-400" : ""
                    } ${departureUnderlineClass}`}
                  >
                    {formatTime(service.etd)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs font-mono text-gray-600 text-center">
          AUTO-REFRESH: {REFRESH_INTERVAL / 1000}S
        </div>
      </div>
    </div>
  );
}
