import { ScheduledEvent } from './types';

/**
 * Normalizes double-digit padding for month/day numbers.
 */
export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Returns 'YYYY-MM-DD' formatted date string.
 * @param year e.g. 2026
 * @param month 0-indexed (0 = Jan, 5 = Jun)
 * @param day 1-indexed (e.g. 27)
 */
export function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Checks if targetDate is between (inclusive) startDate and endDate.
 */
export function isDateInRange(targetDateStr: string, startDateStr: string, endDateStr: string): boolean {
  return targetDateStr >= startDateStr && targetDateStr <= endDateStr;
}

/**
 * Gets all events that overlap with a specific date.
 */
export function getEventsForDate(targetDateStr: string, events: ScheduledEvent[]): ScheduledEvent[] {
  return events.filter(e => isDateInRange(targetDateStr, e.startDate, e.endDate));
}

export interface DayCell {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Computes the complete grid cells (including previous & next month's padding)
 * for a Monday-start grid representation.
 */
export function getCalendarGrid(year: number, month: number): DayCell[] {
  // First day of the targeted month
  const firstDayOfMonth = new Date(year, month, 1);
  // Get day of the week, shifted to make Monday = 0 and Sunday = 6
  let firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
  let startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Total days in the targeted month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];

  // Determine current date to highlight 'today'
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // 1. Previous month padded days
  for (let i = startOffset - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    // Calculate the actual preceding month/year
    const prevMonthVal = month === 0 ? 11 : month - 1;
    const prevYearVal = month === 0 ? year - 1 : year;
    const dateStr = formatDateString(prevYearVal, prevMonthVal, prevDay);
    cells.push({
      dateString: dateStr,
      dayNumber: prevDay,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = formatDateString(year, month, day);
    cells.push({
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // 3. Next month padded days to complete a grid (should be multiple of 7, let's fill to 42 cells)
  const remainingCellsCount = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCellsCount; i++) {
    const nextMonthVal = month === 11 ? 0 : month + 1;
    const nextYearVal = month === 11 ? year + 1 : year;
    const dateStr = formatDateString(nextYearVal, nextMonthVal, i);
    cells.push({
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Ensure 6 full rows if desired, or let it shrink dynamically to 5 or 6 rows.
  // 42 cells is standard for a clean fixed aspect ratio grid.
  while (cells.length < 42) {
    const nextMonthVal = month === 11 ? 0 : month + 1;
    const nextYearVal = month === 11 ? year + 1 : year;
    const dayVal = cells.length - totalDays - startOffset + 1;
    const dateStr = formatDateString(nextYearVal, nextMonthVal, dayVal);
    cells.push({
      dateString: dateStr,
      dayNumber: dayVal,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}
