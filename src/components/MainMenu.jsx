import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, startgame, option, credit, extra, special
  const [activeTab, setActiveTab] = useState('graphics');
  const [isInteracted, setIsInteracted] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [bgImage, setBgImage] = useState('/bg-default.jpg');

  // STATE UNTUK INPUT DEVICE CONTROLLER
  const [inputMode, setInputMode] = useState('keyboard'); // keyboard atau gamepad
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0); // Indeks menu yang sedang dipilih lewat stik

  // Audio References
  const audioRefs = {
    press: useRef(new Audio('/sounds/press.mp3')),
    back: useRef(new Audio('/sounds/back.mp3')),
    bgm: useRef(new Audio('/sounds/bgm.mp3')),
    move: useRef(new Audio('/sounds/move.mp3')),
  };

  const [audioNames, setAudioNames] = useState({
    press: 'press.mp3 (System)',
    back: 'back.mp3 (System)',
    bgm: 'bgm.mp3 (System)',
    move: 'move.mp3 (System)',
  });

  const [settings, setSettings] = useState({
    motionBlur: 'ON',
    shadow: 'HIGH',
    cinematic: 'ON',
  });

  // Susunan daftar menu utama untuk dicocokkan dengan navigasi stik
  const menuOptions = ['startgame', 'extra', 'special', 'option', 'credit'];

  // Debounce ref untuk menahan kepekaan tombol stik agar tidak kelewatan saat dipencet sekali
  const lastButtonAction = useRef(0);

  useEffect(() => {
    if (audioRefs.bgm.current) audioRefs.bgm.current.loop = true;
  }, []);

  // Fase 1: Intro Otomatis (4 Detik)
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => setGameState('splash'), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Musik BGM otomatis aktif berulang di Home Menu & Panel Utama
  useEffect(() => {
    if ((gameState === 'menu' || gameState === 'startgame' || gameState === 'option') && audioRefs.bgm.current) {
      audioRefs.bgm.current.play().catch(() => {});
    }
  }, [gameState]);

  // Trigger Efek Suara
  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    }
  };

  // Switch otomatis kembali ke KEYBOARD/MOUSE saat mouse digerakkan
  useEffect(() => {
    const handleMouseMove = () => {
      if (inputMode !== 'keyboard') {
        setInputMode('keyboard');
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [inputMode]);

  // LOGIKA UTAMA DETEKSI GAMEPAD / DUALSHOCK
  useEffect(() => {
    let animationFrameId;

    const scanGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0]; // Ambil stik pertama yang terhubung

      if (gp) {
        const now = Date.now();
        // Cek jika ada tombol stik apa pun yang ditekan, ubah mode otomatis ke Gamepad
        const anyButtonPressed = gp.buttons.some(b => b.pressed);
        const axesMoved = gp.axes.some(a => Math.abs(a) > 0.5);

        if ((anyButtonPressed || axesMoved) && inputMode !== 'gamepad') {
          setInputMode('gamepad');
        }

        // Berikan delay waktu (cooldown 200ms) agar navigasi stik tidak terlalu sensitif/liar
        if (now - lastButtonAction.current > 200) {
          
          // 1. INPUT PADA SCREEN: SPLASH SCREEN (PRESS ANYTHING)
          if (gameState === 'splash' && anyButtonPressed) {
            handleStartInteraction();
            lastButtonAction.current = now;
          }

          // 2. INPUT PADA SCREEN: HOME MENU
          else if (gameState === 'menu' && inputMode === 'gamepad') {
            // Arah Bawah (D-Pad atau Analog Kiri)
            if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { 
              playSfx('move');
              setFocusedMenuIndex(prev => (prev + 1) % menuOptions.length);
              lastButtonAction.current = now;
            }
            // Arah Atas (D-Pad atau Analog Kiri)
            else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { 
              playSfx('move');
              setFocusedMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
              lastButtonAction.current = now;
            }
            // Tombol X (DualShock Button 0) untuk Konfirmasi / Enter
            else if (gp.buttons[0].pressed) {
              playSfx('press');
              setGameState(menuOptions[focusedMenuIndex]);
              lastButtonAction.current = now;
            }
          }

          // 3. INPUT PADA SCREEN: START GAME, OPTION, DLL (UNTUK TOMBOL KEMBALI)
          else if ((gameState === 'startgame' || gameState === 'option' || gameState === 'extra' || gameState === 'special' || gameState === 'credit') && inputMode === 'gamepad') {
            // Tombol BULAT (DualShock Button 1) untuk Kembali / Cancel
            if (gp.buttons[1].pressed) {
              playSfx('back');
              setGameState('menu');
              lastButtonAction.current = now;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanGamepads);
    };

    animationFrameId = requestAnimationFrame(scanGamepads);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, inputMode, focusedMenuIndex]);

  // Aksi Klik atau Tekan Keyboard Manual
  const handleStartInteraction = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    playSfx('press');
    setTriggerFlash(true);

    setTimeout(() => {
      setGameState('menu');
      setTriggerFlash(false);
    }, 1000);
  };

  useEffect(() => {
    const handleKeyDown = () => {
      if (gameState === 'splash') handleStartInteraction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isInteracted]);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'background-img') {
      setBgImage(url);
    } else {
      if (audioRefs[type].current) audioRefs[type].current.pause();
      audioRefs[type].current = new Audio(url);
      setAudioNames(prev => ({ ...prev, [type]: file.name }));
      if (type === 'bgm') {
        audioRefs[type].current.loop = true;
        audioRefs[type].current.play();
      }
    }
  };

  return (
    <div className="horror-game-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {triggerFlash && <div className="flash-overlay"></div>}
      {gameState !== 'intro' && <div className="glitch-bg"></div>}

      {/* Partikel Efek Horor */}
      {gameState !== 'intro' && (
        <div className="particles-container">
          <div className="particle"></div><div className="particle"></div>
          <div className="particle"></div><div className="particle"></div>
          <div className="particle"></div><div className="particle"></div>
        </div>
      )}

      {/* 1. SCREEN INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* 2. SCREEN SPLASH */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStartInteraction}>
          <div className="horror-overlay"></div>
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'Accessing...' : inputMode === 'gamepad' ? 'Press Any Button' : 'Press Anything'}
          </div>
        </div>
      )}

      {/* 3. SCREEN HOME MENU UTAMA */}
      {gameState === 'menu' && (
        <div className="order-layout">
          <div className="order-header">
            <h1 className="order-title">FINAL END</h1>
            <span className="order-subtitle">2026</span>
          </div>

          <ul className="order-menu-list">
            {menuOptions.map((opt, idx) => (
              <li className="order-menu-item" key={opt}>
                <button 
                  className="order-menu-btn"
                  style={{ 
                    color: inputMode === 'gamepad' && focusedMenuIndex === idx ? '#ff1a1a' : '',
                    textShadow: inputMode === 'gamepad' && focusedMenuIndex === idx ? '0 0 15px #ff1a1a' : '',
                    letterSpacing: inputMode === 'gamepad' && focusedMenuIndex === idx ? '6px' : ''
                  }}
                  onMouseEnter={() => {
                    if (inputMode === 'keyboard') {
                      playSfx('move');
                      setFocusedMenuIndex(idx);
                    }
                  }}
                  onClick={() => {
                    playSfx('press');
                    setGameState(opt);
                  }}
                >
                  {opt === 'startgame' && 'Start Game'}
                  {opt === 'extra' && 'Extra'}
                  {opt === 'special' && 'Special Content'}
                  {opt === 'option' && 'Option'}
                  {opt === 'credit' && 'Credit'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. SCREEN CHAPTER / STAGE SELECT */}
      {gameState === 'startgame' && (
        <div className="intrinsics-panel">
          <div className="intrinsics-title-header">
            <h2>DRIFTER INTRINSICS / CHAPTER SELECT</h2>
          </div>
          <div className="stages-grid">
            <div className="stage-card">
              <div className="circle-wrapper">
                <div className="stage-circle-active" onMouseEnter={() => playSfx('move')} onClick={() => alert('Memasuki Level 1...')}>1</div>
              </div>
              <div className="stage-label-active">AVAILABLE</div>
            </div>
            {[2, 3, 4, 5, 6].map((num) => (
              <div className="stage-card" key={num}>
                <div className="circle-wrapper"><div className="stage-circle-locked">🔒</div></div>
                <div className="stage-label-locked">LEVEL {num}</div>
              </div>
            ))}
          </div>
          <button className="back-btn" style={{ width: '250px', margin: '60px auto 0' }} onClick={() => { playSfx('back'); setGameState('menu'); }}>
            Return To Menu
          </button>
        </div>
      )}

      {/* 5. PANEL SETTING (OPTION) */}
      {gameState === 'option' && (
        <div className="thief-settings-panel">
          <div className="settings-sidebar">
            <h2>SETTINGS</h2>
            <div className={`settings-category ${activeTab === 'graphics' ? 'active' : ''}`} onClick={() => { playSfx('move'); setActiveTab('graphics'); }}>Graphics & Visual</div>
            <div className={`settings-category ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => { playSfx('move'); setActiveTab('audio'); }}>Audio & Media</div>
          </div>
          <div className="settings-main">
            {activeTab === 'graphics' && (
              <>
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
              </>
            )}
            {activeTab === 'audio' && (
              <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="thief-label">Background Music</span>
                <small style={{ color: '#666' }}>Current: {audioNames.bgm}</small>
                <div className="upload-box" style={{ width: '100%' }}><input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'bgm')} /></div>
              </div>
            )}
            <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>Apply & Save</button>
          </div>
        </div>
      )}

      {/* INTERFACE PANEL SUPLEMEN */}
      {(gameState === 'extra' || gameState === 'special' || gameState === 'credit') && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>
              {gameState === 'extra' && 'Extra Content'}
              {gameState === 'special' && 'Special Content'}
              {gameState === 'credit' && 'Credits'}
            </h2>
            <button className="back-btn" style={{ width: '300px', margin: '30px auto 0' }} onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}

      {/* --- SIMBOL DUALSHOCK BARU: KONDISI HANYA MUNCUL JIKA GAMEPAD AKTIF --- */}
      {inputMode === 'gamepad' && gameState !== 'intro' && (
        <div className="gamepad-indicator-bar">
          <div className="gamepad-btn-hint">
            <span className="ds-btn-cross">✕</span> Select
          </div>
          <div className="gamepad-btn-hint">
            <span className="ds-btn-circle">◯</span> Back
          </div>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
