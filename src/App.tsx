import React, { useState, useEffect } from 'react';
import { ScheduledEvent, MonthData } from './types';
import { MONTHS_2026, INITIAL_EVENTS } from './constants';
import CalendarMonth from './components/CalendarMonth';
import Sidebar from './components/Sidebar';
import EventModal from './components/EventModal';
import LoginScreen from './components/LoginScreen';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  Calendar, 
  Sparkles, 
  HelpCircle, 
  Info, 
  Layers, 
  Grid, 
  Compass, 
  CalendarDays, 
  RefreshCw,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function App() {
  // 1. Current logged-in user profile
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // 2. Core scheduling state
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [activeView, setActiveView] = useState<'todos' | number>('todos'); // 'todos' or month index (5, 6, 7, 8)
  const [todosLayout, setTodosLayout] = useState<'cuadro' | 'lista'>('cuadro');
  
  // 3. Interactive highlight focus
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);

  // 4. Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<ScheduledEvent | null>(null);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null);

  // Load events and user accounts on mount via Cloud Firestore if user was logged in
  useEffect(() => {
    async function initSession() {
      const activeSession = localStorage.getItem('cal2026_current_user');
      if (activeSession) {
        const docId = activeSession.trim().toLowerCase();
        try {
          const docRef = doc(db, 'users', docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCurrentUser(userData.username);
            setEvents(userData.events || []);
          } else {
            // Cleans stale local session identifier
            localStorage.removeItem('cal2026_current_user');
          }
        } catch (e) {
          console.error('Error fetching user profile from Cloud Firestore on mount', e);
        }
      }
      setIsLoadingSession(false);
    }
    initSession();
  }, []);

  // Sync state modifications directly to Cloud Firestore database under user directory
  const saveEvents = async (newEvents: ScheduledEvent[]) => {
    setEvents(newEvents);
    
    if (currentUser) {
      const docId = currentUser.trim().toLowerCase();
      try {
        const docRef = doc(db, 'users', docId);
        await updateDoc(docRef, {
          events: newEvents
        });
      } catch (e) {
        console.error('Failed to sync updated events with Cloud Firestore', e);
      }
    }
  };

  const handleLoginSuccess = (username: string, userEvents: ScheduledEvent[]) => {
    setCurrentUser(username);
    setEvents(userEvents);
    localStorage.setItem('cal2026_current_user', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEvents([]);
    localStorage.removeItem('cal2026_current_user');
  };


  // Add or modify a planning element (trip/event)
  const handleSaveEvent = (savedData: Omit<ScheduledEvent, 'id'> & { id?: string }) => {
    if (savedData.id) {
      // Edit existing event
      const updated = events.map(e => e.id === savedData.id ? (savedData as ScheduledEvent) : e);
      saveEvents(updated);
    } else {
      // Create new event
      const newEvent: ScheduledEvent = {
        ...savedData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      saveEvents([...events, newEvent]);
    }
  };

  // Función para eliminar un evento de la lista por su ID
  const eliminarEvento = (id: string) => {
    const filtered = events.filter(e => e.id !== id);
    saveEvents(filtered);
    if (focusedEventId === id) {
      setFocusedEventId(null);
    }
  };

  // Handlers to trigger modal editor
  const handleOpenAddModal = (dateStr: string) => {
    setSelectedEventForEdit(null);
    setSelectedDateForAdd(dateStr);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: ScheduledEvent) => {
    setSelectedDateForAdd(null);
    setSelectedEventForEdit(event);
    setIsModalOpen(true);
  };

  // Resolves the months that should be actively displayed with filters
  const visibleMonths = React.useMemo(() => {
    if (activeView === 'todos') {
      return MONTHS_2026;
    }
    return MONTHS_2026.filter(m => m.month === activeView);
  }, [activeView]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center font-display font-black uppercase text-sm tracking-widest text-black">
        Cargando Planificador...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Dynamic Upper Top Navigation Panel */}
      <header className="bg-[#FDFCFB] border-b-2 border-black sticky top-0 z-45 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3.5">
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tighter text-black">
              VERANO 2026
            </h1>
            <span className="text-sm sm:text-lg font-serif italic text-slate-500 font-medium">Un verano para recordar</span>
          </div>

          {/* User Session and Nav Month selectors */}
          <div className="flex flex-wrap items-center gap-4 justify-end">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFCC00]/15 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[11px] font-display font-black uppercase tracking-wide">
              <UserCheck className="w-4 h-4 text-black shrink-0 animate-pulse" />
              <span>{currentUser}</span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="ml-2 px-2 py-0.5 text-[10px] font-display font-black tracking-wide border-2 border-black bg-white hover:bg-black hover:text-white text-rose-600 transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Nav / Month Selector Controls */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <button
                onClick={() => setActiveView('todos')}
                className={`px-4 py-2 font-display font-black uppercase text-xs tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'todos'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-current" />
                Ver Todo (4 Meses)
              </button>
              <div className="w-0.5 h-6 bg-black pointer-events-none hidden sm:block" />
              {MONTHS_2026.map((m) => (
                <button
                  key={m.month}
                  onClick={() => setActiveView(m.month)}
                  className={`px-4 py-2 font-display font-black uppercase text-xs tracking-wider transition-colors cursor-pointer ${
                    activeView === m.month
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Interactive Calendar Blocks Grid */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Quick Informational Guide Alert */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-4">
            <div className="bg-[#FF5F1F] text-white p-1.5 border border-black shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black font-display">Guía de Uso Rápido</h4>
              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-sans font-medium">
                Haz clic en cualquier día libre de los calendarios para añadir un nuevo viaje o evento. Para cambiar o eliminar un plan existente, haz clic sobre su barra de color o búscalo en la lista lateral. Se pintarán de forma unificada con el color que elijas.
              </p>
            </div>
          </div>

          {/* Layout presentation mode options for multimonth */}
          {activeView === 'todos' && (
            <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 border-2 border-black bg-emerald-100 shrink-0 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black font-display">Distribución de Vista</h4>
                  <p className="text-[10px] text-slate-500 font-semibold font-mono uppercase tracking-wider mt-0.5">
                    ¿Cómo prefieres organizar los 4 meses?
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-1 bg-white border-2 border-black rounded-none shrink-0 self-end sm:self-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  type="button"
                  onClick={() => setTodosLayout('cuadro')}
                  className={`px-3 py-1.5 font-display font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    todosLayout === 'cuadro'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-current" />
                  Cuadro (Cuadrícula)
                </button>
                <button
                  type="button"
                  onClick={() => setTodosLayout('lista')}
                  className={`px-3 py-1.5 font-display font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    todosLayout === 'lista'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-current" />
                  Una encima de otra (Lista)
                </button>
              </div>
            </div>
          )}

          {/* Calendar responsive grid container */}
          <div className={`grid gap-8 ${activeView === 'todos' && todosLayout === 'cuadro' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
            {visibleMonths.map((monthData) => (
              <CalendarMonth
                key={monthData.month}
                monthData={monthData}
                events={events}
                onAddEvent={handleOpenAddModal}
                onEditEvent={handleOpenEditModal}
                focusedEventId={focusedEventId}
                setFocusedEventId={setFocusedEventId}
              />
            ))}
          </div>
        </div>

        {/* Right Planner Controls Sidebar Summary */}
        <div className="w-full lg:w-85 xl:w-96 shrink-0">
          <Sidebar
            events={events}
            onAddEventClick={() => handleOpenAddModal('2026-06-01')}
            onEditEventClick={handleOpenEditModal}
            onDeleteEvent={eliminarEvento}
            focusedEventId={focusedEventId}
            setFocusedEventId={setFocusedEventId}
          />
        </div>
      </main>

      {/* Persistent App Footer */}
      <footer className="bg-white border-t-2 border-black py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Planificador Estival de Eventos. Diseño Neobrutalista Bold Typography.</p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-black font-bold uppercase tracking-widest">
            <span>Local Persistent Storage</span>
            <span>•</span>
            <span>JSON Sync</span>
          </div>
        </div>
      </footer>

      {/* Planning Form Modal overlay */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={eliminarEvento}
        existingEvent={selectedEventForEdit}
        defaultDate={selectedDateForAdd}
      />
    </div>
  );
}
