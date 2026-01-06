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
  const center = radius + strokeWidth + 8; // Extra padding for warning arc

  // Calculate progress (0 to 1, where 1 is full circle at 8 minutes)
  const maxMinutes = 8;
  const progress = Math.min(Math.max(minutesRemaining / maxMinutes, 0), 1);

  // Stroke dash offset for progress circle
  // Starts full (8 min) and decreases as time passes
  const strokeDashoffset = circumference * (1 - progress);

  // Color changes at 3 minutes
  const strokeColor = minutesRemaining > 3 ? "#000000" : "#a0a0a0";

  const warningZoneAngle = (3 / maxMinutes) * 360; // 135 degrees
  const startAngle = warningZoneAngle; // 135 degrees

  // Tangent line coordinates - extends from outer edge toward center
  const tangentSpacing = 2;
  const tangentLength = 10;
  const tangentInnerRadius =
    strokeWidth + tangentSpacing + radius - strokeWidth / 2;
  const tangentOuterRadius = tangentInnerRadius + tangentLength;

  // 3-minute marker tangent (135 degrees)
  const innerX =
    center + tangentInnerRadius * Math.cos((startAngle * Math.PI) / 180);
  const innerY =
    center + tangentInnerRadius * Math.sin((startAngle * Math.PI) / 180);
  const outerX =
    center + tangentOuterRadius * Math.cos((startAngle * Math.PI) / 180);
  const outerY =
    center + tangentOuterRadius * Math.sin((startAngle * Math.PI) / 180);

  // Origin marker tangent (0 degrees / 360 degrees)
  const originAngle = 360;
  const originInnerX =
    center + tangentInnerRadius * Math.cos((originAngle * Math.PI) / 180);
  const originInnerY =
    center + tangentInnerRadius * Math.sin((originAngle * Math.PI) / 180);
  const originOuterX =
    center + tangentOuterRadius * Math.cos((originAngle * Math.PI) / 180);
  const originOuterY =
    center + tangentOuterRadius * Math.sin((originAngle * Math.PI) / 180);

  // Combined path: both tangents + connecting arc for smooth corners
  // Start at inner end of 3-min tangent, draw out, arc around, draw back in at origin
  const warningIndicatorPath = `
    M ${innerX} ${innerY}
    L ${outerX} ${outerY}
    A ${tangentOuterRadius} ${tangentOuterRadius} 0 0 0 ${originOuterX} ${originOuterY}
    L ${originInnerX} ${originInnerY}
  `.trim();

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

            {/* Warning indicator - combined tangents + arc for smooth corners */}
            <path
              d={warningIndicatorPath}
              fill="none"
              stroke="#000000"
              strokeWidth={2}
              strokeLinejoin="round"
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
