import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('theme') !== 'light';
    setIsDark(isDarkStored);
    if (isDarkStored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-none bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-2 border-zinc-400 dark:border-zinc-700 hover:border-zinc-950 dark:hover:border-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-zinc-100" /> : <Moon className="w-4 h-4 text-zinc-900" />}
    </button>
  );
}
