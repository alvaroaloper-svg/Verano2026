import React, { useState, useMemo } from 'react';
import { ScheduledEvent, EventType } from '../types';
import { COLOR_PRESETS } from '../constants';
import { Search, Compass, Calendar, Sparkles, MapPin, CalendarPlus2, Trash2 } from 'lucide-react';

interface SidebarProps {
  events: ScheduledEvent[];
  onAddEventClick: () => void;
  onEditEventClick: (event: ScheduledEvent) => void;
  onDeleteEvent: (id: string) => void;
  focusedEventId?: string | null;
  setFocusedEventId: (id: string | null) => void;
}

export default function Sidebar({
  events,
  onAddEventClick,
  onEditEventClick,
  onDeleteEvent,
  focusedEventId,
  setFocusedEventId,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'todos'>('todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Today reference for past events formatting
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculates chronological events sorted by start date
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  // Filters events based on search input and selected type filter
  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'todos' || e.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [sortedEvents, searchTerm, selectedType]);

  // Analytics
  const tripsCount = useMemo(() => events.filter(e => e.type === 'viaje').length, [events]);
  const otherEventsCount = useMemo(() => events.filter(e => e.type !== 'viaje').length, [events]);

  // Quick total event days (rough sum of span)
  const totalDaysSpanned = useMemo(() => {
    return events.reduce((sum, e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return sum + diffDays;
    }, 0);
  }, [events]);

  return (
    <div className="bg-white rounded-none border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full gap-6">
      {/* Title block */}
      <div>
        <div className="flex items-center gap-2 text-black mb-1">
          <Sparkles className="w-4 h-4 text-[#FF5F1F]" />
          <span className="text-xs font-mono uppercase tracking-widest font-black">Plan Verano 2026</span>
        </div>
        <h2 className="text-2xl font-display font-black text-black uppercase tracking-tighter leading-none">
          Mis Rutas y Viajes
        </h2>
        <p className="text-xs text-slate-500 font-serif italic mt-1.5 font-semibold">
          Junio • Julio • Agosto • Septiembre de 2026
        </p>
      </div>

      {/* Button to quickly add event with neobrutalist styling */}
      <button
        onClick={onAddEventClick}
        className="w-full h-11 bg-black hover:bg-slate-950 text-white rounded-none text-xs font-display font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer border-2 border-black"
        id="add-event-sidebar-btn"
      >
        <CalendarPlus2 className="w-4 h-4 text-[#FFCC00]" />
        Añadir Plan de Verano
      </button>

      {/* Numerical overview metrics (Neobrutalist Bento layout) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border-2 border-black p-3 rounded-none text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xl font-mono font-black text-black">{tripsCount}</span>
          <span className="block text-[9px] font-display font-black text-slate-500 uppercase tracking-wider mt-1">Viajes ✈️</span>
        </div>
        <div className="bg-white border-2 border-black p-3 rounded-none text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xl font-mono font-black text-black">{otherEventsCount}</span>
          <span className="block text-[9px] font-display font-black text-slate-500 uppercase tracking-wider mt-1">Planes 🎉</span>
        </div>
        <div className="bg-white border-2 border-black p-3 rounded-none text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xl font-mono font-black text-black text-[#007FFF]">{totalDaysSpanned}</span>
          <span className="block text-[9px] font-display font-black text-slate-500 uppercase tracking-wider mt-1 font-bold">Días Tot.</span>
        </div>
      </div>

      {/* Filters & Search Module */}
      <div className="space-y-3 pt-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-black" />
          <input
            type="text"
            placeholder="BUSCAR PLANES O DESTINOS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border-2 border-black rounded-none text-xs font-display font-black tracking-wider placeholder-slate-400 focus:outline-none focus:bg-[#FFFDFB]"
          />
        </div>

        {/* Categories Tab Pill Selector */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
          {([
            { id: 'todos', label: 'Todos' },
            { id: 'viaje', label: '✈️ Viajes' },
            { id: 'evento', label: '🎉 Planes' },
            { id: 'reunion', label: '💼 Trabajo' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-none text-[9px] font-display font-black uppercase tracking-wider border-2 border-black transition-colors shrink-0 cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan list view */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 max-h-[420px]">
        <h4 className="text-xs font-display font-black text-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-black shrink-0" />
          Cronograma de Planes ({filteredEvents.length})
        </h4>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-black rounded-none bg-slate-50/50">
            <Calendar className="w-8 h-8 text-black mx-auto mb-2" />
            <p className="text-[10px] font-display font-black uppercase tracking-wider text-black">No se encontraron planes.</p>
          </div>
        ) : (
          filteredEvents.map((item) => {
            const preset = COLOR_PRESETS.find(p => p.id === item.colorId) || COLOR_PRESETS[0];
            const isFocused = focusedEventId === item.id;
            
            // Spanish date format display prettier
            const formatDateNice = (str: string) => {
              const [y, m, d] = str.split('-');
              return `${parseInt(d)} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][parseInt(m) - 1]}`;
            };

            const isMultiDay = item.startDate !== item.endDate;
            const isDeleting = confirmDeleteId === item.id;
            const isPassed = item.endDate < todayStr;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setFocusedEventId(item.id)}
                onMouseLeave={() => setFocusedEventId(null)}
                onClick={() => onEditEventClick(item)}
                className={`group/item p-3.5 rounded-none border-2 border-black transition-all cursor-pointer relative overflow-hidden ${
                  isFocused 
                    ? 'bg-slate-50 translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                } ${isPassed ? 'opacity-60 bg-slate-50/60' : ''}`}
                id={`sidebar-event-item-${item.id}`}
              >
                {/* Custom Inline Delete Warning Overlay */}
                {isDeleting && (
                  <div className="absolute inset-0 bg-white z-25 flex flex-col justify-center items-center p-3 text-center border-l-8 border-[#FF2E93]">
                    <span className="text-[10px] font-display font-black text-black uppercase tracking-wider mb-2 leading-none">
                      ¿ELIMINAR ESTE PLAN?
                    </span>
                    <div className="flex gap-2 w-full justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-1.5 text-[9px] font-display font-black uppercase text-white bg-[#FF2E93] border-2 border-black hover:bg-rose-700 active:translate-y-[1px] cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-r-4 border-b-4"
                      >
                        SÍ, BORRAR
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-1.5 text-[9px] font-display font-black uppercase text-black bg-white border-2 border-black hover:bg-slate-100 active:translate-y-[1px] cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-r-4 border-b-4"
                      >
                        NO
                      </button>
                    </div>
                  </div>
                )}

                {/* Horizontal left indicator strip using the exact event color */}
                <div className={`absolute top-0 bottom-0 left-0 w-2.5 ${preset.indicatorClass} border-r-2 border-black`} />

                {/* Quick delete trash button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(item.id);
                  }}
                  title="Eliminar plan"
                  className="absolute right-2 top-2 p-1.5 border border-black bg-white hover:bg-[#FF2E93] hover:text-white text-rose-600 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer z-10 animate-fade-in"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="pl-3.5 pr-6 relative">
                  {/* Subtle diagonal line across the sidebar card title when passed */}
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-xs font-display font-black uppercase tracking-tight text-black line-clamp-1 group-hover/item:text-black transition-colors ${isPassed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </span>
                    <span className="text-[8px] font-display font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 border border-black rounded-none shrink-0 self-start">
                      {item.type === 'viaje' ? '✈️ VIAJE' : item.type === 'evento' ? '🎉 PLAN' : item.type === 'reunion' ? '💼 WORK' : '📌 PLAN'}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className={`flex items-center gap-1.5 text-[10px] font-black text-black font-mono mt-1.5 ${isPassed ? 'text-slate-400 line-through' : ''}`}>
                    <Calendar className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>
                      {isMultiDay ? `${formatDateNice(item.startDate)} - ${formatDateNice(item.endDate)}` : formatDateNice(item.startDate)}
                    </span>
                  </div>

                  {/* Location if specified */}
                  {item.location && (
                    <div className={`flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 ${isPassed ? 'opacity-70' : ''}`}>
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  {/* Description snippet */}
                  {item.description && (
                    <p className={`text-[10px] text-slate-400 mt-2 line-clamp-1 leading-relaxed italic font-serif ${isPassed ? 'opacity-60 line-through' : ''}`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
