"use client";
import { useEffect, useRef, useState } from "react";

const MOODS = [
  { label: "😊", name: "Happy", color: "bg-blue-200" },
  { label: "😐", name: "Neutral", color: "bg-blue-100" },
  { label: "😔", name: "Sad", color: "bg-blue-300" },
  { label: "😤", name: "Stressed", color: "bg-blue-400" },
];

const ICONS = ["💡", "⏰", "📝", "🎯", "💙", "✨"];
const QUOTES = [
  "Productivity is never an accident.",
  "Small steps every day.",
  "You are capable of amazing things.",
  "Dream big. Start small. Act now.",
  "Your future is created by what you do today.",
  "Stay positive, work hard, make it happen."
];

function formatTime(ms) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function PingPal() {
  // State
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [pings, setPings] = useState([]);
  const [pingInput, setPingInput] = useState("");
  const [pingTime, setPingTime] = useState(15);
  const [mood, setMood] = useState(MOODS[0]);
  const [alertPing, setAlertPing] = useState(null); // {id, text}
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef();
  const audioRef = useRef();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [rains, setRains] = useState([]); // {id, emoji, left, size, duration}

  // Load from backend/API
  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then(setTasks);
    fetch("/api/pings").then(r => r.json()).then(setPings);
    const storedMood = window.localStorage.getItem("pingpal-mood");
    if (storedMood) setMood(JSON.parse(storedMood));
  }, []);

  // Save mood to localStorage
  useEffect(() => {
    window.localStorage.setItem("pingpal-mood", JSON.stringify(mood));
  }, [mood]);

  // Live timer for countdowns
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Check for expired pings and show popup with alarm
  useEffect(() => {
    if (alertPing) return; // Only one alert at a time
    const expired = pings.find((p) => p.expiresAt <= now);
    if (expired) {
      setAlertPing(expired);
      // Play alarm sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset to beginning
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }, [pings, now, alertPing]);

  // Rotating quote effect
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Rain handler
  function handleEmojiRain(emoji) {
    const newRains = Array.from({ length: 18 }, (_, i) => ({
      id: `${emoji}-${Date.now()}-${i}-${Math.random()}`,
      emoji,
      left: getRandomInt(5, 95), // percent
      size: getRandomInt(24, 48), // px
      duration: getRandomInt(1200, 2000), // ms
    }));
    setRains((prev) => [...prev, ...newRains]);
    setTimeout(() => {
      setRains((prev) => prev.filter(r => !newRains.some(nr => nr.id === r.id)));
    }, 2200);
  }

  // Add task
  async function addTask(e) {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: taskInput.trim() }),
    });
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
    setTaskInput("");
  }

  // Delete task
  async function deleteTask(id) {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Add ping
  async function addPing(e) {
    e.preventDefault();
    if (!pingInput.trim() || !pingTime) return;
    const expiresAt = Date.now() + pingTime * 60 * 1000;
    const res = await fetch("/api/pings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: pingInput.trim(), expiresAt }),
    });
    const newPing = await res.json();
    setPings((prev) => [...prev, newPing]);
    setPingInput("");
    setPingTime(15);
  }

  // Delete ping
  async function deletePing(id) {
    await fetch("/api/pings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPings((prev) => prev.filter((p) => p.id !== id));
    if (alertPing && alertPing.id === id) setAlertPing(null);
  }

  // Mood change
  function handleMood(m) {
    setMood(m);
  }

  // Dismiss popup and remove expired ping
  function handleAlertClose() {
    if (alertPing) {
      // Stop alarm sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      deletePing(alertPing.id);
      setAlertPing(null);
    }
  }

  // Mood color
  const moodColor = mood.color;

  return (
    <div className={`relative w-full min-h-screen flex flex-col items-center py-8 px-2 transition-all duration-500 ${moodColor} overflow-hidden`}>
      {/* Hidden audio element for alarm */}
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
      
      {/* Decorative Blobs - larger and more for visual fill */}
      <div className="pointer-events-none select-none absolute top-[-15%] left-[-20%] w-[500px] h-[500px] bg-blue-300 opacity-40 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none select-none absolute bottom-[-15%] right-[-20%] w-[500px] h-[500px] bg-blue-400 opacity-40 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none select-none absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-200 opacity-30 rounded-full blur-2xl z-0" />
      <div className="pointer-events-none select-none absolute bottom-[25%] left-[-10%] w-[300px] h-[300px] bg-blue-200 opacity-30 rounded-full blur-2xl z-0" />
      {/* Emoji Rain Animation - now behind main content (z-0) */}
      {rains.map(rain => (
        <span
          key={rain.id}
          className="pointer-events-none select-none fixed z-0 animate-emoji-rain"
          style={{
            left: `${rain.left}%`,
            top: '-3%',
            fontSize: `${rain.size}px`,
            animationDuration: `${rain.duration}ms`,
          }}
        >
          {rain.emoji}
        </span>
      ))}
      
      <div className="fixed top-1/2 left-2 -translate-y-1/2 flex flex-col gap-4 items-center z-30">
        {ICONS.map((icon, i) => (
          <button
            key={i}
            className="text-3xl md:text-4xl lg:text-5xl opacity-90 drop-shadow-lg select-none hover:scale-125 active:scale-90 transition-transform bg-white/60 rounded-full p-1 border border-blue-200 shadow"
            onClick={() => handleEmojiRain(icon)}
            aria-label={`Rain ${icon}`}
            type="button"
          >
            {icon}
          </button>
        ))}
      </div>
      {/* Main Content - wider on large screens, now z-10 */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <header className="mb-8 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 drop-shadow-lg mb-2">PingPal</h1>
            <p className="text-xl md:text-2xl text-blue-900 font-extrabold">Task reminder app</p>
          </header>

          {/* Mood Selector */}
          <div className="flex gap-2 mb-8">
            {MOODS.map((m, i) => (
              <button
                key={m.name}
                className={`rounded-full px-4 py-2 text-2xl border-2 border-blue-300 font-extrabold transition-all duration-200 ${mood.name === m.name ? "bg-blue-400 text-white scale-110" : "bg-white text-blue-900 hover:bg-blue-100"}`}
                onClick={() => handleMood(m)}
                aria-label={m.name}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Task List */}
          <section className="w-full max-w-2xl mb-8">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4">Tasks</h2>
            <form onSubmit={addTask} className="flex gap-2 mb-4">
              <input
                className="flex-1 rounded-lg border border-blue-200 px-4 py-2 text-lg font-extrabold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Add a new task..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                aria-label="Add task"
              />
              <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg font-extrabold shadow hover:bg-blue-900 transition">Add</button>
            </form>
            <ul className="space-y-2">
              {tasks.length === 0 && <li className="text-blue-400 italic">No tasks yet!</li>}
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between px-2 py-1 rounded-lg group text-blue-950 font-extrabold">
                  <span>{task.text}</span>
                  <button
                    className="text-red-500 hover:text-red-700 text-xl font-extrabold ml-2 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Ping Mode */}
          <section className="w-full max-w-2xl mb-8">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4">Ping Mode</h2>
            <form onSubmit={addPing} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                className="flex-1 rounded-lg border border-blue-200 px-4 py-2 text-lg font-extrabold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Quick reminder (e.g. Drink water)"
                value={pingInput}
                onChange={(e) => setPingInput(e.target.value)}
                aria-label="Ping text"
              />
              <input
                type="number"
                min="1"
                max="120"
                className="w-24 rounded-lg border border-blue-200 px-4 py-2 text-lg font-extrabold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={pingTime}
                onChange={(e) => setPingTime(Number(e.target.value))}
                aria-label="Ping time in minutes"
              />
              <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-lg font-extrabold shadow hover:bg-blue-900 transition">Ping</button>
            </form>
            <ul className="space-y-2">
              {pings.length === 0 && <li className="text-blue-400 italic">No pings yet!</li>}
              {pings.map((ping) => {
                const msLeft = ping.expiresAt - now;
                return (
                  <li key={ping.id} className="flex items-center justify-between px-2 py-1 rounded-lg group text-blue-950 font-extrabold">
                    <span>
                      {ping.text} <span className="text-blue-500 text-xs font-extrabold">({formatTime(msLeft)})</span>
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700 text-xl font-extrabold ml-2 opacity-0 group-hover:opacity-100 transition"
                      onClick={() => deletePing(ping.id)}
                      aria-label="Delete ping"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Visual Alert for Urgent Ping */}
          {alertPing && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-blue-900/70" style={{ pointerEvents: 'auto' }}>
              <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center animate-bounce border-4 border-blue-700 z-50" style={{ pointerEvents: 'auto' }}>
                <span className="text-7xl mb-6 animate-pulse">⏰</span>
                <p className="text-3xl text-blue-900 font-extrabold mb-4 text-center">Time's up for:</p>
                <p className="text-2xl text-blue-700 font-extrabold mb-6 text-center">{alertPing.text}</p>
                <button
                  className="bg-blue-700 text-white px-8 py-3 rounded-lg font-extrabold shadow-lg hover:bg-blue-900 transition text-xl mt-2 z-50"
                  onClick={handleAlertClose}
                  type="button"
                >
                  Okay
                </button>
              </div>
            </div>
          )}

          <footer className="mt-8 text-center text-blue-400 text-xs font-extrabold">
            PingPal &copy; {new Date().getFullYear()} &mdash; A dramatic, expressive planner.
          </footer>
        </div>
      </div>
    </div>
  );
}
