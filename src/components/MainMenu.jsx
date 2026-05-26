import React, { useState, useEffect } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  // State untuk melacak fase layar saat ini: 'intro', 'splash', atau 'menu'
  const [gameState, setGameState] = useState('intro');
  // State khusus untuk memicu efek glow merah pada teks "Press Anything"
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    // Fase 1: Mengatur durasi intro selama 4 detik, lalu otomatis pindah ke Splash Screen
    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        setGameState('splash');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Fase 2: Menangani interaksi "Press Anything"
  const handlePressAnything = () => {
    if (isInteracted) return; // Mencegah klik ganda saat transisi berjalan

    setIsInteracted(true); // Aktifkan efek glow merah di CSS

    // Berikan jeda 1.2 detik agar efek glow merah terlihat sebelum masuk ke Home Menu
    setTimeout(() => {
      setGameState('menu');
    }, 1200);
  };

  // Mendengarkan tombol keyboard apa saja khusus untuk fase Splash Screen
  useEffect(() => {
    const handleKeyDown = () => {
      if (gameState === 'splash') {
        handlePressAnything();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isInteracted]);

  // Fungsi klik menu utama
  const handleAction = (name) => {
    alert(`Membuka Fitur: ${name}`);
  };

  return (
    <div className="horror-game-container">
      
      {/* 1. TAMPILAN INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* 2. TAMPILAN SPLASH (PRESS ANYTHING) */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handlePressAnything}>
          <div className="vignette"></div>
          <div className="top-light"></div>
          
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'Accessing...' : 'Press Anything'}
          </div>
        </div>
      )}

      {/* 3. TAMPILAN HOME MENU UTAMA */}
      {gameState === 'menu' && (
        <div className="home-menu-screen">
          <div className="vignette"></div>
          <div className="top-light"></div>

          {/* Efek Serangga Kecil Berterbangan di Dekat Lampu */}
          <div className="bugs-container">
            <div className="bug"></div>
            <div className="bug"></div>
            <div className="bug"></div>
            <div className="bug"></div>
          </div>

          {/* Efek Urat Nadi Berdenyut (Kiri Bawah & Kanan Atas) */}
          <div className="veins veins-bottom-left" style={{ '--rotation': '0deg' }}></div>
          <div className="veins veins-top-right" style={{ '--rotation': '180deg' }}></div>

          {/* Menu Opsi Sesuai Permintaan */}
          <ul className="menu-options-list">
            <li className="menu-options-item">
              <button className="menu-options-button" onClick={() => handleAction('Start Game')}>
                Start Game
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onClick={() => handleAction('Extra')}>
                Extra
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onClick={() => handleAction('Special Content')}>
                Special Content
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onClick={() => handleAction('Option')}>
                Option
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onClick={() => handleAction('Credit')}>
                Credit
              </button>
            </li>
          </ul>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
