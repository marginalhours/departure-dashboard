/**
 * HeroCountdown - Circular countdown timer for next departing train
 */

import React from 'react';
import { TrainService } from '../types';
import {
  getMinutesUntilDeparture,
  formatCountdown,
  getDestinationName,
} from '../utils/timeUtils';

interface HeroCountdownProps {
  train: TrainService;
  departureTime: Date;
  currentTime: Date;
}

export const HeroCountdown: React.FC<HeroCountdownProps> = ({
  train,
  departureTime,
  currentTime,
}) => {
  // Calculate time remaining
  const minutesRemaining = getMinutesUntilDeparture(departureTime, currentTime);
  const countdownText = formatCountdown(minutesRemaining);

  // SVG circle parameters
  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth;

  // Calculate progress (0 to 1, where 1 is full circle at 5 minutes)
  const maxMinutes = 5;
  const progress = Math.min(Math.max(minutesRemaining / maxMinutes, 0), 1);

  // Stroke dash offset for progress circle
  // Starts full (5 min) and decreases as time passes
  const strokeDashoffset = circumference * (1 - progress);

  // Color changes at 3 minutes
  const strokeColor = minutesRemaining > 3 ? '#000000' : '#808080';

  // 3-minute marker position
  // At 3 minutes remaining, we're at 60% progress (3/5)
  // Circle starts at top (12 o'clock) due to -90deg rotation
  // 3 minutes = 60% around = 216 degrees from top
  const threeMinuteProgress = 3 / maxMinutes; // 0.6
  const threeMinuteAngle = threeMinuteProgress * 360 - 90; // Adjust for rotation
  const markerRadius = 6;
  const markerX = center + radius * Math.cos((threeMinuteAngle * Math.PI) / 180);
  const markerY = center + radius * Math.sin((threeMinuteAngle * Math.PI) / 180);

  const destination = getDestinationName(train);
  const platform = train.platform || 'TBA';

  return (
    <div className="border-2 border-black p-8 mb-6 bg-white">
      <div className="flex flex-col items-center">
        {/* SVG Circular Countdown */}
        <div className="relative mb-6">
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
                transition: 'stroke 0.3s ease, stroke-dashoffset 0.3s ease',
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
            <span className="text-5xl font-bold font-mono">{countdownText}</span>
          </div>
        </div>

        {/* Train information */}
        <div className="text-center">
          <div className="text-2xl font-mono font-bold uppercase mb-2 tracking-tight">
            {destination}
          </div>
          <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">
            Platform {platform}
          </div>
        </div>
      </div>
    </div>
  );
};
