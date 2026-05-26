import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, startgame, option, credit, extra, special
  const [activeTab, setActiveTab] = useState('graphics'); // graphics, display, audio, gameplay
  const [isInteracted, setIsInteracted] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [bgImage, setBgImage] = useState('/bg-default.jpg');

  // MANAGEMENT INPUT DEVICE
  const [inputMode, setInputMode] = useState('keyboard'); 
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0); 

  // SUB-NAVIGATION INTERNAL
  const [optionFocusArea, setOptionFocusArea] = useState('sidebar'); // 'sidebar', 'rows', 'backBtn'
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedExtraIndex, setFocusedExtraIndex] = useState(0);
  
  // STATE NOTIFIKASI KUNCI CHAPTER SELECT
  const [chapterAlert, setChapterAlert] = useState('');

  // Audio References
  const audioRefs = {
    press: useRef(new Audio('/sounds/press.mp3')),
    back: useRef(new Audio('/sounds/back.mp3')),
    bgm: useRef(new Audio('/sounds/bgm.mp3')),
    move: useRef(new Audio('/sounds/move.mp3')),
  };

  const [settings, setSettings] = useState({
    motionBlur: 'ON', textureQuality: 'HIGH', shadow: 'ULTRA', antiAliasing: 'TAA',
    brightness: '80%', resolution: '1920x1080', vsync: 'ON', windowMode: 'FULLSCREEN',
    masterVolume: '100%', musicVolume: '80%', sfxVolume: '90%', voiceLanguage: 'ENGLISH',
    difficulty: 'HARDCORE', subtitles: 'ON', aimAssist: 'OFF', bloodEffect: 'ON'
  });

  const menuOptions = ['startgame', 'extra', 'special', 'option', 'credit'];
  const tabsList = ['graphics', 'display', 'audio', 'gameplay'];

  const extraCharacters = [
    { id: 'remy', title: 'Play as Remy', desc: 'Play as remy and explore the truth behind the accident.' },
    { id: 'toppy', title: 'Play as Toppy', desc: 'Toppy will seeking the truth and try to escape.' },
    { id: 'samson', title: 'Play as Samson', desc: 'Play as Samson and his story to find out what happened to Jakarta City.' }
  ];

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

  // Musik BGM Aktif Utama
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

  // KONTROL HANDLING INTERAKSI MASUK KE UTAMA (FIXED: KEYBOARD & MOUSE MULTI-SUPPORT)
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

  // KONTROL KEYBOARD ENGINE UTAMA
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inputMode !== 'keyboard') setInputMode('keyboard');

      if (gameState === 'splash') {
        handleStartInteraction();
        return;
      }

      if (gameState === 'menu') {
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          playSfx('move');
          setFocusedMenuIndex(prev => (prev + 1) % menuOptions.length);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          playSfx('move');
          setFocusedMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
        } else if (e.key === 'Enter') {
          playSfx('press');
          setGameState(menuOptions[focusedMenuIndex]);
          if (menuOptions[focusedMenuIndex] === 'option') {
            setOptionFocusArea('sidebar');
            setFocusedRowIndex(0);
          } else if (menuOptions[focusedMenuIndex] === 'extra') {
            setFocusedExtraIndex(0);
          }
        }
      }

      else if (gameState === 'extra') {
        if (e.key === 'Escape') {
          playSfx('back');
          setGameState('menu');
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          playSfx('move');
          setFocusedExtraIndex(prev => (prev + 1) % extraCharacters.length);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          playSfx('move');
          setFocusedExtraIndex(prev => (prev - 1 + extraCharacters.length) % extraCharacters.length);
        }
      }

      else if (gameState === 'option' || gameState === 'startgame' || gameState === 'credit' || gameState === 'special') {
        if (e.key === 'Escape') {
          playSfx('back');
          setGameState('menu');
          setChapterAlert(''); // Reset teks eror chapter select
        }
      }
    };

    const handleMouseMove = () => {
      if (inputMode !== 'keyboard') setInputMode('keyboard');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState, inputMode, focusedMenuIndex, focusedExtraIndex]);

  // SYSTEM CONTROLLER GAMEPAD NAVIGATION
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
          
          if (gameState === 'splash' && anyButtonPressed) {
            handleStartInteraction();
            lastButtonAction.current = now;
          }

          else if (gameState === 'menu' && inputMode === 'gamepad') {
            if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { 
              playSfx('move');
              setFocusedMenuIndex(prev => (prev + 1) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { 
              playSfx('move');
              setFocusedMenuIndex(prev => (prev - 1 + menuOptions.length) % menuOptions.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[0].pressed) { 
              playSfx('press');
              setGameState(menuOptions[focusedMenuIndex]);
              lastButtonAction.current = now;
            }
          }

          else if (gameState === 'extra' && inputMode === 'gamepad') {
            if (gp.buttons[1].pressed) { 
              playSfx('back');
              setGameState('menu');
              lastButtonAction.current = now;
            } else if (gp.buttons[13].pressed || gp.axes[1] > 0.5) { 
              playSfx('move');
              setFocusedExtraIndex(prev => (prev + 1) % extraCharacters.length);
              lastButtonAction.current = now;
            } else if (gp.buttons[12].pressed || gp.axes[1] < -0.5) { 
              playSfx('move');
              setFocusedExtraIndex(prev => (prev - 1 + extraCharacters.length) % extraCharacters.length);
              lastButtonAction.current = now;
            }
          }

          else if ((gameState === 'startgame' || gameState === 'special' || gameState === 'credit') && inputMode === 'gamepad') {
            if (gp.buttons[1].pressed || gp.buttons[0].pressed) { 
              playSfx('back');
              setGameState('menu');
              setChapterAlert('');
              lastButtonAction.current = now;
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanGamepads);
    };

    animationFrameId = requestAnimationFrame(scanGamepads);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, inputMode, focusedMenuIndex, focusedExtraIndex]);

  // Logika Eksekusi Membuka / Mengklik Chapter Select
  const handleChapterClick = (chapterNum) => {
    if (chapterNum === 1) {
      playSfx('press');
      setChapterAlert('');
      alert('Memulai petualangan di Chapter 1...');
    } else {
      playSfx('back');
      // Menampilkan alasan kegagalan membuka chapter terkunci
      setChapterAlert(`CHAPTER ${chapterNum} TERKUNCI: Selesaikan Chapter sebelumnya untuk membuka kunci.`);
    }
  };

  return (
    <div className="horror-game-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {triggerFlash && <div className="flash-overlay"></div>}
      {gameState !== 'intro' && <div className="glitch-bg"></div>}

      {gameState !== 'intro' && (
        <div className="particles-container">
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

      {/* 2. SCREEN SPLASH (FIXED: MOUSE CLICK AKTIF) */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStartInteraction}>
          <div className="horror-overlay"></div>
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'Accessing...' : 'Press Anything or Click Mouse'}
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
                    color: focusedMenuIndex === idx ? '#ff1a1a' : '',
                    textShadow: focusedMenuIndex === idx ? '0 0 15px #ff1a1a' : '',
                    letterSpacing: focusedMenuIndex === idx ? '6px' : ''
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

      {/* 4. SCREEN CHAPTER SELECT (INTERAKTIF 6 CHAPTER + NOTIFIKASI ALASAN KUNCI) */}
      {gameState === 'startgame' && (
        <div className="intrinsics-panel">
          <div className="intrinsics-title-header">
            <h2>DRIFTER INTRINSICS / CHAPTER SELECT</h2>
          </div>
          
          <div className="stages-grid">
            {/* Chapter 1 Aktif */}
            <div className="stage-card">
              <div className="circle-wrapper">
                <div className="stage-circle-active focused" onClick={() => handleChapterClick(1)}>1</div>
              </div>
              <div className="stage-label-active">AVAILABLE</div>
            </div>

            {/* Chapter 2 - 6 Terkunci Menggunakan Simbol Vektor Putih */}
            {[2, 3, 4, 5, 6].map((num) => (
              <div className="stage-card" key={num} onClick={() => handleChapterClick(num)}>
                <div className="circle-wrapper">
                  <div className="stage-circle-locked">
                    <svg className="stage-lock-symbol-svg" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
                <div className="stage-label-locked">CHAPTER {num}</div>
              </div>
            ))}
          </div>

          {/* Alert Penjelasan Kenapa Terkunci */}
          <div className="chapter-lock-alert-box">
            {chapterAlert}
          </div>

          {/* REDESIGN BUTTON: No Background, Border Red Saja, Posisi Paling Bawah */}
          <button className="back-btn-aaa-border" onClick={() => { playSfx('back'); setGameState('menu'); setChapterAlert(''); }}>
            Return To Menu
          </button>
        </div>
      )}

      {/* 5. PANEL OPTION / SETTINGS */}
      {gameState === 'option' && (
        <div className="thief-settings-panel">
          <div className="settings-sidebar">
            <h2>SETTINGS</h2>
            {tabsList.map((tab) => (
              <div 
                key={tab}
                className={`settings-category ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { playSfx('move'); setActiveTab(tab); }}
              >
                {tab}
              </div>
            ))}
          </div>
          <div className="settings-main">
            {activeTab === 'graphics' && <div className="thief-row"><span className="thief-label">Motion Blur</span><div className="thief-toggle-group"><button className="thief-toggle-btn active">ON</button></div></div>}
            {activeTab === 'display' && <div className="thief-row"><span className="thief-label">Resolution</span><div className="thief-toggle-group"><button className="thief-toggle-btn active">1920x1080</button></div></div>}
            {activeTab === 'audio' && <div className="thief-row"><span className="thief-label">Master Volume</span><div className="thief-toggle-group"><button className="thief-toggle-btn active">100%</button></div></div>}
            {activeTab === 'gameplay' && <div className="thief-row"><span className="thief-label">Difficulty</span><div className="thief-toggle-group"><button className="thief-toggle-btn active">HARDCORE</button></div></div>}
            <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>Apply & Save</button>
          </div>
          <div className="settings-description"><p>System Mode: Keyboard & Mouse.</p></div>
        </div>
      )}

      {/* 6. SCREEN EXTRAS (BAR KETERANGAN CORET MENTOK BAWAH LAYAR) */}
      {gameState === 'extra' && (
        <div className="aaa-extras-layout">
          <div className="order-header">
            <h1 className="order-title">Extras</h1>
            <span className="order-subtitle">Content Bonus</span>
          </div>

          <div className="extras-menu-split">
            <div className="extras-list-container">
              {extraCharacters.map((char, index) => (
                <button
                  key={char.id}
                  className={`extra-character-row ${focusedExtraIndex === index ? 'focused' : ''}`}
                  onMouseEnter={() => {
                    if (inputMode === 'keyboard') {
                      playSfx('move');
                      setFocusedExtraIndex(index);
                    }
                  }}
                  onClick={() => playSfx('press')}
                >
                  {/* SIMBOL GEMBOK PUTIH MINIMALIS VEKTOR */}
                  <svg className="extra-char-lock-svg" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="extra-char-title">{char.title}</span>
                </button>
              ))}
            </div>

            <div className="extras-description-panel" key={focusedExtraIndex}>
              <div className="extras-desc-title-sub">Locked Content Data</div>
              <div className="extras-desc-main-text">{extraCharacters[focusedExtraIndex].desc}</div>
            </div>
          </div>

          {/* BAR PANDUAN BUTTON SEKARANG MENTOK AMAN DI BAWAH CONTAINER */}
          <div className="gamepad-indicator-bar left-align">
            {inputMode === 'keyboard' ? (
              <>
                <div className="gamepad-btn-hint"><span className="kb-btn-tag">W/S</span> Navigate</div>
                <div className="gamepad-btn-hint"><span className="kb-btn-tag">Esc</span> Back to Menu</div>
              </>
            ) : (
              <>
                <div className="gamepad-btn-hint"><span className="ds-btn-cross">✕</span> Select</div>
                <div className="gamepad-btn-hint"><span className="ds-btn-circle">◯</span> Back</div>
              </>
            )}
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

      {/* 8. SCREEN CREDIT */}
      {gameState === 'credit' && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>Credits</h2>
            <p style={{ margin: '40px 0', fontSize: '2.2rem', color: '#ffffff', letterSpacing: '3px', fontWeight: 'bold' }}>Created by Nurull</p>
            <button className="back-btn focused" onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}

      {/* GLOBAL CONTROLLER BAR */}
      {inputMode === 'gamepad' && gameState !== 'intro' && gameState !== 'extra' && (
        <div className="gamepad-indicator-bar">
          <div className="gamepad-btn-hint"><span className="ds-btn-cross">✕</span> Select / Change</div>
          <div className="gamepad-btn-hint"><span className="ds-btn-circle">◯</span> Back</div>
        </div>
      )}

    </div>
  );
};

export default MainMenu;
