'use client';

import { useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { setupEngine } from '@/lib/engine';

export default function AsciiTool() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const cleanup = setupEngine();
    return () => {
      cleanup();
      initRef.current = false;
    };
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <Canvas />
    </div>
  );
}
