import React, { useState } from 'react';
import { User, ScheduledEvent } from '../types';
import { Lock, User as UserIcon, UserPlus, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string, events: ScheduledEvent[]) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to load users from LocalStorage
  const getUsersList = (): User[] => {
    const saved = localStorage.getItem('cal2026_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Helper to save users to LocalStorage
  const saveUsersList = (users: User[]) => {
    localStorage.setItem('cal2026_users', JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    const users = getUsersList();
    const normalizedInputName = username.trim().toLowerCase();

    // Check if user exists matching username (case insensitive for easier entry)
    const foundUser = users.find(u => u.username.trim().toLowerCase() === normalizedInputName);

    if (!foundUser) {
      setError('El usuario no existe. Regístrate de forma gratuita más abajo.');
      return;
    }

    if (foundUser.passwordHash !== password) {
      setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
      return;
    }

    // Success login
    setSuccess(`¡Bienvenido de vuelta, ${foundUser.username}!`);
    setTimeout(() => {
      onLoginSuccess(foundUser.username, foundUser.events);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password || !confirmPassword) {
      setError('Rellena todos los campos para crear una cuenta.');
      return;
    }

    if (trimmedUser.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const users = getUsersList();
    const normalizedInputName = trimmedUser.toLowerCase();

    const alreadyExists = users.some(u => u.username.trim().toLowerCase() === normalizedInputName);
    if (alreadyExists) {
      setError('Este nombre de usuario ya está registrado.');
      return;
    }

    // Create a new user with an empty set of events
    const newUser: User = {
      username: trimmedUser,
      passwordHash: password,
      events: [] // fresh new user starts hungry with empty calendar planner
    };

    const updatedUsers = [...users, newUser];
    saveUsersList(updatedUsers);

    setSuccess('¡Cuenta creada correctamente!');
    
    setTimeout(() => {
      onLoginSuccess(newUser.username, newUser.events);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-black flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-md bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-300">
        
        {/* Yellow top decorative neobrutalist badge/stripe */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-[#FFCC00] border-b-2 border-black" />
        
        {/* App Greeting Tag */}
        <div className="flex justify-center mb-2 mt-4">
          <span className="bg-[#FF5F1F] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Planificador Estival 2026
          </span>
        </div>

        {/* Title Block */}
        <header className="text-center mb-6">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight text-black flex items-center justify-center gap-2">
            Verano 2026
          </h2>
          <p className="text-xs font-serif italic text-slate-500 mt-1">
            Organiza tus viajes y aventuras veraniegas con total comodidad
          </p>
        </header>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-2 border-black mb-6 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-center text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegister 
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]' 
                : 'bg-transparent text-black hover:bg-black/5'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Ingresar
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 text-center text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegister 
                ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]' 
                : 'bg-transparent text-black hover:bg-black/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Registrarse
          </button>
        </div>

        {/* Informative Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="flex flex-col gap-4">
          
          {/* USERNAME FIELD */}
          <div>
            <label className="block text-[10px] font-display font-black uppercase tracking-widest text-[#1a1a1a] mb-1">
              Nombre de Usuario
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={isRegister ? "Ej. Álvaro Alonso" : "Tu nombre o usuario"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black text-xs font-semibold uppercase tracking-wide placeholder-slate-400 focus:outline-none focus:bg-slate-50/50"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-[10px] font-display font-black uppercase tracking-widest text-[#1a1a1a] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white border-2 border-black text-xs font-semibold placeholder-slate-400 focus:outline-none focus:bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD FIELD (ONLY ON REGISTER) */}
          {isRegister && (
            <div className="animate-fade-in">
              <label className="block text-[10px] font-display font-black uppercase tracking-widest text-[#1a1a1a] mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black text-xs font-semibold placeholder-slate-400 focus:outline-none focus:bg-slate-50/50"
                />
              </div>
            </div>
          )}

          {/* ERROR STATUS PANEL */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-600 p-3 flex gap-2.5 items-center text-xs text-rose-700 font-bold uppercase tracking-wider mt-1 shadow-[2px_2px_0px_0px_rgba(224,36,36,1)]">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS STATUS PANEL */}
          {success && (
            <div className="bg-emerald-50 border-2 border-emerald-600 p-3 flex gap-2.5 items-center text-xs text-emerald-700 font-bold uppercase tracking-wider mt-1 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs font-display font-black uppercase tracking-widest bg-black text-white hover:bg-neutral-800 border-2 border-black py-4 px-4 rounded-none transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2"
          >
            {isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                Crear mi Cuenta de Planes
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Acceder al Planificador
              </>
            )}
          </button>
        </form>

      </div>

      {/* Decorative subtitle in line with styling */}
      <div className="mt-6 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
        <span>Garantía de Privacidad Local</span>
        <span>•</span>
        <span>Cifrado de Sesión</span>
      </div>
    </div>
  );
}
