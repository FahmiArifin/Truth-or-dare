/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Type, Volume2, VolumeX, Eye, Info, Volume } from 'lucide-react';
import { TTSPlayerConfig } from '../types';

interface A11ySettingsProps {
  fontSizeSetting: 'normal' | 'large' | 'xlarge';
  setFontSizeSetting: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrastEnabled: boolean;
  setHighContrastEnabled: (val: boolean) => void;
  ttsConfig: TTSPlayerConfig;
  setTtsConfig: (config: TTSPlayerConfig) => void;
  onShowAlert?: (msg: string) => void;
}

export default function A11ySettings({
  fontSizeSetting,
  setFontSizeSetting,
  highContrastEnabled,
  setHighContrastEnabled,
  ttsConfig,
  setTtsConfig,
  onShowAlert
}: A11ySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const speakTestText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = 'Uji coba suara aksesibilitas untuk permainan Truth or Dare.';
      const r = new SpeechSynthesisUtterance(text);
      r.lang = 'id-ID';
      r.pitch = ttsConfig.pitch;
      r.rate = ttsConfig.rate;
      window.speechSynthesis.speak(r);
    } else {
      if (onShowAlert) {
        onShowAlert('Sistem Text-to-Speech tidak didukung di peramban ini.');
      } else {
        alert('Sistem Text-to-Speech tidak didukung di peramban ini.');
      }
    }
  };

  return (
    <div className="bg-neutral-900 border-2 border-neutral-850 rounded-2xl p-5 shadow-xl max-w-lg mb-6">
      <div className="flex items-center justify-between">
        <button
          id="toggle-a11y-panel-btn"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-controls="a11y-panel-content"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-100 rounded-xl text-sm font-bold border border-neutral-700/60 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer transition"
        >
          <Eye size={16} className="text-red-500" />
          <span>Pengaturan Aksesibilitas (WCAG)</span>
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-black uppercase tracking-wider">
          <Info size={12} className="text-red-500" />
          <span>POUR Standard</span>
        </div>
      </div>

      {isOpen && (
        <div
          id="a11y-panel-content"
          className="mt-4 pt-4 border-t border-neutral-800 space-y-4"
        >
          {/* Font Resizer */}
          <div className="space-y-2">
            <label id="label-font-size" className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={16} className="text-red-500" />
              <span>Ukuran Teks Antarmuka</span>
            </label>
            <div
              role="group"
              aria-labelledby="label-font-size"
              className="grid grid-cols-3 gap-2"
            >
              <button
                id="font-size-normal-btn"
                onClick={() => setFontSizeSetting('normal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                  fontSizeSetting === 'normal'
                    ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700/60 hover:bg-neutral-700'
                }`}
              >
                Normal
              </button>
              <button
                id="font-size-besar-btn"
                onClick={() => setFontSizeSetting('large')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                  fontSizeSetting === 'large'
                    ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700/60 hover:bg-neutral-700'
                }`}
              >
                Besar (Large)
              </button>
              <button
                id="font-size-sangat-besar-btn"
                onClick={() => setFontSizeSetting('xlarge')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                  fontSizeSetting === 'xlarge'
                    ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700/60 hover:bg-neutral-700'
                }`}
              >
                Sangat Besar (XL)
              </button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-800/40">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                <span className="w-4 h-4 bg-white border border-black rounded flex items-center justify-center p-0.5" aria-hidden="true">
                  <span className="w-full h-full bg-black rounded-sm" />
                </span>
                <span>Mode Kontras Tinggi AAA</span>
              </span>
              <p className="text-xs text-neutral-500 font-medium">Meningkatkan rasio warna (Level AAA) untuk membaca lebih jelas.</p>
            </div>
            <button
              id="toggle-contrast-btn"
              onClick={() => setHighContrastEnabled(!highContrastEnabled)}
              aria-pressed={highContrastEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 ${
                highContrastEnabled ? 'bg-red-600' : 'bg-neutral-800'
              }`}
            >
              <span className="sr-only">Aktifkan Kontras Tinggi</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  highContrastEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Text-to-Speech TTS */}
          <div className="space-y-3 pt-2 border-t border-neutral-850">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                  {ttsConfig.enabled ? (
                    <Volume2 size={16} className="text-red-500 animate-pulse" />
                  ) : (
                    <VolumeX size={16} className="text-neutral-500" />
                  )}
                  <span>Pembaca Suara (TTS) Otomatis</span>
                </span>
                <p className="text-xs text-neutral-500">Membaca kartu Truth/Dare keras-keras saat giliran tiba.</p>
              </div>
              <button
                id="toggle-tts-btn"
                onClick={() => setTtsConfig({ ...ttsConfig, enabled: !ttsConfig.enabled })}
                aria-pressed={ttsConfig.enabled}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  ttsConfig.enabled ? 'bg-red-600' : 'bg-neutral-800'
                }`}
              >
                <span className="sr-only">Aktifkan Pembaca Suara</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    ttsConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {ttsConfig.enabled && (
              <div className="bg-neutral-950 p-3 rounded-xl space-y-3 border border-neutral-800/85 transition fade-in">
                {/* Voice Rate Speed Control */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <label id="tts-rate-label" htmlFor="tts-rate-slider">Kecepatan Suara:</label>
                    <span>{ttsConfig.rate}x</span>
                  </div>
                  <input
                    id="tts-rate-slider"
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    aria-describedby="tts-rate-label"
                    value={ttsConfig.rate}
                    onChange={(e) => setTtsConfig({ ...ttsConfig, rate: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Voice Pitch Control */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <label id="tts-pitch-label" htmlFor="tts-pitch-slider">Tinggi Nada (Pitch):</label>
                    <span>{ttsConfig.pitch}</span>
                  </div>
                  <input
                    id="tts-pitch-slider"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    aria-describedby="tts-pitch-label"
                    value={ttsConfig.pitch}
                    onChange={(e) => setTtsConfig({ ...ttsConfig, pitch: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* TTS Tester */}
                <button
                  id="test-tts-btn"
                  onClick={speakTestText}
                  className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-red-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700/60 focus:ring-2 focus:ring-red-500 transition cursor-pointer"
                  type="button"
                >
                  <Volume size={14} />
                  <span>Uji Coba Suara</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
