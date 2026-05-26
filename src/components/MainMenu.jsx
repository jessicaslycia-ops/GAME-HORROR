import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, startgame, option, credit, extra, special
  const [activeTab, setActiveTab] = useState('graphics'); // graphics, display, audio, gameplay
  const [isInteracted, setIsInteracted] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [bgImage, setBgImage] = useState('/bg-default.jpg');

  // MANAGEMENT DETEKSI DEVICE
  const [inputMode, setInputMode] = useState('keyboard'); 
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0); 

  // SUB-NAVIGATION JIKA BERADA DI MENU OPTION ATAU EXTRA MENGGUNAKAN STIK
  const [optionFocusArea, setOptionFocusArea] = useState('sidebar'); // 'sidebar', 'rows', 'backBtn'
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedExtraIndex, setFocusedExtraIndex] = useState(0); // Navigasi karakter di menu Extra

  // Audio References
  const audioRefs = {
    press: useRef(new Audio('/sounds/press.mp3')),
    back: useRef(new Audio('/sounds/back.mp3')),
    bgm: useRef(new Audio('/sounds/bgm.mp3')),
    move: useRef(new Audio('/sounds/move.mp3')),
  };

  // Susunan Game Settings Komplit ala Game AAA
  const [settings, setSettings] = useState({
    motionBlur: 'ON',
    textureQuality: 'HIGH',
    shadow: 'ULTRA',
    antiAliasing: 'TAA',
    brightness: '80%',
    resolution: '1920x1080',
    vsync: 'ON',
    windowMode: 'FULLSCREEN',
    masterVolume: '100%',
    musicVolume: '80%',
    sfxVolume: '90%',
    voiceLanguage: 'ENGLISH',
    difficulty: 'HARDCORE',
    subtitles: 'ON',
    aimAssist: 'OFF',
    bloodEffect: 'ON'
  });

  const menuOptions = ['startgame', 'extra', 'special', 'option', 'credit'];
  const tabsList = ['graphics', 'display', 'audio', 'gameplay'];

  // Konten Karakter Menu Extra sesuai request
  const extraCharacters = [
    { id: 'remy', title: 'Play as Remy', desc: 'Play as remy and explore the truth behind the accident.' },
    { id: 'toppy', title: 'Play as Toppy', desc: 'Toppy will seeking the truth and try to escape.' },
    { id: 'samson', title: 'Play as Samson', desc: 'Play as Samson and his story to find out what happened to Jakarta City.' }
  ];

  const getRowCount = () => 4; // Setiap tab setting berisi 4 pilihan baris

  const lastButtonAction = useRef(0);

  useEffect(() => {
    if (audioRefs.bgm.current) audioRefs.bgm.current.loop = true;
  }, []);

  // Intro Otomatis (4 Detik)
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => setGameState('splash'), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Musik BGM Otomatis Aktif di Semua Menu Utama
  useEffect(() => {
    if (gameState !== 'intro' && gameState !== 'splash' && audioRefs.bgm.current) {
      audioRefs.bgm.current.play().catch(() => {});
    }
  }, [gameState]);

  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    }
  };

  // Switch otomatis kembali ke KEYBOARD/MOUSE saat mouse digerakkan
  useEffect(() => {
    const handleMouseMove = () => {
      if (inputMode !== 'keyboard') setInputMode('keyboard');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [inputMode]);

  // SYSTEM CONTROLLER NAVIGATIONS ENGINE (DUALSHOCK ENGINE V3)
  useEffect(() => {
    let animationFrameId;

    const scanGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp) {
        const now = Date.now();
        const anyButtonPressed = gp.buttons.some(b => b.pressed);
        const axesMoved = gp.axes.some(a => Math.abs(a) > 0.5);

        if ((anyButtonPressed || axesMoved) && inputMode !== 'gamepad') {
          setInputMode('gamepad');
        }

        if (now - lastButtonAction.current > 180) {
          
          // FASE SPLASH SCREEN
          if (gameState === 'splash' && anyButtonPressed) {
            handleStartInteraction();
            lastButtonAction.current = now;
          }

          // FASE HOME MENU UTAMA
          else if (gameState === 'menu' && inputMode === 'gamepad') {
            if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
              playSfx('move');
              setFocusedMenuIndex(prev => (prev + 1) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
              playSfx('move');
              setFocusedMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[0].pressed) { // Tombol X (Enter)
              playSfx('press');
              setGameState(menuOptions[focusedMenuIndex]);
              // Reset state area navigasi internal saat membuka menu tertentu
              if (menuOptions[focusedMenuIndex] === 'option') {
                setOptionFocusArea('sidebar');
                setFocusedRowIndex(0);
              } else if (menuOptions[focusedMenuIndex] === 'extra') {
                setFocusedExtraIndex(0);
              }
              lastButtonAction.current = now;
            }
          }

          // FASE OPTION PANEL (FIX NAVIGATION)
          else if (gameState === 'option' && inputMode === 'gamepad') {
            const currentTabIdx = tabsList.indexOf(activeTab);
            const totalRows = getRowCount();

            if (gp.buttons[1].pressed) { // Tombol O (Back)
              playSfx('back');
              setGameState('menu');
              lastButtonAction.current = now;
              return;
            }

            // AREA SIDEBAR
            if (optionFocusArea === 'sidebar') {
              if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
                playSfx('move');
                setActiveTab(tabsList[(currentTabIdx + 1) % tabsList.length]);
                lastButtonAction.current = now;
              } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
                playSfx('move');
                setActiveTab(tabsList[(currentTabIdx - 1 + tabsList.length) % tabsList.length]);
                lastButtonAction.current = now;
              } else if (gp.buttons[15].pressed || gp.axes[0] > 0.5) { // Right (Masuk ke opsi setting)
                playSfx('move');
                setOptionFocusArea('rows');
                setFocusedRowIndex(0);
                lastButtonAction.current = now;
              }
            }

            // AREA SETTING ROWS
            else if (optionFocusArea === 'rows') {
              if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
                playSfx('move');
                if (focusedRowIndex === totalRows - 1) {
                  setOptionFocusArea('backBtn');
                } else {
                  setFocusedRowIndex(prev => prev + 1);
                }
                lastButtonAction.current = now;
              } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
                playSfx('move');
                if (focusedRowIndex === 0) {
                  setOptionFocusArea('sidebar');
                } else {
                  setFocusedRowIndex(prev => prev - 1);
                }
                lastButtonAction.current = now;
              } else if (gp.buttons[14].pressed || gp.axes[0] < -0.5) { // Left (Balik ke sidebar)
                playSfx('move');
                setOptionFocusArea('sidebar');
                lastButtonAction.current = now;
              } else if (gp.buttons[0].pressed) { // Tombol X (Ganti value)
                playSfx('press');
                toggleSettingValue();
                lastButtonAction.current = now;
              }
            }

            // AREA TOMBOL APPLY DI BAWAH
            else if (optionFocusArea === 'backBtn') {
              if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
                playSfx('move');
                setOptionFocusArea('rows');
                setFocusedRowIndex(totalRows - 1);
                lastButtonAction.current = now;
              } else if (gp.buttons[0].pressed) { // X (Save & Exit)
                playSfx('back');
                setGameState('menu');
                lastButtonAction.current = now;
              }
            }
          }

          // FASE MENU EXTRA (NAVIGATION LIKE HOME MENU)
          else if (gameState === 'extra' && inputMode === 'gamepad') {
            if (gp.buttons[1].pressed) { // Tombol O (Back)
              playSfx('back');
              setGameState('menu');
              lastButtonAction.current = now;
            } else if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
              playSfx('move');
              setFocusedExtraIndex(prev => (prev + 1) % extraCharacters.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
              playSfx('move');
              setFocusedExtraIndex(prev => (prev - 1 + extraCharacters.length) % extraCharacters.length);
              lastButtonAction.current = now;
            }
          }

          // FASE PANEL LAIN (SPECIAL, CREDIT, LEVEL SELECT)
          else if ((gameState === 'startgame' || gameState === 'special' || gameState === 'credit') && inputMode === 'gamepad') {
            if (gp.buttons[1].pressed || gp.buttons[0].pressed) { 
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
  }, [gameState, inputMode, focusedMenuIndex, optionFocusArea, focusedRowIndex, focusedExtraIndex, activeTab, settings]);

  const toggleSettingValue = () => {
    if (activeTab === 'graphics') {
      if (focusedRowIndex === 0) setSettings(p => ({...p, motionBlur: p.motionBlur === 'ON' ? 'OFF' : 'ON'}));
      if (focusedRowIndex === 1) setSettings(p => ({...p, textureQuality: p.textureQuality === 'HIGH' ? 'MEDIUM' : p.textureQuality === 'MEDIUM' ? 'LOW' : 'HIGH'}));
      if (focusedRowIndex === 2) setSettings(p => ({...p, shadow: p.shadow === 'ULTRA' ? 'HIGH' : p.shadow === 'HIGH' ? 'LOW' : 'ULTRA'}));
      if (focusedRowIndex === 3) setSettings(p => ({...p, antiAliasing: p.antiAliasing === 'TAA' ? 'FXAA' : p.antiAliasing === 'FXAA' ? 'OFF' : 'TAA'}));
    } else if (activeTab === 'display') {
      if (focusedRowIndex === 0) setSettings(p => ({...p, brightness: p.brightness === '80%' ? '100%' : p.brightness === '100%' ? '50%' : '80%'}));
      if (focusedRowIndex === 1) setSettings(p => ({...p, resolution: p.resolution === '1920x1080' ? '2560x1440' : p.resolution === '2560x1440' ? '1280x720' : '1920x1080'}));
      if (focusedRowIndex === 2) setSettings(p => ({...p, vsync: p.vsync === 'ON' ? 'OFF' : 'ON'}));
      if (focusedRowIndex === 3) setSettings(p => ({...p, windowMode: p.windowMode === 'FULLSCREEN' ? 'WINDOWED' : 'FULLSCREEN'}));
    } else if (activeTab === 'audio') {
      if (focusedRowIndex === 0) setSettings(p => ({...p, masterVolume: p.masterVolume === '100%' ? '50%' : p.masterVolume === '50%' ? '0%' : '100%'}));
      if (focusedRowIndex === 1) setSettings(p => ({...p, musicVolume: p.musicVolume === '80%' ? '100%' : p.musicVolume === '100%' ? '0%' : '80%'}));
      if (focusedRowIndex === 2) setSettings(p => ({...p, sfxVolume: p.sfxVolume === '90%' ? '100%' : p.sfxVolume === '100%' ? '20%' : '90%'}));
      if (focusedRowIndex === 3) setSettings(p => ({...p, voiceLanguage: p.voiceLanguage === 'ENGLISH' ? 'JAPANESE' : p.voiceLanguage === 'JAPANESE' ? 'INDONESIAN' : 'ENGLISH'}));
    } else if (activeTab === 'gameplay') {
      if (focusedRowIndex === 0) setSettings(p => ({...p, difficulty: p.difficulty === 'HARDCORE' ? 'EASY' : p.difficulty === 'EASY' ? 'NORMAL' : 'HARDCORE'}));
      if (focusedRowIndex === 1) setSettings(p => ({...p, subtitles: p.subtitles === 'ON' ? 'OFF' : 'ON'}));
      if (focusedRowIndex === 2) setSettings(p => ({...p, aimAssist: p.aimAssist === 'OFF' ? 'ON' : 'OFF'}));
      if (focusedRowIndex === 3) setSettings(p => ({...p, bloodEffect: p.bloodEffect === 'ON' ? 'OFF' : 'ON'}));
    }
  };

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

  return (
    <div className="horror-game-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {triggerFlash && <div className="flash-overlay"></div>}
      {gameState !== 'intro' && <div className="glitch-bg"></div>}

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
            <h1 className="order-title">LAST TRANSMISSION</h1>
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
                    if (opt === 'option') {
                      setOptionFocusArea('sidebar');
                      setFocusedRowIndex(0);
                    } else if (opt === 'extra') {
                      setFocusedExtraIndex(0);
                    }
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

      {/* 4. SCREEN CHAPTER SELECT */}
      {gameState === 'startgame' && (
        <div className="intrinsics-panel">
          <div className="intrinsics-title-header">
            <h2>DRIFTER INTRINSICS / CHAPTER SELECT</h2>
          </div>
          <div className="stages-grid">
            <div className="stage-card">
              <div className="circle-wrapper">
                <div className="stage-circle-active focused" onMouseEnter={() => playSfx('move')} onClick={() => alert('Memasuki Level 1...')}>1</div>
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
          <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>
            Return To Menu
          </button>
        </div>
      )}

      {/* 5. PANEL OPTION / SETTINGS */}
      {gameState === 'option' && (
        <div className="thief-settings-panel">
          {/* SIDEBAR TABS */}
          <div className="settings-sidebar">
            <h2>SETTINGS</h2>
            {tabsList.map((tab) => (
              <div 
                key={tab}
                className={`settings-category 
                  ${activeTab === tab ? 'active' : ''} 
                  ${inputMode === 'gamepad' && optionFocusArea === 'sidebar' && tabsList[tabsList.indexOf(activeTab)] === tab ? 'focused' : ''}`
                }
                onClick={() => { playSfx('move'); setActiveTab(tab); }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* MAIN SETTINGS INTERFACE */}
          <div className="settings-main">
            {activeTab === 'graphics' && (
              <>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                  <span className="thief-label">Motion Blur</span>
                  <div className="thief-toggle-group">
                    <button className={`thief-toggle-btn ${settings.motionBlur === 'ON' ? 'active' : ''}`}>ON</button>
                    <button className={`thief-toggle-btn ${settings.motionBlur === 'OFF' ? 'active' : ''}`}>OFF</button>
                  </div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                  <span className="thief-label">Texture Quality</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.textureQuality}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                  <span className="thief-label">Shadow Maps</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.shadow}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                  <span className="thief-label">Anti-Aliasing</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.antiAliasing}</button></div>
                </div>
              </>
            )}

            {activeTab === 'display' && (
              <>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                  <span className="thief-label">Screen Brightness</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.brightness}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                  <span className="thief-label">Resolution</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.resolution}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                  <span className="thief-label">V-Sync</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.vsync}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                  <span className="thief-label">Display Mode</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.windowMode}</button></div>
                </div>
              </>
            )}

            {activeTab === 'audio' && (
              <>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                  <span className="thief-label">Master Volume</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.masterVolume}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                  <span className="thief-label">Music Sound</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.musicVolume}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                  <span className="thief-label">SFX Dynamic</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.sfxVolume}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                  <span className="thief-label">Voice Dub Language</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.voiceLanguage}</button></div>
                </div>
              </>
            )}

            {activeTab === 'gameplay' && (
              <>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                  <span className="thief-label">Difficulty</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.difficulty}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                  <span className="thief-label">In-Game Subtitles</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.subtitles}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                  <span className="thief-label">Aim Assist Engine</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.aimAssist}</button></div>
                </div>
                <div className={`thief-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                  <span className="thief-label">Gore & Blood FX</span>
                  <div className="thief-toggle-group"><button className="thief-toggle-btn active">{settings.bloodEffect}</button></div>
                </div>
              </>
            )}

            <button 
              className={`back-btn ${inputMode === 'gamepad' && optionFocusArea === 'backBtn' ? 'focused' : ''}`}
              onClick={() => { playSfx('back'); setGameState('menu'); }}
            >
              Apply & Save Settings
            </button>
          </div>

          <div className="settings-description">
            <p>
              System Mode: {inputMode === 'gamepad' ? 'DualShock Controller' : 'Keyboard & Mouse'}.
            </p>
          </div>
        </div>
      )}

      {/* 6. SCREEN EXTRAS (CINEMATIC VERTICAL SPLIT DESIGN LIKE THE ORDER) */}
      {gameState === 'extra' && (
        <div className="aaa-extras-layout">
          <div className="order-header">
            <h1 className="order-title">Extras</h1>
            <span className="order-subtitle">Content Bonus</span>
          </div>

          <div className="extras-menu-split">
            {/* Sisi Kiri: List Karakter Playable */}
            <div className="extras-list-container">
              {extraCharacters.map((char, index) => (
                <button
                  key={char.id}
                  className={`extra-character-row ${inputMode === 'gamepad' && focusedExtraIndex === index ? 'focused' : ''}`}
                  onMouseEnter={() => {
                    if (inputMode === 'keyboard') {
                      playSfx('move');
                      setFocusedExtraIndex(index);
                    }
                  }}
                  onClick={() => playSfx('press')}
                >
                  <span className="extra-char-lock-icon">🔒</span>
                  <span className="extra-char-title" style={{
                    color: inputMode === 'gamepad' && focusedExtraIndex === index ? '#ffffff' : ''
                  }}>
                    {char.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Sisi Kanan: Real-Time Description Box */}
            <div className="extras-description-panel" key={focusedExtraIndex}>
              <div className="extras-desc-title-sub">Locked Content Data</div>
              <div className="extras-desc-main-text">
                {extraCharacters[focusedExtraIndex].desc}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SCREEN SPECIAL CONTENT */}
      {gameState === 'special' && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>Special Content</h2>
            <p style={{ margin: '30px 0', fontSize: '1.4rem', color: '#ccc' }}>Bonus Developer Commentary and Behind the Scenes.</p>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}

      {/* 8. SCREEN CREDIT (CREATED BY NURULL) */}
      {gameState === 'credit' && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>Credits</h2>
            <p style={{ margin: '40px 0', fontSize: '2.2rem', color: '#ffffff', letterSpacing: '3px', fontWeight: 'bold' }}>
              Created by Nurull
            </p>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}

      {/* SYMBOL BAR DUALSHOCK */}
      {inputMode === 'gamepad' && gameState !== 'intro' && (
        <div className="gamepad-indicator-bar">
          <div className="gamepad-btn-hint"><span className="ds-btn-cross">✕</span> Select / Change</div>
          <div className="gamepad-btn-hint"><span className="ds-btn-circle">◯</span> Back</div>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
