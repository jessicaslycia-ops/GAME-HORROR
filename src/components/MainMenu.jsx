import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, option, credit, extra, special
  const [bgImage, setBgImage] = useState(null);
  const [isInteracted, setIsInteracted] = useState(false);

  // Audio References
  const audioRefs = {
    press: useRef(null),
    back: useRef(null),
    bgm: useRef(null),
    move: useRef(null),
  };

  // State Nama File Audio
  const [audioNames, setAudioNames] = useState({
    press: 'Default Synth',
    back: 'Default Synth',
    bgm: 'Default Synth',
    move: 'Default Synth',
  });

  const [settings, setSettings] = useState({
    motionBlur: 'ON',
    shadow: 'HIGH',
    cinematic: 'ON',
  });

  // Fase 1: Intro berjalan otomatis selama 4 detik, lalu masuk Splash Screen
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        setGameState('splash');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Mainkan BGM otomatis saat masuk ke Home Menu
  useEffect(() => {
    if (gameState === 'menu' && audioRefs.bgm.current) {
      audioRefs.bgm.current.play().catch(() => console.log("BGM menunggu interaksi pertama."));
    }
  }, [gameState]);

  // Fungsi Upload Berkas (Gambar dan Suara)
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'background-img') {
      setBgImage(url);
    } else {
      // Hentikan audio lama jika ada sebelum diganti
      if (audioRefs[type].current) {
        audioRefs[type].current.pause();
      }
      
      audioRefs[type].current = new Audio(url);
      setAudioNames(prev => ({ ...prev, [type]: file.name }));

      if (type === 'bgm') {
        audioRefs[type].current.loop = true;
        if (gameState === 'menu' || gameState === 'option') {
          audioRefs[type].current.play();
        }
      }
    }
  };

  // Fungsi Trigger Efek Suara
  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    } else {
      // Audio Sintetis Cadangan (Jika user belum mengunggah file suara kustom)
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        
        if (type === 'move') osc.frequency.setValueAtTime(140, context.currentTime);
        if (type === 'press') osc.frequency.setValueAtTime(280, context.currentTime);
        if (type === 'back') osc.frequency.setValueAtTime(190, context.currentTime);
        
        gain.gain.setValueAtTime(0.08, context.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.12);
        osc.stop(context.currentTime + 0.12);
      } catch (e) {}
    }
  };

  // Fase 2: Aksi Instan saat Klik "Press Anything"
  const handleStartInteraction = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    playSfx('press');

    // Berpindah layar dengan cepat tanpa lag setelah efek glow merah muncul
    setTimeout(() => {
      setGameState('menu');
    }, 1000);
  };

  // Keyboard Event Listener khusus untuk Splash Screen
  useEffect(() => {
    const handleKeyDown = () => {
      if (gameState === 'splash') handleStartInteraction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isInteracted]);

  return (
    <div 
      className="horror-game-container"
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      {/* Background Glitch & Kedip */}
      {gameState !== 'intro' && <div className="glitch-bg"></div>}

      {/* 1. TAMPILAN INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* 2. TAMPILAN SPLASH (PRESS ANYTHING) */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStartInteraction}>
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'Accessing...' : 'Press Anything'}
          </div>
        </div>
      )}

      {/* 3. TAMPILAN HOME MENU UTAMA (THE ORDER STYLE) */}
      {gameState === 'menu' && (
        <div className="order-layout">
          <div className="order-header">
            <h1 className="order-title">The Order</h1>
            <span className="order-subtitle">1886</span>
          </div>

          <ul className="order-menu-list">
            <li className="order-menu-item">
              <button 
                className="order-menu-btn" 
                onMouseEnter={() => playSfx('move')} 
                onClick={() => { playSfx('press'); alert('Game Starting...'); }}
              >
                Start Game
              </button>
            </li>
            <li className="order-menu-item">
              <button 
                className="order-menu-btn" 
                onMouseEnter={() => playSfx('move')} 
                onClick={() => { playSfx('press'); setGameState('extra'); }}
              >
                Extra
              </button>
            </li>
            <li className="order-menu-item">
              <button 
                className="order-menu-btn" 
                onMouseEnter={() => playSfx('move')} 
                onClick={() => { playSfx('press'); setGameState('special'); }}
              >
                Special Content
              </button>
            </li>
            <li className="order-menu-item">
              <button 
                className="order-menu-btn" 
                onMouseEnter={() => playSfx('move')} 
                onClick={() => { playSfx('press'); setGameState('option'); }}
              >
                Option
              </button>
            </li>
            <li className="order-menu-item">
              <button 
                className="order-menu-btn" 
                onMouseEnter={() => playSfx('move')} 
                onClick={() => { playSfx('press'); setGameState('credit'); }}
              >
                Credit
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* 4. PANEL OPTION (THIEF STYLE) */}
      {gameState === 'option' && (
        <div className="thief-settings-panel">
          <div className="settings-sidebar">
            <h2>SETTINGS</h2>
            <div className="settings-category active">Graphics & Visual</div>
            <div className="settings-category active" style={{ color: '#ff1a1a' }}>Audio & Media</div>
          </div>

          <div className="settings-main">
            {/* Opsi Grafis */}
            <div className="thief-row">
              <span className="thief-label">Motion Blur</span>
              <div className="thief-toggle-group">
                <button className={`thief-toggle-btn ${settings.motionBlur === 'ON' ? 'active' : ''}`} onClick={() => setSettings({...settings, motionBlur: 'ON'})}>ON</button>
                <button className={`thief-toggle-btn ${settings.motionBlur === 'OFF' ? 'active' : ''}`} onClick={() => setSettings({...settings, motionBlur: 'OFF'})}>OFF</button>
              </div>
            </div>

            <div className="thief-row">
              <span className="thief-label">Cinematic Grain</span>
              <div className="thief-toggle-group">
                <button className={`thief-toggle-btn ${settings.cinematic === 'ON' ? 'active' : ''}`} onClick={() => setSettings({...settings, cinematic: 'ON'})}>ON</button>
                <button className={`thief-toggle-btn ${settings.cinematic === 'OFF' ? 'active' : ''}`} onClick={() => setSettings({...settings, cinematic: 'OFF'})}>OFF</button>
              </div>
            </div>

            {/* Menu Upload Background Image */}
            <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="thief-label">Background Image</span>
              <div className="upload-box" style={{ width: '100%' }}>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background-img')} />
              </div>
            </div>

            {/* Menu Upload Sound Effects & Background */}
            <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="thief-label">Press Sound (Action/Enter)</span>
              <small style={{ color: '#666', margin: '2px 0' }}>Current: {audioNames.press}</small>
              <div className="upload-box" style={{ width: '100%' }}>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'press')} />
              </div>
            </div>

            <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="thief-label">Back Sound (Cancel/Return)</span>
              <small style={{ color: '#666', margin: '2px 0' }}>Current: {audioNames.back}</small>
              <div className="upload-box" style={{ width: '100%' }}>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'back')} />
              </div>
            </div>

            <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="thief-label">Background Music (Bckgroubd Loop)</span>
              <small style={{ color: '#666', margin: '2px 0' }}>Current: {audioNames.bgm}</small>
              <div className="upload-box" style={{ width: '100%' }}>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'bgm')} />
              </div>
            </div>

            <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="thief-label">Move Effect (Mve Switch)</span>
              <small style={{ color: '#666', margin: '2px 0' }}>Current: {audioNames.move}</small>
              <div className="upload-box" style={{ width: '100%' }}>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'move')} />
              </div>
            </div>

            <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>
              Apply & Save
            </button>
          </div>

          <div className="settings-description">
            <p>Konfigurasi Audio Kustom: Unggah berkas audio (.mp3/.wav) dari perangkatmu untuk merubah aset suara permainan. Gambar latar belakang yang dipilih akan langsung diterapkan secara penuh pada Home Menu.</p>
          </div>
        </div>
      )}

      {/* INTERFACE PANEL SUPLEMEN (EXTRA, SPECIAL CONTENT, CREDIT) */}
      {(gameState === 'extra' || gameState === 'special' || gameState === 'credit') && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>
              {gameState === 'extra' && 'Extra Content'}
              {gameState === 'special' && 'Special Content'}
              {gameState === 'credit' && 'Credits'}
            </h2>
            <p style={{ margin: '30px 0', fontSize: '1.4rem', color: '#ccc' }}>
              {gameState === 'extra' && 'Galleris, Concept Arts, and Unlockable items will appear here.'}
              {gameState === 'special' && 'Bonus Developer Commentary and Behind the Scenes.'}
              {gameState === 'credit' && 'Lead Project & Designer: BEBEN'}
            </p>
            <button className="back-btn" style={{ width: '300px', margin: '0 auto' }} onClick={() => { playSfx('back'); setGameState('menu'); }}>
              Back
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
