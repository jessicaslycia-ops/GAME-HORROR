import React, { useState, useEffect, useRef } from 'react';
import '../styles/MainMenu.css';

const MainMenu = () => {
  const [gameState, setGameState] = useState('intro'); // intro, splash, menu, startgame, option, credit, extra, special
  const [activeTab, setActiveTab] = useState('graphics');
  const [isInteracted, setIsInteracted] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState(false);

  // 1. OTOMATIS LOAD ASSET GAMBAR DEFAULT DARI FOLDER PUBLIC
  const [bgImage, setBgImage] = useState('/bg-default.jpg'); 

  // 2. OTOMATIS INFEKSI & PATH SOUND DEFAULT DARI FOLDER PUBLIC
  const audioRefs = {
    press: useRef(new Audio('/sounds/press.mp3')),
    back: useRef(new Audio('/sounds/back.mp3')),
    bgm: useRef(new Audio('/sounds/bgm.mp3')),
    move: useRef(new Audio('/sounds/move.mp3')),
  };

  // State Nama File Audio (Jika user nanti upload baru, namanya akan berubah)
  const [audioNames, setAudioNames] = useState({
    press: 'bg-default.mp3 (System)',
    back: 'back.mp3 (System)',
    bgm: 'bgm.mp3 (System)',
    move: 'move.mp3 (System)',
  });

  const [settings, setSettings] = useState({
    motionBlur: 'ON',
    shadow: 'HIGH',
    cinematic: 'ON',
  });

  // Setelan awal untuk BGM bawaan sistem agar otomatis me-looping (mengulang)
  useEffect(() => {
    if (audioRefs.bgm.current) {
      audioRefs.bgm.current.loop = true;
    }
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
      audioRefs.bgm.current.play().catch(() => {
        console.log("Browser memblokir autoplay musik sebelum user berinteraksi.");
      });
    }
  }, [gameState]);

  // Fungsi Unggah Berkas Media Manual (Tetap dipertahankan agar user bisa ganti sesuka hati)
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

  // Trigger Efek Suara (Tidak menggunakan synth generator lagi, melainkan file asli)
  const playSfx = (type) => {
    if (audioRefs[type].current) {
      audioRefs[type].current.currentTime = 0;
      audioRefs[type].current.play().catch((err) => console.log("Gagal memutar audio:", err));
    }
  };

  // Fase 2: Aksi Tekan Sembarang Tombol / Klik Layar
  const handleStartInteraction = () => {
    if (isInteracted) return;
    setIsInteracted(true);
    playSfx('press');
    
    // Aktifkan kilatan cahaya putih benderang
    setTriggerFlash(true);

    // Mengalihkan ke Home Menu dengan mulus setelah flash meredup
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
    <div 
      className="horror-game-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Efek Kilatan Flash Putih Terang */}
      {triggerFlash && <div className="flash-overlay"></div>}

      {/* Background Glitch Layar */}
      {gameState !== 'intro' && <div className="glitch-bg"></div>}

      {/* Partikel Putih Selalu Aktif dari Bawah Ke Atas */}
      {gameState !== 'intro' && (
        <div className="particles-container">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      )}

      {/* 1. LAYAR INTRO */}
      {gameState === 'intro' && (
        <div className="intro-screen">
          <h1>Made by Beben</h1>
        </div>
      )}

      {/* 2. LAYAR SPLASH */}
      {gameState === 'splash' && (
        <div className="splash-screen" onClick={handleStartInteraction}>
          <div className="horror-overlay"></div>
          <div className={`press-anything-text ${isInteracted ? 'interacted' : ''}`}>
            {isInteracted ? 'Accessing...' : 'Press Anything'}
          </div>
        </div>
      )}

      {/* 3. LAYAR HOME MENU UTAMA */}
      {gameState === 'menu' && (
        <div className="order-layout">
          <div className="order-header">
            <h1 className="order-title">FINAL END</h1>
            <span className="order-subtitle">2026</span>
          </div>

          <ul className="order-menu-list">
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('startgame'); }}>Start Game</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('extra'); }}>Extra</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('special'); }}>Special Content</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('option'); }}>Option</button>
            </li>
            <li className="order-menu-item">
              <button className="order-menu-btn" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); setGameState('credit'); }}>Credit</button>
            </li>
          </ul>
        </div>
      )}

      {/* 4. LAYAR SELECT CHAPTER / STAGE */}
      {gameState === 'startgame' && (
        <div className="intrinsics-panel">
          <div className="intrinsics-title-header">
            <h2>DRIFTER INTRINSICS / CHAPTER SELECT</h2>
          </div>

          <div className="stages-grid">
            <div className="stage-card">
              <div className="circle-wrapper">
                <div className="stage-circle-active" onMouseEnter={() => playSfx('move')} onClick={() => { playSfx('press'); alert('Memasuki Level 1...'); }}>
                  1
                </div>
              </div>
              <div className="stage-label-active">AVAILABLE</div>
            </div>

            {[2, 3, 4, 5, 6].map((num) => (
              <div className="stage-card" key={num}>
                <div className="circle-wrapper">
                  <div className="stage-circle-locked">🔒</div>
                </div>
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
            <div className={`settings-category ${activeTab === 'graphics' ? 'active' : ''}`} onClick={() => { playSfx('move'); setActiveTab('graphics'); }}>
              Graphics & Visual
            </div>
            <div className={`settings-category ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => { playSfx('move'); setActiveTab('audio'); }}>
              Audio & Media
            </div>
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

                <div className="thief-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="thief-label">Background Image</span>
                  <div className="upload-box" style={{ width: '100%' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'background-img')} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'audio' && (
              <>
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
              </>
            )}

            <button className="back-btn" onClick={() => { playSfx('back'); setGameState('menu'); }}>Apply & Save</button>
          </div>

          <div className="settings-description">
            <p>
              {activeTab === 'graphics' 
                ? 'Sesuaikan filter visual dan aset grafis game. Mengubah gambar latar belakang akan langsung diaplikasikan ke menu utama secara real-time.' 
                : 'Konfigurasi Audio Sistem: Masukkan ekstensi berkas audio berupa .mp3/.wav. Lagu latar belakang utama (BGM) akan diputar berulang secara mulus.'}
            </p>
          </div>
        </div>
      )}

      {/* PANEL TAMBAHAN */}
      {(gameState === 'extra' || gameState === 'special' || gameState === 'credit') && (
        <div className="thief-settings-panel" style={{ gridTemplateColumns: '1fr' }}>
          <div className="settings-main" style={{ textAlign: 'center', paddingTop: '10%' }}>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '5px', color: '#ff1a1a', fontSize: '2.5rem' }}>
              {gameState === 'extra' && 'Extra Content'}
              {gameState === 'special' && 'Special Content'}
              {gameState === 'credit' && 'Credits'}
            </h2>
            <p style={{ margin: '30px 0', fontSize: '1.4rem', color: '#ccc' }}>
              {gameState === 'extra' && 'Galleries, Concept Arts, and Unlockable items will appear here.'}
              {gameState === 'special' && 'Bonus Developer Commentary and Behind the Scenes.'}
              {gameState === 'credit' && 'Lead Project & Designer: BEBEN'}
            </p>
            <button className="back-btn" style={{ width: '300px', margin: '0 auto' }} onClick={() => { playSfx('back'); setGameState('menu'); }}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
