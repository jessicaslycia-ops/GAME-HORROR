import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, option
  const [bgImage, setBgImage] = useState(null); // Custom background
  const [isInteracted, setIsInteracted] = useState(false);

  // Audio Refs
  const audioRefs = {
    press: useRef(null), back: useRef(null), bgm: useRef(null), move: useRef(null)
  };

  const [settings, setSettings] = useState({
    motionBlur: 'ON', shadow: 'HIGH', brightness: 75, cinematic: 'ON'
  });

  // Intro Logic
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => setGameState('splash'), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Handle Audio & Background Upload
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'background-img') {
      setBgImage(url);
    } else {
      audioRefs[type].current = new Audio(url);
      if (type === 'bgm') {
        audioRefs[type].current.loop = true;
        if (gameState === 'menu') audioRefs[type].current.play();
      }
    }
  };

  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    }
  };

  const handleStart = () => {
    setIsInteracted(true);
    playSfx('press');
    setTimeout(() => setGameState('menu'), 1500);
  };

  return (
    <div 
      className="horror-game-container" 
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      <div className="glitch-bg"></div>

      {/* 1. INTRO SCREEN */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1 style={{ letterSpacing: '15px' }}>MADE BY BEBEN</h1>
        </div>
      )}

      {/* 2. SPLASH SCREEN */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStart}>
          <div className={`press-anything ${isInteracted ? 'interacted' : ''}`} style={{ color: isInteracted ? 'red' : 'white' }}>
            {isInteracted ? 'INITIALIZING...' : 'PRESS ANYTHING'}
          </div>
        </div>
      )}

      {/* 3. HOME MENU (THE ORDER 1886 STYLE) */}
      {gameState === 'menu' && (
        <div className="order-layout">
          <div className="order-header">
            <h1 className="order-title">The Order</h1>
            <span className="order-subtitle">1886</span>
          </div>

          <ul className="order-menu-list">
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => playSfx('press')}>Continue</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => playSfx('press')}>New Game</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('option'); }}>Settings</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => playSfx('press')}>Extras</button>
            </li>
          </ul>

          <div className="order-footer">
            <span className="footer-icon"><i className="fa-solid fa-circle-xmark"></i> Select</span>
            <span className="footer-icon"><i className="fa-solid fa-circle-dot"></i> Back</span>
          </div>
        </div>
      )}

      {/* 4. SETTINGS PANEL (THIEF STYLE) */}
      {gameState === 'option' && (
        <div className="thief-settings-panel">
          <div className="settings-sidebar">
            <h2 style={{ letterSpacing: '5px', marginBottom: '40px' }}>CUSTOM SETTINGS</h2>
            <div className="settings-category active">Base Difficulty</div>
            <div className="settings-category">Graphics</div>
            <div className="settings-category">Audio Assets</div>
            <div className="settings-category">Background</div>
          </div>

          <div className="settings-main">
            <div className="thief-row">
              <span className="thief-label">Motion Blur</span>
              <div className="thief-toggle-group">
                <button className={`thief-toggle-btn ${settings.motionBlur === 'ON' ? 'active' : ''}`} onClick={() => setSettings({...settings, motionBlur: 'ON'})}>ON</button>
                <button className={`thief-toggle-btn ${settings.motionBlur === 'OFF' ? 'active' : ''}`} onClick={() => setSettings({...settings, motionBlur: 'OFF'})}>OFF</button>
              </div>
            </div>

            <div className="thief-row">
              <span className="thief-label">Cinematic Mode</span>
              <div className="thief-toggle-group">
                <button className={`thief-toggle-btn ${settings.cinematic === 'ON' ? 'active' : ''}`} onClick={() => setSettings({...settings, cinematic: 'ON'})}>ON</button>
                <button className={`thief-toggle-btn ${settings.cinematic === 'OFF' ? 'active' : ''}`} onClick={() => setSettings({...settings, cinematic: 'OFF'})}>OFF</button>
              </div>
            </div>

            {/* Custom Uploads */}
            <div className="upload-field">
              <span className="upload-label">Change Home Background Image</span>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background-img')} />
            </div>

            <div className="upload-field">
              <span className="upload-label">Custom BGM (Music)</span>
              <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'bgm')} />
            </div>

            <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>Apply & Return</button>
          </div>

          <div className="settings-description">
            <p>Adjusting these parameters will affect the visual fidelity and atmosphere of the game. Cinematic mode adds letterboxing and grain for a period-accurate feel.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
