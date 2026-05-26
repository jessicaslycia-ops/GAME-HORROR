import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

// Komponen SVG Urat Nadi Mengakar Cerah
const VeinSVG = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    {/* Batang Utama */}
    <path d="M 0,200 Q 60,140 100,100 T 200,0" fill="none" stroke="#ff1a1a" strokeWidth="4" />
    {/* Cabang-Cabang Mengakar */}
    <path d="M 50,150 Q 30,100 10,90" fill="none" stroke="#e60000" strokeWidth="2" />
    <path d="M 75,125 Q 110,130 140,160" fill="none" stroke="#cc0000" strokeWidth="2.5" />
    <path d="M 100,100 Q 130,70 120,30" fill="none" stroke="#ff3333" strokeWidth="1.5" />
    <path d="M 120,80 Q 160,60 180,70" fill="none" stroke="#990000" strokeWidth="2" />
    <path d="M 30,170 Q 10,140 5,110" fill="none" stroke="#770000" strokeWidth="1" />
  </svg>
);

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, option, credit
  const [isInteracted, setIsInteracted] = useState(false);

  // --- STATE FOR GAME SETTINGS ---
  const [settings, setSettings] = useState({
    resolution: '1920x1080',
    motionBlur: 'On',
    cinematic: 'Off',
    shadow: 'High',
    brightness: 80,
  });

  // --- REFS FOR CUSTOM SOUND EFFECTS ---
  const audioRefs = {
    press: useRef(null),
    back: useRef(null),
    bgm: useRef(null),
    move: useRef(null),
  };

  // --- STATE UNTUK NAMA FILE AUDIO YANG DIUPLOAD ---
  const [audioNames, setAudioNames] = useState({
    press: 'Default System',
    back: 'Default System',
    bgm: 'Default System',
    move: 'Default System',
  });

  // Handle Transisi dari Intro ke Splash secara otomatis
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => setGameState('splash'), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Mainkan BGM otomatis saat masuk Home Menu
  useEffect(() => {
    if (gameState === 'menu' && audioRefs.bgm.current) {
      audioRefs.bgm.current.play().catch(() => console.log("BGM butuh interaksi user pertama kali."));
    }
  }, [gameState]);

  // Fungsi Upload Audio dari Device Pengguna
  const handleAudioUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioRefs[type].current = new Audio(url);
      
      // Jika tipe audio adalah background (BGM), set agar otomatis looping
      if (type === 'bgm') {
        audioRefs[type].current.loop = true;
        // Jika sedang di home menu, langsung mainkan lagu barunya
        if (gameState === 'menu' || gameState === 'option') {
          audioRefs.bgm.current.play();
        }
      }
      
      setAudioNames(prev => ({ ...prev, [type]: file.name }));
    }
  };

  // Trigger Sound Effect Pemutar
  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    } else {
      // Bunyi default internal browser jika user belum upload file suara
      if (type === 'move' || type === 'press' || type === 'back') {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        
        if (type === 'move') osc.frequency.setValueAtTime(120, context.currentTime);
        if (type === 'press') osc.frequency.setValueAtTime(300, context.currentTime);
        if (type === 'back') osc.frequency.setValueAtTime(180, context.currentTime);
        
        gain.gain.setValueAtTime(0.1, context.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
        osc.stop(context.currentTime + 0.15);
      }
    }
  };

  const handlePressAnything = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    playSfx('press');

    setTimeout(() => {
      setGameState('menu');
    }, 1200);
  };

  // Keyboard Event Listener untuk Splash Screen
  useEffect(() => {
    const handleKeyDown = () => {
      if (gameState === 'splash') handlePressAnything();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isInteracted]);

  return (
    <div className="horror-game-container">
      {/* BACKGROUND GLITCH & KEDIP AKTIF DI SPLASH & MENU UTAMA */}
      {(gameState === 'splash' || gameState === 'menu' || gameState === 'option' || gameState === 'credit') && (
        <div className="glitch-bg"></div>
      )}

      {/* 1. TAMPILAN INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* 2. TAMPILAN SPLASH (PRESS ANYTHING) */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handlePressAnything}>
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'ACCESS GRANTED' : 'Press Anything'}
          </div>
        </div>
      )}

      {/* 3. TAMPILAN HOME MENU UTAMA */}
      {(gameState === 'menu' || gameState === 'option' || gameState === 'credit') && (
        <>
          {/* Urat Nadi Berdenyut Tetap Ada & Lebih Cerah */}
          <div className="veins-container veins-bottom-left" style={{ '--rot': '0deg' }}><VeinSVG /></div>
          <div className="veins-container veins-top-right" style={{ '--rot': '180deg' }}><VeinSVG /></div>
        </>
      )}

      {gameState === 'menu' && (
        <div className="home-menu-screen">
          <ul className="menu-options-list">
            <li className="menu-options-item">
              <button 
                className="menu-options-button" 
                onMouseEnter={() => playSfx('move')}
                onClick={() => { playSfx('press'); alert('Starting game...'); }}
              >
                Start Game
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onMouseEnter={() => playSfx('move')} onClick={() => playSfx('press')}>
                Extra
              </button>
            </li>
            <li className="menu-options-item">
              <button className="menu-options-button" onMouseEnter={() => playSfx('move')} onClick={() => playSfx('press')}>
                Special Content
              </button>
            </li>
            <li className="menu-options-item">
              <button 
                className="menu-options-button" 
                onMouseEnter={() => playSfx('move')}
                onClick={() => { playSfx('press'); setGameState('option'); }}
              >
                Option
              </button>
            </li>
            <li className="menu-options-item">
              <button 
                className="menu-options-button" 
                onMouseEnter={() => playSfx('move')}
                onClick={() => { playSfx('press'); setGameState('credit'); }}
              >
                Credit
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* 4. OPTION PANEL (BANYAK SETTING VIDEO GAME + SOUND EFFECT UPLOAD) */}
      {gameState === 'option' && (
        <div className="options-panel">
          <h2 className="panel-title">System Options</h2>
          
          {/* Video Settings */}
          <div className="setting-row">
            <span className="setting-label">Screen Resolution</span>
            <select 
              value={settings.resolution} 
              onChange={(e) => setSettings({...settings, resolution: e.target.value})}
            >
              <option value="2560x1440">2560 x 1440 (2K)</option>
              <option value="1920x1080">1920 x 1080 (FHD)</option>
              <option value="1280x720">1280 x 720 (HD)</option>
            </select>
          </div>

          <div className="setting-row">
            <span className="setting-label">Motion Blur</span>
            <select value={settings.motionBlur} onChange={(e) => setSettings({...settings, motionBlur: e.target.value})}>
              <option value="On">On</option>
              <option value="Off">Off</option>
            </select>
          </div>

          <div className="setting-row">
            <span className="setting-label">Cinematic Mode</span>
            <select value={settings.cinematic} onChange={(e) => setSettings({...settings, cinematic: e.target.value})}>
              <option value="On">On</option>
              <option value="Off">Off</option>
            </select>
          </div>

          <div className="setting-row">
            <span className="setting-label">Shadow Quality</span>
            <select value={settings.shadow} onChange={(e) => setSettings({...settings, shadow: e.target.value})}>
              <option value="Ultra">Ultra</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <div className="setting-row">
            <span className="setting-label">Screen Brightness</span>
            <input 
              type="range" min="10" max="100" 
              value={settings.brightness} 
              onChange={(e) => setSettings({...settings, brightness: e.target.value})} 
            />
          </div>

          <hr style={{ borderColor: '#3a0000', margin: '20px 0' }} />
          
          {/* Sound Effect & Custom Upload Menu */}
          <h3 className="panel-title" style={{ fontSize: '1.4rem' }}>Sound Effects (Audio Custom)</h3>
          
          <div className="setting-row">
            <div>
              <span className="setting-label" style={{ display: 'block' }}>Press Sound</span>
              <small style={{ color: '#666' }}>{audioNames.press}</small>
            </div>
            <label className="audio-upload-btn">
              Upload File
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleAudioUpload(e, 'press')} />
            </label>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label" style={{ display: 'block' }}>Back Sound</span>
              <small style={{ color: '#666' }}>{audioNames.back}</small>
            </div>
            <label className="audio-upload-btn">
              Upload File
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleAudioUpload(e, 'back')} />
            </label>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label" style={{ display: 'block' }}>Background Music (BGM)</span>
              <small style={{ color: '#666' }}>{audioNames.bgm}</small>
            </div>
            <label className="audio-upload-btn">
              Upload File
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleAudioUpload(e, 'bgm')} />
            </label>
          </div>

          <div className="setting-row">
            <div>
              <span className="setting-label" style={{ display: 'block' }}>Move Selection Effect (Mve)</span>
              <small style={{ color: '#666' }}>{audioNames.move}</small>
            </div>
            <label className="audio-upload-btn">
              Upload File
              <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleAudioUpload(e, 'move')} />
            </label>
          </div>

          <button 
            className="back-btn" 
            onClick={() => { playSfx('back'); setGameState('menu'); }}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* 5. PANEL CREDIT */}
      {gameState === 'credit' && (
        <div className="options-panel" style={{ textAlign: 'center' }}>
          <h2 className="panel-title">Credits</h2>
          <p style={{ fontSize: '1.5rem', margin: '40px 0', color: '#fff' }}>LEAD DESIGNER & DEVELOPER</p>
          <p style={{ fontSize: '2rem', color: '#ff0000', fontWeight: 'bold', letterSpacing: '4px' }}>BEBEN</p>
          <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
