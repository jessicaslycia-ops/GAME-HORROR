import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, startgame, option, credit, extra, special
  const [activeTab, setActiveTab] = useState('graphics'); // graphics, display, audio, gameplay
  const [isInteracted, setIsInteracted] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [bgImage, setBgImage] = useState('/bg-default.jpg');

  // MANAGEMENT DEVICE MODE
  const [inputMode, setInputMode] = useState('keyboard'); 
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0); 

  // SUB-NAVIGATION KONTROL OPTION
  const [optionFocusArea, setOptionFocusArea] = useState('sidebar'); // 'sidebar', 'rows', 'backBtn'
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);

  // Audio References
  const audioRefs = {
    press: useRef(new Audio('/sounds/press.mp3')),
    back: useRef(new Audio('/sounds/back.mp3')),
    bgm: useRef(new Audio('/sounds/bgm.mp3')),
    move: useRef(new Audio('/sounds/move.mp3')),
  };

  // Nilai Konfigurasi Default Sistem Web Game
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

  const getRowCount = () => 4;
  const lastButtonAction = useRef(0);

  useEffect(() => {
    if (audioRefs.bgm.current) audioRefs.bgm.current.loop = true;
  }, []);

  // Fase 1: Intro Layar Hitam (4 Detik)
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => setGameState('splash'), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Aktivasi Audio Putar Latar Otomatis
  useEffect(() => {
    if ((gameState === 'menu' || gameState === 'startgame' || gameState === 'option' || gameState === 'extra' || gameState === 'special' || gameState === 'credit') && audioRefs.bgm.current) {
      audioRefs.bgm.current.play().catch(() => {});
    }
  }, [gameState]);

  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch(() => {});
    }
  };

  // Auto-switch kembali ke mode Keyboard/Mouse jika mendeteksi pergerakan mouse
  useEffect(() => {
    const handleMouseMove = () => {
      if (inputMode !== 'keyboard') setInputMode('keyboard');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [inputMode]);

  // MESIN INPUT NAVIGASI DUALSHOCK & GAMEPAD CONTROL
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
          
          // INPUT INTERAKSI: SPLASH SCREEN
          if (gameState === 'splash' && anyButtonPressed) {
            handleStartInteraction();
            lastButtonAction.current = now;
          }

          // INPUT INTERAKSI: HALAMAN MENU UTAMA
          else if (gameState === 'menu' && inputMode === 'gamepad') {
            if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // D-pad Bawah
              playSfx('move');
              setFocusedMenuIndex(prev => (prev + 1) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // D-pad Atas
              playSfx('move');
              setFocusedMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[0].pressed) { // Tombol Silang (✕)
              playSfx('press');
              setGameState(menuOptions[focusedMenuIndex]);
              if (menuOptions[focusedMenuIndex] === 'option') {
                setOptionFocusArea('sidebar');
                setFocusedRowIndex(0);
              }
              lastButtonAction.current = now;
            }
          }

          // INPUT INTERAKSI: MANAGEMENT PANEL OPTION (FIXED TRIPLE LAYER AREA)
          else if (gameState === 'option' && inputMode === 'gamepad') {
            const currentTabIdx = tabsList.indexOf(activeTab);

            // Tombol Bulat (◯) untuk Langsung Keluar Kembali ke Menu Utama
            if (gp.buttons[1].pressed) {
              playSfx('back');
              setGameState('menu');
              lastButtonAction.current = now;
              return;
            }

            // Area Navigasi Komponen Kiri (Sidebar Tab Select)
            if (optionFocusArea === 'sidebar') {
              if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
                playSfx('move');
                setActiveTab(tabsList[(currentTabIdx + 1) % tabsList.length]);
                lastButtonAction.current = now;
              } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
                playSfx('move');
                setActiveTab(tabsList[(currentTabIdx - 1 + tabsList.length) % tabsList.length]);
                lastButtonAction.current = now;
              } else if (gp.buttons[15].pressed || gp.axes[0] > 0.5) { // Pindah Kanan (Masuk ke list row)
                playSfx('move');
                setOptionFocusArea('rows');
                setFocusedRowIndex(0);
                lastButtonAction.current = now;
              }
            }

            // Area Navigasi Komponen Tengah (Row Settings List)
            else if (optionFocusArea === 'rows') {
              if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { // Down
                playSfx('move');
                if (focusedRowIndex === 3) {
                  setOptionFocusArea('backBtn'); // Sampai ujung bawah pindah fokus ke tombol simpan
                } else {
                  setFocusedRowIndex(prev => prev + 1);
                }
                lastButtonAction.current = now;
              } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up
                playSfx('move');
                if (focusedRowIndex === 0) {
                  setOptionFocusArea('sidebar'); // Balik sorot sidebar tab kiri
                } else {
                  setFocusedRowIndex(prev => prev - 1);
                }
                lastButtonAction.current = now;
              } else if (gp.buttons[14].pressed || gp.axes[0] < -0.5) { // Pindah Kiri manual ke Sidebar
                playSfx('move');
                setOptionFocusArea('sidebar');
                lastButtonAction.current = now;
              } else if (gp.buttons[0].pressed) { // Tekan X untuk ganti siklus settingan
                playSfx('press');
                toggleSettingValue();
                lastButtonAction.current = now;
              }
            }

            // Area Navigasi Tombol Eksekusi Bawah
            else if (optionFocusArea === 'backBtn') {
              if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { // Up (Naik balik ke baris setting)
                playSfx('move');
                setOptionFocusArea('rows');
                setFocusedRowIndex(3);
                lastButtonAction.current = now;
              } else if (gp.buttons[0].pressed) { // Tekan X di tombol simpan
                playSfx('back');
                setGameState('menu');
                lastButtonAction.current = now;
              }
            }
          }

          // INPUT INTERAKSI: SCREEN UMUM LAIN (KEMBALI KE HOME MENU)
          else if ((gameState === 'startgame' || gameState === 'extra' || gameState === 'special' || gameState === 'credit') && inputMode === 'gamepad') {
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
  }, [gameState, inputMode, focusedMenuIndex, optionFocusArea, focusedRowIndex, activeTab, settings]);

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
          <div className="particle"></div>
        </div>
      )}

      {/* LAYER 1: SCREEN SHOWCASE INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* LAYER 2: LAYAR TEKAN SEMBARANG (SPLASH) */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStartInteraction}>
          <div className="horror-overlay"></div>
          <div className="press-anything-text">
            {isInteracted ? 'Connecting...' : inputMode === 'gamepad' ? 'Press Any Controller Button' : 'Press Anything to Start'}
          </div>
        </div>
      )}

      {/* LAYER 3: MENU HOME UTAMA (THE ORDER STYLE) */}
      {gameState === 'menu' && (
        <div className="order-layout">
          <div className="order-header">
            <h1 className="order-title">LAST TRANSMISSION</h1>
            <span className="order-subtitle">SYSTEM STATUS: ONLINE</span>
          </div>

          <ul className="order-menu-list">
            {menuOptions.map((opt, idx) => (
              <li className="order-menu-item" key={opt}>
                <button 
                  className="order-menu-btn"
                  style={{ 
                    color: focusedMenuIndex === idx ? '#ffffff' : '#666666',
                    transform: focusedMenuIndex === idx ? 'translateX(8px)' : 'none',
                    fontWeight: focusedMenuIndex === idx ? 'bold' : 'normal'
                  }}
                  onMouseEnter={() => { if (inputMode === 'keyboard') { playSfx('move'); setFocusedMenuIndex(idx); } }}
                  onClick={() => { playSfx('press'); setGameState(opt); if (opt === 'option') { setOptionFocusArea('sidebar'); setFocusedRowIndex(0); } }}
                >
                  {opt === 'startgame' && 'Continue Game'}
                  {opt === 'extra' && 'Extras Menu'}
                  {opt === 'special' && 'Special Content'}
                  {opt === 'option' && 'Settings'}
                  {opt === 'credit' && 'Credits'}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="aaa-footer-navigation" style={{ marginTop: '20px', border: 'none', padding: 0 }}>
            <div className="aaa-nav-hint"><span className="aaa-btn-icon dark">✕</span> {inputMode === 'gamepad' ? 'Select Option' : 'Left Click'}</div>
          </div>
        </div>
      )}

      {/* LAYER 4: STAGE SELECT SELECTOR */}
      {gameState === 'startgame' && (
        <div className="intrinsics-panel">
          <div className="intrinsics-title-header">
            <h2>MISSIONS SELECTOR / ACTIVE DRIFT</h2>
          </div>
          <div className="stages-grid">
            <div className="stage-card">
              <div className="circle-wrapper">
                <div className="stage-circle-active focused" onMouseEnter={() => playSfx('move')} onClick={() => alert('Launching Signal 1...')}>1</div>
              </div>
              <div className="stage-label-active">READY</div>
            </div>
            {[2, 3, 4, 5, 6].map((num) => (
              <div className="stage-card" key={num}>
                <div className="circle-wrapper"><div className="stage-circle-locked">🔒</div></div>
                <div className="stage-label-locked">SECTOR {num}</div>
              </div>
            ))}
          </div>
          <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>
            Return to Terminal
          </button>
        </div>
      )}

      {/* LAYER 5: REDESIGN HALAMAN OPTION SETTINGS (ASSASSIN'S CREED MIRAGE TYPE) */}
      {gameState === 'option' && (
        <div className="aaa-settings-window">
          <div className="aaa-settings-header">
            <span>← Settings</span>
          </div>

          <div className="aaa-settings-body">
            {/* Sisi Kiri: List Tab dengan Kotak Menyala Putih Terang */}
            <div className="aaa-sidebar-tabs">
              {tabsList.map((tab) => (
                <button 
                  key={tab}
                  className={`aaa-tab-button 
                    ${activeTab === tab ? 'active' : ''} 
                    ${inputMode === 'gamepad' && optionFocusArea === 'sidebar' && tabsList[tabsList.indexOf(activeTab)] === tab ? 'focused' : ''}`
                  }
                  onClick={() => { playSfx('move'); setActiveTab(tab); }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sisi Kanan: Tabel Konten Setingan */}
            <div className="aaa-settings-table">
              <div className="aaa-section-title">{activeTab} parameters</div>
              
              {/* FILTERING KONTEN BERDASARKAN TAB AKTIF */}
              {activeTab === 'graphics' && (
                <>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Motion Blur</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.motionBlur} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Texture Quality</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.textureQuality} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Shadow Maps</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.shadow} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Anti-Aliasing</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.antiAliasing} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                </>
              )}

              {activeTab === 'display' && (
                <>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Screen Brightness</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.brightness} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Resolution</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.resolution} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">V-Sync</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.vsync} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Display Mode</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.windowMode} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                </>
              )}

              {activeTab === 'audio' && (
                <>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Master Volume</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.masterVolume} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Music Sound</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.musicVolume} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">SFX Dynamic</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.sfxVolume} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Voice Dub Language</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.voiceLanguage} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                </>
              )}

              {activeTab === 'gameplay' && (
                <>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 0 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Difficulty</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.difficulty} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 1 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">In-Game Subtitles</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.subtitles} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 2 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Aim Assist Engine</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.aimAssist} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                  <div className={`aaa-setting-row ${inputMode === 'gamepad' && optionFocusArea === 'rows' && focusedRowIndex === 3 ? 'focused' : ''}`}>
                    <span className="aaa-setting-label">Gore & Blood FX</span>
                    <div className="aaa-setting-value-wrapper"><span className="aaa-arrow-indicator">‹</span> {settings.bloodEffect} <span className="aaa-arrow-indicator">›</span></div>
                  </div>
                </>
              )}

              <button 
                className={`back-btn ${inputMode === 'gamepad' && optionFocusArea === 'backBtn' ? 'focused' : ''}`}
                onClick={() => { playSfx('back'); setGameState('menu'); }}
                style={{ width: 'auto', margin: '20px 0 0' }}
              >
                Save and Apply
              </button>
            </div>
          </div>

          {/* BAR INDIKATOR TOMBOL FOOTER DI BAWAH HALAMAN */}
          <div className="aaa-footer-navigation">
            <div className="aaa-nav-hint"><span className="aaa-btn-icon blue">✕</span> Select / Adjust</div>
            <div className="aaa-nav-hint"><span className="aaa-btn-icon red">◯</span> Return to Main Menu</div>
            <div className="aaa-nav-hint"><span className="aaa-btn-icon dark">↕</span> Move Highlight</div>
          </div>
        </div>
      )}

      {/* LAYER 6: EXTRAS MENU DENGAN DETAIL DESKRIPSI REMY, TOPPY, SAMSON */}
      {gameState === 'extra' && (
        <div className="aaa-settings-window" style={{ maxWidth: '900px' }}>
          <div className="aaa-settings-header"><span>← Extras Content</span></div>
          <div className="aaa-settings-table">
            <div className="aaa-section-title">Bonus Playable Character Chapters</div>
            <div className="extra-content-list">
              <div className="extra-item-row focused">
                <span className="extra-title">Play as Remy</span>
                <span className="extra-desc">Play as remy and explore the truth behind the accident</span>
              </div>
              <div className="extra-item-row focused">
                <span className="extra-title">Play as Toppy</span>
                <span className="extra-desc">Toppy will seeking the truth and try to escape</span>
              </div>
              <div className="extra-item-row focused">
                <span className="extra-title">Play as Samson</span>
                <span className="extra-desc">Play as Samson and his story to find out what happened to Jakarta City</span>
              </div>
            </div>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Return</button>
          </div>
        </div>
      )}

      {/* LAYER 7: SPECIAL CONTENT BONUS */}
      {gameState === 'special' && (
        <div className="aaa-settings-window" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="aaa-settings-table" style={{ padding: '40px' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px' }}>Special Files</h2>
            <p style={{ color: '#888', margin: '20px 0', fontFamily: 'Arial' }}>Concept art gallery and audio logs are locked until completion.</p>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}

      {/* LAYER 8: SCREEN CREDITS - FIXED NAME NURULL */}
      {gameState === 'credit' && (
        <div className="aaa-settings-window" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="aaa-settings-table" style={{ padding: '50px 30px' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '4px', margin: 0, color: var(--text-dim) }}>Production Credits</h2>
            <p style={{ margin: '40px 0', fontSize: '1.8rem', letterSpacing: '2px', fontWeight: '300', color: '#fff' }}>
              Created by Nurull
            </p>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Return to Title</button>
          </div>
        </div>
      )}

      {/* INDIKATOR LAYAR DUALSHOCK UTAMA */}
      {inputMode === 'gamepad' && gameState !== 'intro' && gameState !== 'option' && gameState !== 'menu' && (
        <div className="gamepad-indicator-bar" style={{ background: '#000', borderRadius: '4px', border: '1px solid #222' }}>
          <div className="gamepad-btn-hint"><span className="aaa-btn-icon blue">✕</span> Select</div>
          <div className="gamepad-btn-hint"><span className="aaa-btn-icon red">◯</span> Back</div>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
