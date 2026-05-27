/**
 * Types for the 2026 Event Planner Application.
 */

export type EventType = 'viaje' | 'evento' | 'reunion' | 'otro';

export interface ColorPreset {
  id: string;
  name: string;
  bgClass: string;      // Tailwind background color
  textClass: string;    // Tailwind text color
  borderClass: string;  // Tailwind border color
  hex: string;          // Hex identifier
  indicatorClass: string; // Circle dot styling
}

export interface ScheduledEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  colorId: string;   // Presets like 'red', 'blue', etc.
  type: EventType;
  description?: string;
  location?: string;
}

export interface MonthData {
  year: number;
  month: number; // 0-indexed (5 for June, 6 for July, 7 for August, 8 for September)
  name: string;
}

export interface User {
  username: string;
  passwordHash: string; // Plain password for this local demo implementation
  events: ScheduledEvent[];
}

