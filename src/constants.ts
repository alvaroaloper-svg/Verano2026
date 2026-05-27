import { ColorPreset, MonthData } from './types';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'blue',
    name: 'Azul Cobalto',
    bgClass: 'bg-[#007FFF] text-white border-black hover:bg-blue-600',
    textClass: 'text-[#007FFF]',
    borderClass: 'border-black',
    hex: '#007FFF',
    indicatorClass: 'bg-[#007FFF]',
  },
  {
    id: 'orange',
    name: 'Naranja Neón',
    bgClass: 'bg-[#FF5F1F] text-white border-black hover:bg-orange-600',
    textClass: 'text-[#FF5F1F]',
    borderClass: 'border-black',
    hex: '#FF5F1F',
    indicatorClass: 'bg-[#FF5F1F]',
  },
  {
    id: 'purple',
    name: 'Púrpura Imperial',
    bgClass: 'bg-[#702963] text-white border-black hover:bg-purple-800',
    textClass: 'text-[#702963]',
    borderClass: 'border-black',
    hex: '#702963',
    indicatorClass: 'bg-[#702963]',
  },
  {
    id: 'black',
    name: 'Negro Carbón',
    bgClass: 'bg-[#1A1A1A] text-white border-black hover:bg-black',
    textClass: 'text-[#1A1A1A]',
    borderClass: 'border-black',
    hex: '#1A1A1A',
    indicatorClass: 'bg-[#1A1A1A]',
  },
  {
    id: 'emerald',
    name: 'Verde Pino',
    bgClass: 'bg-[#00D084] text-black border-black hover:bg-emerald-500',
    textClass: 'text-[#00D084]',
    borderClass: 'border-black',
    hex: '#00D084',
    indicatorClass: 'bg-[#00D084]',
  },
  {
    id: 'amber',
    name: 'Amarillo Ámbar',
    bgClass: 'bg-[#FFCC00] text-black border-[#1A1A1A] hover:bg-[#E5B800]',
    textClass: 'text-[#FFCC00]',
    borderClass: 'border-black',
    hex: '#FFCC00',
    indicatorClass: 'bg-[#FFCC00]',
  },
  {
    id: 'rose',
    name: 'Rosa Eléctrico',
    bgClass: 'bg-[#FF2E93] text-white border-black hover:bg-[#DE1673]',
    textClass: 'text-[#FF2E93]',
    borderClass: 'border-black',
    hex: '#FF2E93',
    indicatorClass: 'bg-[#FF2E93]',
  },
];

export const MONTHS_2026: MonthData[] = [
  { year: 2026, month: 5, name: 'Junio' },      // June is 5 in JS Date (0-indexed)
  { year: 2026, month: 6, name: 'Julio' },      // July is 6
  { year: 2026, month: 7, name: 'Agosto' },     // August is 7
  { year: 2026, month: 8, name: 'Septiembre' }, // September is 8
];

export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Escapada Isla de Mallorca',
    startDate: '2026-06-12',
    endDate: '2026-06-16',
    colorId: 'blue',
    type: 'viaje' as const,
    description: 'Vuelo reservado para Palma. Estancia en hotel frente al mar.',
    location: 'Mallorca, España',
  },
  {
    id: 'evt-2',
    title: 'Viaje a París (Verano)',
    startDate: '2026-07-20',
    endDate: '2026-07-27',
    colorId: 'rose',
    type: 'viaje' as const,
    description: 'Descubrir museos y pasear por el Sena.',
    location: 'París, Francia',
  },
  {
    id: 'evt-3',
    title: 'Festival de Música',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    colorId: 'purple',
    type: 'evento' as const,
    description: 'Entradas de fin de semana completo.',
    location: 'Aranda de Duero',
  },
  {
    id: 'evt-4',
    title: 'Reunión de Planificación',
    startDate: '2026-09-08',
    endDate: '2026-09-08',
    colorId: 'emerald',
    type: 'reunion' as const,
    description: 'Reorganización de proyectos post-vacaciones.',
    location: 'Oficina / Madrid Co-working',
  }
];
