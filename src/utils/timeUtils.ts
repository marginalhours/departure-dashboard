/**
 * Time utilities for parsing train departure times and calculating countdowns
 */

import { TrainService } from '../types';

/**
 * Parses train departure time from std (scheduled) and etd (estimated) strings.
 * Returns a Date object representing the departure time, or null if invalid/cancelled.
 *
 * Priority:
 * 1. Use etd if it's a specific time (e.g., "16:47")
 * 2. Fall back to std if etd is "On time"
 * 3. Return null for "Cancelled" or non-specific "Delayed"
 *
 * @param std - Scheduled time of departure (e.g., "16:45")
 * @param etd - Estimated time of departure (e.g., "On time", "16:47", "Cancelled", "Delayed")
 * @returns Date object for departure time, or null if invalid
 */
export function parseTrainTime(std: string, etd: string): Date | null {
  const now = new Date();
  let timeString: string;

  // Handle special etd cases
  if (etd === 'Cancelled') {
    return null; // Exclude cancelled trains
  }

  if (etd === 'Delayed') {
    return null; // Non-specific delay, can't calculate countdown
  }

  // Use etd if it's a specific time (HH:MM format), otherwise use std
  if (/^\d{2}:\d{2}$/.test(etd)) {
    timeString = etd; // Use estimated time
  } else if (etd === 'On time') {
    timeString = std; // Use scheduled time
  } else {
    timeString = std; // Fallback to scheduled time
  }

  // Parse time string
  const [hours, minutes] = timeString.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return null; // Invalid time format
  }

  // Create departure time based on current date
  const departureTime = new Date(now);
  departureTime.setHours(hours, minutes, 0, 0);

  // Handle midnight crossover
  // If current time is late evening (after 8 PM) and departure time appears earlier,
  // assume the departure is tomorrow (e.g., current: 23:50, departure: 00:10)
  if (departureTime < now && now.getHours() >= 20) {
    departureTime.setDate(departureTime.getDate() + 1);
  }

  // Also handle early morning case
  // If current time is early morning (before 4 AM) and departure is late evening,
  // assume the departure was yesterday and has passed
  if (departureTime > now && now.getHours() < 4 && departureTime.getHours() >= 20) {
    departureTime.setDate(departureTime.getDate() - 1);
  }

  return departureTime;
}

/**
 * Calculates the number of decimal minutes until departure.
 *
 * @param departureTime - The departure time as a Date object
 * @param currentTime - The current time as a Date object
 * @returns Number of minutes until departure (can be negative if past)
 */
export function getMinutesUntilDeparture(
  departureTime: Date,
  currentTime: Date
): number {
  const millisecondsDiff = departureTime.getTime() - currentTime.getTime();
  return millisecondsDiff / (1000 * 60); // Convert to minutes
}

/**
 * Converts decimal minutes to display format (minutes and seconds).
 *
 * @param minutes - Decimal minutes (e.g., 3.5)
 * @returns Object with separate minutes and seconds
 */
export function getCountdownDisplay(minutes: number): {
  minutes: number;
  seconds: number;
} {
  const totalSeconds = Math.max(0, Math.floor(minutes * 60));
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  return {
    minutes: displayMinutes,
    seconds: displaySeconds,
  };
}

/**
 * Formats countdown for display as MM:SS.
 *
 * @param minutes - Decimal minutes
 * @returns Formatted string like "3:45" or "0:30"
 */
export function formatCountdown(minutes: number): string {
  const { minutes: m, seconds: s } = getCountdownDisplay(minutes);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Checks if a train is eligible to be shown in the hero countdown.
 * Eligible trains are:
 * - Departing within 5 minutes
 * - Not yet departed (> 0 seconds remaining)
 * - Not cancelled or delayed (parseable time)
 *
 * @param train - Train service object
 * @param currentTime - Current time as Date object
 * @returns true if train should be shown in hero unit
 */
export function isTrainEligibleForHero(
  train: TrainService,
  currentTime: Date
): boolean {
  const departureTime = parseTrainTime(train.std, train.etd);

  if (!departureTime) {
    return false; // Can't parse time or train is cancelled
  }

  const minutesUntil = getMinutesUntilDeparture(departureTime, currentTime);

  return minutesUntil > 0 && minutesUntil <= 5;
}

/**
 * Gets destination name from train service.
 * Handles multiple destinations and via points.
 *
 * @param train - Train service object
 * @returns Destination name string
 */
export function getDestinationName(train: TrainService): string {
  if (!train.destination || train.destination.length === 0) {
    return 'Unknown';
  }

  // Return first destination's location name
  return train.destination[0].locationName;
}
