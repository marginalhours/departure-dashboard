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
  const jacketStrokeWidth = strokeWidth * (5 / 3); // 1.67x width (2/3 wider)
  const halfJacketWidth = jacketStrokeWidth / 2;
  const jacketSpacing = 2; // Whitespace between jacket and track
  const center = radius + strokeWidth / 2 + jacketSpacing + halfJacketWidth + 2; // Padding for outer jacket

  // Calculate progress (0 to 1, where 1 is full circle at 8 minutes)
  const maxMinutes = 8;
  const progress = Math.min(Math.max(minutesRemaining / maxMinutes, 0), 1);

  // Stroke dash offset for progress circle
  // Starts full (8 min) and decreases as time passes
  const strokeDashoffset = circumference * (1 - progress);

  // Color changes at 3 minutes
  const strokeColor = minutesRemaining > 3 ? "#000000" : "#a0a0a0";

  const warningZoneAngle = (3 / maxMinutes) * 360; // 135 degrees

  // Jacket/wrap parameters - split into inner and outer arcs wrapping the track
  const innerJacketRadius = radius - strokeWidth / 2 - jacketSpacing - halfJacketWidth / 2;
  const outerJacketRadius = radius + strokeWidth / 2 + jacketSpacing + halfJacketWidth / 2;

  // Create jacket paths from origin (0 deg) to 3-minute mark (135 deg)
  const startAngle = 0; // Origin at top
  const endAngle = warningZoneAngle; // 135 degrees

  // Inner jacket arc
  const innerStartX = center + innerJacketRadius * Math.cos((startAngle * Math.PI) / 180);
  const innerStartY = center + innerJacketRadius * Math.sin((startAngle * Math.PI) / 180);
  const innerEndX = center + innerJacketRadius * Math.cos((endAngle * Math.PI) / 180);
  const innerEndY = center + innerJacketRadius * Math.sin((endAngle * Math.PI) / 180);
  const innerJacketPath = `M ${innerStartX} ${innerStartY} A ${innerJacketRadius} ${innerJacketRadius} 0 0 1 ${innerEndX} ${innerEndY}`;

  // Outer jacket arc
  const outerStartX = center + outerJacketRadius * Math.cos((startAngle * Math.PI) / 180);
  const outerStartY = center + outerJacketRadius * Math.sin((startAngle * Math.PI) / 180);
  const outerEndX = center + outerJacketRadius * Math.cos((endAngle * Math.PI) / 180);
  const outerEndY = center + outerJacketRadius * Math.sin((endAngle * Math.PI) / 180);
  const outerJacketPath = `M ${outerStartX} ${outerStartY} A ${outerJacketRadius} ${outerJacketRadius} 0 0 1 ${outerEndX} ${outerEndY}`;

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
            {/* Inner jacket - inside the track */}
            <path
              d={innerJacketPath}
              fill="none"
              stroke="#d0d0d0"
              strokeWidth={halfJacketWidth}
              strokeLinecap="butt"
            />

            {/* Outer jacket - outside the track */}
            <path
              d={outerJacketPath}
              fill="none"
              stroke="#d0d0d0"
              strokeWidth={halfJacketWidth}
              strokeLinecap="butt"
            />

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
