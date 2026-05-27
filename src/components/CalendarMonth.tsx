import React from 'react';
import { MonthData, ScheduledEvent } from '../types';
import { getCalendarGrid, getEventsForDate } from '../utils';
import { COLOR_PRESETS, WEEKDAYS_SHORT } from '../constants';
import { Plus, CalendarDays } from 'lucide-react';

interface CalendarMonthProps {
  key?: React.Key;
  monthData: MonthData;
  events: ScheduledEvent[];
  onAddEvent: (dateStr: string) => void;
  onEditEvent: (event: ScheduledEvent) => void;
  focusedEventId?: string | null;
  setFocusedEventId: (id: string | null) => void;
}

export default function CalendarMonth({
  monthData,
  events,
  onAddEvent,
  onEditEvent,
  focusedEventId,
  setFocusedEventId,
}: CalendarMonthProps) {
  const { year, month, name } = monthData;
  const gridCells = getCalendarGrid(year, month);
  const monthNumberStr = String(month + 1).padStart(2, '0');

  // Calculate today's date for crossing out past days
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-none border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-full relative group/month transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Absolute watermark background monthly number */}
      <span className="absolute -top-4 -right-2 text-[130px] font-display font-black text-slate-150/45 -z-0 pointer-events-none select-none tracking-tighter leading-none opacity-60">
        {monthNumberStr}
      </span>

      {/* Month Header */}
      <div className="bg-white border-b-2 border-black px-5 py-4.5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-black shrink-0" />
          <h3 className="font-display font-black text-black text-xl uppercase tracking-tight">
            {name} <span className="text-slate-400 font-serif italic text-md normal-case font-medium ml-1">2026</span>
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-white bg-black px-3 py-1.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
          {events.filter(e => {
            const evMonth = new Date(e.startDate).getMonth();
            const evMonthEnd = new Date(e.endDate).getMonth();
            return evMonth === month || evMonthEnd === month;
          }).length} {events.filter(e => {
            const evMonth = new Date(e.startDate).getMonth();
            const evMonthEnd = new Date(e.endDate).getMonth();
            return evMonth === month || evMonthEnd === month;
          }).length === 1 ? 'PLAN' : 'PLANES'}
        </span>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 border-b-2 border-black text-center bg-slate-50 py-2.5 relative z-10">
        {WEEKDAYS_SHORT.map((day) => (
          <div key={day} className="text-[10px] font-display font-black text-black uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid Grid with thick internal borders */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x-2 divide-y-2 divide-black bg-white min-h-[380px] relative z-10 border-t-0">
        {gridCells.map((cell, idx) => {
          const cellEvents = getEventsForDate(cell.dateString, events);
          const isPassed = cell.dateString < todayStr;
          
          return (
            <div
              key={`${cell.dateString}-${idx}`}
              className={`group/cell relative p-1.5 flex flex-col justify-between transition-colors min-h-[64px] ${
                cell.isCurrentMonth 
                  ? isPassed
                    ? 'bg-slate-50/70 hover:bg-slate-100/70 text-slate-500'
                    : 'bg-white hover:bg-[#FDFCFB] text-black' 
                  : 'bg-[#F6F5F2]/90 text-slate-400'
              } ${cell.isToday ? 'bg-[#FFCC00]/15 ring-2 ring-inset ring-[#FFCC00]' : ''}`}
            >
              {/* Crossed out background diagonal marker stroke for past days */}
              {isPassed && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible" preserveAspectRatio="none">
                  <line 
                    x1="0" 
                    y1="0" 
                    x2="100%" 
                    y2="100%" 
                    className="stroke-[#FF2E93]/25" 
                    strokeWidth="2.5" 
                  />
                </svg>
              )}

              {/* Day Cell Header (Number and Mini Plus Button on Hover) */}
              <div className="flex justify-between items-center mb-1 relative z-10">
                <span
                  className={`text-xs font-mono select-none px-1.5 py-0.5 font-black ${
                    cell.isToday 
                      ? 'bg-black text-[#FFCC00] font-bold border border-black' 
                      : cell.isCurrentMonth 
                        ? isPassed 
                          ? 'text-slate-400 line-through opacity-50 font-normal' 
                          : 'text-black' 
                        : isPassed
                          ? 'text-slate-350 line-through opacity-40 font-normal shadow-none'
                          : 'text-slate-400 font-normal shadow-none'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add Button, shown on group-hover inside the day cell (only show if not passed, or always clickable but subtle) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEvent(cell.dateString);
                  }}
                  title="Planificar viaje o evento"
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 border border-black hover:bg-black text-black hover:text-white bg-white cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                  id={`add-btn-${cell.dateString}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Events Container */}
              <div className="space-y-1 overflow-y-auto no-scrollbar max-h-[85px] py-0.5 flex-1 flex flex-col justify-end relative z-10">
                {cellEvents.map((event) => {
                  const preset = COLOR_PRESETS.find(p => p.id === event.colorId) || COLOR_PRESETS[0];
                  const isFocused = focusedEventId === event.id;

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                      onMouseEnter={() => setFocusedEventId(event.id)}
                      onMouseLeave={() => setFocusedEventId(null)}
                      className={`w-full text-left text-[9px] leading-none px-1.5 py-1 border border-black rounded-none overflow-hidden text-ellipsis whitespace-nowrap transition-all cursor-pointer font-display font-black uppercase tracking-wider flex items-center justify-between gap-1 select-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        preset.bgClass
                      } ${
                        isFocused 
                          ? 'ring-2 ring-black ring-offset-1 scale-[1.01]' 
                          : ''
                      } ${
                        isPassed ? 'opacity-55 line-through decoration-black/40' : ''
                      }`}
                      title={`${event.title} (${event.type === 'viaje' ? 'Viaje' : 'Evento'})\nDel ${event.startDate} al ${event.endDate}`}
                      id={`event-pill-${event.id}-${cell.dateString}`}
                    >
                      <span className="truncate">
                        {event.type === 'viaje' ? '✈️ ' : ''}
                        {event.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Transparent Clickable Overlay for whole day box, if clicked open add dialog */}
              <div 
                className="absolute inset-0 cursor-pointer z-0" 
                onClick={() => onAddEvent(cell.dateString)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
