"use client";

import { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";

interface StopwatchState {
  mode: "countdown" | "countup";
  isRunning: boolean;
  durationSeconds: number; // výchozí délka odpočtu v sekundách (např. 10 * 60 = 600)
  targetTimestamp: number | null; // čas v ms, kdy odpočet dosáhne 0 (nebo start timestamp u countup)
  remainingSeconds: number; // zbývající sekundy (použito při pauze)
  soundEnabled: boolean;
  isMinimized: boolean;
  isClosed: boolean;
}

const STORAGE_KEY = "beerpong_tournament_stopwatch_v1";

const DEFAULT_DURATION = 10 * 60; // 10 minut default

function playDigitalAlarm() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Klasický digitální budík / piezo alarm:
    // 3 série po 4 ostrých pulzech (obdélníková vlna ~2730 Hz typická pro piezo bzučák)
    const bursts = [0, 0.4, 0.8];
    const beepsPerBurst = 4;
    const beepDuration = 0.045; // 45 ms
    const beepStep = 0.075; // 75 ms mezi začátky

    bursts.forEach((burstStart) => {
      for (let i = 0; i < beepsPerBurst; i++) {
        const start = now + burstStart + i * beepStep;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Obdélníková vlna dodá nezaměnitelný ostrý digitální budíkový tón
        osc.type = "square";
        osc.frequency.setValueAtTime(2730, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.003);
        gain.gain.setValueAtTime(0.25, start + beepDuration - 0.003);
        gain.gain.linearRampToValueAtTime(0, start + beepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + beepDuration + 0.005);
      }
    });
  } catch (e) {
    // Prohlížeč mohl zablokovat audio bez interakce
    console.warn("AudioContext play error:", e);
  }
}

export function TournamentStopwatch() {
  const [state, setState] = useState<StopwatchState>(() => {
    if (typeof window === "undefined") {
      return {
        mode: "countdown",
        isRunning: false,
        durationSeconds: DEFAULT_DURATION,
        targetTimestamp: null,
        remainingSeconds: DEFAULT_DURATION,
        soundEnabled: true,
        isMinimized: false,
        isClosed: false,
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isClosed: parsed.isClosed ?? false,
        };
      }
    } catch {
      // Ignorovat chybu parsování
    }

    return {
      mode: "countdown",
      isRunning: false,
      durationSeconds: DEFAULT_DURATION,
      targetTimestamp: null,
      remainingSeconds: DEFAULT_DURATION,
      soundEnabled: true,
      isMinimized: false,
      isClosed: false,
    };
  });

  const [displaySeconds, setDisplaySeconds] = useState<number>(state.remainingSeconds);
  const [hasFinishedAlert, setHasFinishedAlert] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Uložení stavu do localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorovat chybu zápisu
    }
  }, [state]);

  // Hlavní smyčka hodin
  useEffect(() => {
    if (!state.isRunning || !state.targetTimestamp) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplaySeconds(state.remainingSeconds);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      if (state.mode === "countdown") {
        const diffMs = state.targetTimestamp! - now;
        const remaining = Math.max(0, Math.ceil(diffMs / 1000));
        setDisplaySeconds(remaining);

        if (remaining <= 0) {
          // Konec odpočtu
          if (state.soundEnabled && !hasFinishedAlert) {
            playDigitalAlarm();
          }
          setHasFinishedAlert(true);
          setState((prev) => ({
            ...prev,
            isRunning: false,
            remainingSeconds: 0,
            targetTimestamp: null,
          }));
        }
      } else {
        // Count up (stopky)
        const diffMs = now - state.targetTimestamp!;
        const elapsed = Math.floor(diffMs / 1000);
        setDisplaySeconds(elapsed);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [
    state.isRunning,
    state.targetTimestamp,
    state.remainingSeconds,
    state.mode,
    state.soundEnabled,
    hasFinishedAlert,
  ]);

  const handleStart = () => {
    const now = Date.now();
    setHasFinishedAlert(false);

    if (state.mode === "countdown") {
      const remaining = state.remainingSeconds > 0 ? state.remainingSeconds : state.durationSeconds;
      setState((prev) => ({
        ...prev,
        isRunning: true,
        remainingSeconds: remaining,
        targetTimestamp: now + remaining * 1000,
      }));
    } else {
      // count up
      const startAt = now - state.remainingSeconds * 1000;
      setState((prev) => ({
        ...prev,
        isRunning: true,
        targetTimestamp: startAt,
      }));
    }
  };

  const handlePause = () => {
    if (!state.isRunning) return;
    const now = Date.now();
    let currentRemaining = displaySeconds;

    if (state.mode === "countdown" && state.targetTimestamp) {
      currentRemaining = Math.max(0, Math.ceil((state.targetTimestamp - now) / 1000));
    } else if (state.mode === "countup" && state.targetTimestamp) {
      currentRemaining = Math.floor((now - state.targetTimestamp) / 1000);
    }

    setState((prev) => ({
      ...prev,
      isRunning: false,
      targetTimestamp: null,
      remainingSeconds: currentRemaining,
    }));
  };

  const handleReset = () => {
    setHasFinishedAlert(false);
    const resetSeconds = state.mode === "countdown" ? state.durationSeconds : 0;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      targetTimestamp: null,
      remainingSeconds: resetSeconds,
    }));
    setDisplaySeconds(resetSeconds);
  };

  const setPreset = (minutes: number) => {
    setHasFinishedAlert(false);
    const sec = minutes * 60;
    setState((prev) => ({
      ...prev,
      mode: "countdown",
      durationSeconds: sec,
      remainingSeconds: sec,
      isRunning: false,
      targetTimestamp: null,
    }));
    setDisplaySeconds(sec);
  };

  const adjustTime = (deltaSeconds: number) => {
    const newRemaining = Math.max(0, displaySeconds + deltaSeconds);
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      remainingSeconds: newRemaining,
      targetTimestamp: prev.isRunning
        ? prev.mode === "countdown"
          ? now + newRemaining * 1000
          : now - newRemaining * 1000
        : null,
    }));
    setDisplaySeconds(newRemaining);
  };

  const toggleMode = (newMode: "countdown" | "countup") => {
    setHasFinishedAlert(false);
    const initSec = newMode === "countdown" ? state.durationSeconds : 0;
    setState((prev) => ({
      ...prev,
      mode: newMode,
      isRunning: false,
      targetTimestamp: null,
      remainingSeconds: initSec,
    }));
    setDisplaySeconds(initSec);
  };

  const [isMinimizing, setIsMinimizing] = useState(false);

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      setState((prev) => ({ ...prev, isMinimized: true }));
      setIsMinimizing(false);
    }, 220);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (state.isClosed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, isClosed: false }))}
          className="btn btn-sm btn-primary shadow-lg border border-primary/30 text-xs font-bold px-3.5"
          title="Otevřít turnajové stopky"
        >
          Stopky
        </button>
      </div>
    );
  }

  // Minimalizovaná plovoucí pilulka (animovaný příchod od spodního okraje)
  if (state.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 transition-all duration-300 ease-out transform animate-in fade-in zoom-in-75 slide-in-from-bottom-4 slide-in-from-right-4">
        <div className="bg-base-100/95 backdrop-blur-md border-2 border-primary/40 shadow-xl rounded-full px-3.5 py-1.5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={state.isRunning ? handlePause : handleStart}
            className={`btn btn-circle btn-xs ${
              state.isRunning ? "btn-warning" : "btn-primary"
            }`}
          >
            {state.isRunning ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3 translate-x-0.5" />
            )}
          </button>

          <span
            className={`font-black font-mono text-base tabular-nums ${
              state.mode === "countdown" && displaySeconds === 0
                ? "text-error animate-pulse"
                : state.isRunning
                ? "text-primary"
                : "text-base-content"
            }`}
          >
            {formatTime(displaySeconds)}
          </span>

          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, isMinimized: false }))}
            className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:text-base-content"
            title="Maximalizovat stopky"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const isZero = state.mode === "countdown" && displaySeconds === 0;

  return (
    <div
      className={`card bg-base-100 shadow-md border-2 border-primary/30 mb-6 overflow-hidden transition-all duration-300 ease-in-out transform origin-bottom-right ${
        isMinimizing
          ? "scale-50 translate-x-16 translate-y-12 opacity-0 pointer-events-none"
          : "scale-100 opacity-100 animate-in fade-in zoom-in-95 duration-200"
      }`}
    >
      <div className="card-body p-3.5 sm:p-5">
        {/* Horní hlavička stopek bez ikony hodin */}
        <div className="flex items-center justify-between gap-2 border-b border-base-200 pb-2.5">
          <div>
            <h3 className="font-bold text-sm leading-none">Turnajové stopky</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5">
              {state.mode === "countdown" ? "Odpočet kola" : "Měření času"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              className={`btn btn-ghost btn-xs btn-square ${
                state.soundEnabled ? "text-primary" : "text-base-content/40"
              }`}
              title={state.soundEnabled ? "Zvuk zapnut" : "Zvuk vypnut"}
            >
              {state.soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleMinimize}
              className="btn btn-ghost btn-xs btn-square text-base-content/70"
              title="Minimalizovat do plovoucího widgetu"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setState((prev) => ({ ...prev, isClosed: true }))}
              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error"
              title="Skrýt stopky"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Hlavní displej a ovládání */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Velký ciferník */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl font-mono text-3xl sm:text-4xl font-black tabular-nums border ${
                isZero
                  ? "bg-error/20 border-error text-error animate-pulse"
                  : state.isRunning
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-base-200/70 border-base-300 text-base-content"
              }`}
            >
              {formatTime(displaySeconds)}
            </div>

            {/* Tlačítka +1m / -1m */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => adjustTime(60)}
                className="btn btn-outline btn-xs px-2 gap-1 text-[11px]"
                title="Přidat 1 minutu"
              >
                <Plus className="h-3 w-3" />
                <span>1m</span>
              </button>
              <button
                type="button"
                onClick={() => adjustTime(-60)}
                className="btn btn-outline btn-xs px-2 gap-1 text-[11px]"
                title="Odebrat 1 minutu"
              >
                <Minus className="h-3 w-3" />
                <span>1m</span>
              </button>
            </div>
          </div>

          {/* Akční tlačítka Start / Pauza / Reset */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={state.isRunning ? handlePause : handleStart}
              className={`btn btn-sm text-xs gap-1.5 px-4 font-bold ${
                state.isRunning ? "btn-warning" : "btn-primary"
              }`}
            >
              {state.isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pozastavit</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>{displaySeconds === 0 ? "Spustit znovu" : "Spustit"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline btn-sm text-xs gap-1 px-3"
              title="Resetovat stopky"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Spodní předvolby časů (6 minut a 10 minut) a režim */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-200/70 mt-2 text-xs">
          {/* Předvolby */}
          <div className="flex items-center gap-1.5">
            <span className="text-base-content/60 text-[11px]">Předvolby:</span>
            {[6, 10].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setPreset(mins)}
                className={`btn btn-xs ${
                  state.mode === "countdown" && state.durationSeconds === mins * 60
                    ? "btn-primary btn-outline font-bold"
                    : "btn-ghost text-base-content/70 hover:bg-base-200"
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Přepínač režimu: Odpočet vs Stopky */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleMode("countdown")}
              className={`btn btn-xs ${
                state.mode === "countdown" ? "btn-active btn-neutral" : "btn-ghost"
              }`}
            >
              Odpočet
            </button>
            <button
              type="button"
              onClick={() => toggleMode("countup")}
              className={`btn btn-xs ${
                state.mode === "countup" ? "btn-active btn-neutral" : "btn-ghost"
              }`}
            >
              Stopky
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
