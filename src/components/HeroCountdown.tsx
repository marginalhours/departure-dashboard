/**
 * HeroCountdown - Circular countdown timer for next departing train
 */

import React from "react";
import { TrainService } from "../types";
import {
  getMinutesUntilDeparture,
  formatCountdown,
  getDestinationName,
} from "../utils/timeUtils";

interface HeroCountdownProps {
  train: TrainService;
  departureTime: Date;
  currentTime: Date;
  isPrimary?: boolean;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({
  train,
  departureTime,
  currentTime,
  isPrimary = false,
}) => {
  // Calculate time remaining
  const minutesRemaining = getMinutesUntilDeparture(departureTime, currentTime);
  const countdownText = formatCountdown(minutesRemaining);

  // SVG circle parameters - larger for primary
  const radius = isPrimary ? 100 : 70;
  const strokeWidth = isPrimary ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  // Calculate progress (0 to 1, where 1 is full circle at 8 minutes)
  const maxMinutes = 8;
  const progress = Math.min(Math.max(minutesRemaining / maxMinutes, 0), 1);

  // Stroke dash offset for progress circle
  // Starts full (5 min) and decreases as time passes
  const strokeDashoffset = circumference * (1 - progress);

  // Color changes at 3 minutes
  const strokeColor = minutesRemaining > 3 ? "#000000" : "#ff6467";

  // 3-minute marker position
  // At 3 minutes remaining, we're at 37.5% progress (3/8)
  // Circle starts at top (12 o'clock) due to -90deg rotation
  // 3 minutes = 37.5% around = 135 degrees from top
  const threeMinuteProgress = 3 / maxMinutes;
  const threeMinuteAngle = threeMinuteProgress * 360;
  const markerRadius = isPrimary ? 7 : 5;
  const markerX =
    center + radius * Math.cos((threeMinuteAngle * Math.PI) / 180);
  const markerY =
    center + radius * Math.sin((threeMinuteAngle * Math.PI) / 180);

  const destination = getDestinationName(train);
  const platform = train.platform || "TBA";

  return (
    <div
      className={`border-2 border-black bg-white mb-4 transition-all duration-300 ${
        isPrimary ? "p-10 shadow-lg" : "p-6 scale-90 opacity-90"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* SVG Circular Countdown */}
        <div className={`relative ${isPrimary ? "mb-8" : "mb-4"}`}>
          <svg
            width={center * 2}
            height={center * 2}
            className="transform -rotate-90"
          >
            {/* Background circle (light gray) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e5e5e5"
              strokeWidth={strokeWidth}
            />

            {/* Progress circle (black or gray) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke 0.3s ease, stroke-dashoffset 0.3s ease",
              }}
            />

            {/* 3-minute marker (small circle on the edge) */}
            <circle
              cx={markerX}
              cy={markerY}
              r={markerRadius}
              fill="#808080"
              className="opacity-60"
            />
          </svg>

          {/* Countdown text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-bold font-mono ${
                isPrimary ? "text-6xl" : "text-4xl"
              }`}
            >
              {countdownText}
            </span>
          </div>
        </div>

        {/* Train information */}
        <div className="text-center">
          <div
            className={`font-mono font-bold uppercase mb-2 tracking-tight ${
              isPrimary ? "text-3xl" : "text-xl"
            }`}
          >
            {destination}
          </div>
          <div
            className={`font-mono text-gray-600 uppercase tracking-wide ${
              isPrimary ? "text-base" : "text-xs"
            }`}
          >
            Platform {platform}
          </div>
        </div>
      </div>
    </div>
  );
};
