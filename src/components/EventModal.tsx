import React, { useState, useEffect } from 'react';
import { ScheduledEvent, EventType, ColorPreset } from '../types';
import { COLOR_PRESETS } from '../constants';
import { AnimatePresence, motion } from 'motion/react';
import { X, Calendar, MapPin, AlignLeft, Info, Trash2, Tag, Flag } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<ScheduledEvent, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  existingEvent?: ScheduledEvent | null;
  defaultDate?: string | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingEvent,
  defaultDate,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [colorId, setColorId] = useState('blue');
  const [type, setType] = useState<EventType>('viaje');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load either existing event or defaults when component focus shifts
  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setStartDate(existingEvent.startDate);
      setEndDate(existingEvent.endDate);
      setColorId(existingEvent.colorId);
      setType(existingEvent.type);
      setDescription(existingEvent.description || '');
      setLocation(existingEvent.location || '');
      setError(null);
      setShowDeleteConfirm(false);
    } else {
      setTitle('');
      // Use pre-selected date if present, or fallback to current summer date
      const dDate = defaultDate || '2026-06-01';
      setStartDate(dDate);
      setEndDate(dDate);
      setColorId('blue');
      setType('viaje');
      setDescription('');
      setLocation('');
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [existingEvent, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Por favor, indica un nombre para el evento.');
      return;
    }

    if (!startDate) {
      setError('La fecha de inicio es requerida.');
      return;
    }

    if (!endDate) {
      setError('La fecha de fin es requerida.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    // Call onSave with parameters
    onSave({
      ...(existingEvent ? { id: existingEvent.id } : {}),
      title,
      startDate,
      endDate,
      colorId,
      type,
      description,
      location,
    });
    onClose();
  };

  const handleDateChange = (type: 'start' | 'end', val: string) => {
    if (type === 'start') {
      setStartDate(val);
      // If end date is now empty or before new start date, update it automatically to preserve usability
      if (!endDate || new Date(val) > new Date(endDate)) {
        setEndDate(val);
      }
    } else {
      setEndDate(val);
    }
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs"
        />

        {/* Modal body container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-white w-full max-w-lg rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-white border-b-2 border-black px-6 py-4.5">
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-black flex items-center gap-2">
              <span className={`w-3.5 h-3.5 border border-black ${COLOR_PRESETS.find(p => p.id === colorId)?.indicatorClass || 'bg-slate-400'}`} />
              {existingEvent ? 'Editar Evento o Viaje' : 'Añadir Nuevo Evento o Viaje'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 border-2 border-black hover:bg-black hover:text-white text-black bg-white transition-colors cursor-pointer rounded-none"
            >
              <X className="w-5 h-5 text-current" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh] no-scrollbar">
            {error && (
              <div className="bg-[#FFF0F2] text-rose-600 text-[11px] font-display font-black uppercase tracking-wider px-3.5 py-3 border-2 border-black flex items-start gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Event Name */}
            <div className="space-y-1.5">
              <label htmlFor="event-title" className="block text-xs font-display font-black text-black uppercase tracking-widest">
                Nombre del Evento / Viaje <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="event-title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null); }}
                className="w-full h-10 px-3.5 bg-white border-2 border-black rounded-none focus:outline-none focus:bg-[#FFFDFB] text-xs font-mono font-bold placeholder-slate-400"
                placeholder="Ej. Escapada Rural, Vuelo a Menorca..."
                autoFocus
              />
            </div>

            {/* Category / Type Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-display font-black text-black uppercase tracking-widest">
                Categoría del Evento
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['viaje', 'evento', 'reunion', 'otro'] as EventType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 text-[10px] font-display font-black uppercase tracking-wider border-2 border-black transition-colors rounded-none cursor-pointer ${
                      type === t
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {t === 'viaje' ? '✈️ Viaje' : t === 'evento' ? '🎉 Plan' : t === 'reunion' ? '💼 Trabajo' : '📌 Otro'}
                  </button>
                ))}
              </div>
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="start-date" className="block text-xs font-display font-black text-black uppercase tracking-widest">
                  Fecha Inicio <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-black pointer-events-none" />
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-white border-2 border-black rounded-none focus:outline-none focus:bg-[#FFFDFB] text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="end-date" className="block text-xs font-display font-black text-black uppercase tracking-widest">
                  Fecha Fin <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-black pointer-events-none" />
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-white border-2 border-black rounded-none focus:outline-none focus:bg-[#FFFDFB] text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Custom Color Selector (Highlight / Select the Event same color) */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-black" />
                Color del Evento (Identificador de Viaje)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setColorId(p.id)}
                    title={p.name}
                    className={`w-9 h-9 rounded-full relative transition-transform hover:scale-105 cursor-pointer flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${p.indicatorClass} ${
                      colorId === p.id ? 'ring-2 ring-black ring-offset-2' : ''
                    }`}
                    id={`color-preset-select-${p.id}`}
                  >
                    {colorId === p.id && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-black shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 italic font-semibold leading-relaxed block mt-1">
                Este color se aplicará de forma sincronizada a todos los días de la franja del evento.
              </span>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-xs font-display font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-black" />
                Ubicación / Destino
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border-2 border-black rounded-none focus:outline-none focus:bg-[#FFFDFB] text-xs font-mono font-bold placeholder-slate-400"
                placeholder="Ej. Madrid, París, Hotel Sol y Playa..."
              />
            </div>

            {/* Description / Notes */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-display font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-black" />
                Notas del Plan / Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white border-2 border-black rounded-none focus:outline-none focus:bg-[#FFFDFB] text-xs font-sans font-bold resize-none placeholder-slate-400"
                placeholder="Escribe detalles del itinerario, enlaces a reservas, etc..."
              />
            </div>

            {/* Footer buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t-2 border-black">
              {showDeleteConfirm ? (
                <div className="w-full bg-[#FFF0F2] border-2 border-black p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-center sm:text-left">
                    <span className="block text-xs font-display font-black text-black uppercase tracking-widest">
                      ¿CONFIRMAR ELIMINACIÓN?
                    </span>
                    <span className="block text-[10px] text-slate-550 font-semibold font-mono uppercase tracking-wider mt-0.5">
                      Esta acción es irreversible
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (existingEvent) {
                          onDelete?.(existingEvent.id);
                          onClose();
                        }
                      }}
                      className="px-4 py-2 text-xs font-display font-black uppercase tracking-widest text-white bg-[#FF2E93] border-2 border-black hover:bg-rose-700 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      SÍ, BORRAR
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-xs font-display font-black uppercase tracking-wider text-black bg-white border-2 border-black hover:bg-slate-100 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      NO, VOLVER
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {existingEvent && onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-display font-black uppercase tracking-widest text-[#FF2E93] bg-[#FF2E93]/15 hover:bg-[#FF2E93] hover:text-white px-3.5 py-2.5 border-2 border-black rounded-none cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(255,46,147,1)]"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                      Eliminar
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-display font-black uppercase tracking-wider text-black hover:bg-black hover:text-white border-2 border-transparent hover:border-black rounded-none cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 sm:w-auto px-5 py-2.5 text-xs font-display font-black uppercase tracking-widest text-white bg-[#007FFF] border-2 border-black hover:bg-blue-600 rounded-none transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Confirmar Plan
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
