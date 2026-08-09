"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Shield, Activity, Terminal, Settings, Bell, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

// Premium 3D AI Core
function AICore({ isThreat }: { isThreat: boolean }) {
  return (
    <Sphere visible args={[1.2, 100, 200]} scale={1}>
      <MeshDistortMaterial
        color={isThreat ? "#ff0033" : "#6366f1"}
        emissive={isThreat ? "#ff0033" : "#6366f1"}
        emissiveIntensity={isThreat ? 1.5 : 0.5}
        distort={isThreat ? 0.5 : 0.25}
        speed={isThreat ? 8 : 1.5}
        roughness={0.1}
        metalness={0.9}
      />
    </Sphere>
  );
}

// TypeScript type for our database logs
type LogItem = {
  id: number;
  user_id: string;
  action_taken: string;
  blocked: boolean;
  timestamp: string;
};

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Environment Variable
  
  const [prompt, setPrompt] = useState("");
  const [isThreat, setIsThreat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sanitizedPrompt, setSanitizedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [dbLogs, setDbLogs] = useState<LogItem[]>([]);
  
  // NAYA: Dynamic Stats State
  const [stats, setStats] = useState({ total_scanned: 0, threats_blocked: 0, money_saved: 0 });

  // Page load hone par database se logs aur stats fetch karna
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/logs`);
        const data = await response.json();
        setDbLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs from database");
      }
    };

    // NAYA: Stats fetch karna
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats");
      }
    };

    fetchLogs();
    fetchStats();
  }, [API_URL]);

  const handleScan = async () => {
    if (!prompt) return;
    setLoading(true);
    setSanitizedPrompt("");
    setAiResponse("");
    
    try {
      const response = await fetch(`${API_URL}/api/v1/process-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "user_frontend_test", prompt: prompt }),
      });
      const data = await response.json();
      
      setIsThreat(data.blocked);
      setSanitizedPrompt(data.sanitized_prompt);
      setAiResponse(data.message);
      
      const newLog: LogItem = {
        id: Date.now(),
        user_id: "user_frontend_test",
        action_taken: data.action_taken,
        blocked: data.blocked,
        timestamp: new Date().toISOString()
      };
      setDbLogs((prev) => [newLog, ...prev]);
      
      // NAYA: 1 second baad stats aur logs wapas fetch karna taake numbers update hon
      setTimeout(() => {
        setIsThreat(false);
        fetch(`${API_URL}/api/v1/stats`).then(res => res.json()).then(data => setStats(data));
        fetch(`${API_URL}/api/v1/logs`).then(res => res.json()).then(data => setDbLogs(data));
      }, 1000);
      
    } catch (error) {
      const errorLog: LogItem = {
        id: Date.now(),
        user_id: "system",
        action_taken: "Error: Backend is not running or URL is incorrect",
        blocked: true,
        timestamp: new Date().toISOString()
      };
      setDbLogs((prev) => [errorLog, ...prev]);
    }
    setLoading(false);
    setPrompt("");
  };

  return (
    <div className="flex h-screen w-full bg-[#050508] text-gray-100 overflow-hidden">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col p-4 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">CerebraOS</h1>
            <p className="text-xs text-gray-500">AI Firewall</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 text-white text-sm font-medium transition-colors">
            <Activity className="h-4 w-4" /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
            <Terminal className="h-4 w-4" /> Live Logs
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
            <AlertTriangle className="h-4 w-4" /> Threats
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white text-sm font-medium transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </button>
        </nav>

        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
          <p className="text-xs text-gray-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isThreat ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-bold text-white">{isThreat ? "Threat Detected" : "Active & Secure"}</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/10 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-xs text-gray-500">Real-time AI Traffic Monitor</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input type="text" placeholder="Search logs..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 relative">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="p-8 flex flex-col gap-6">
          
          {/* Stats Row (Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-500">Total Prompts Scanned</p>
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold">{stats.total_scanned}</h3>
              <p className="text-xs text-green-400 mt-2">Updated in real-time</p>
            </div>
            
            <div className={`bg-white/[0.02] border ${isThreat ? 'border-red-500/30' : 'border-white/5'} rounded-2xl p-6 transition-colors`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-500">Threats Blocked</p>
                <AlertTriangle className={`h-4 w-4 ${isThreat ? 'text-red-400 animate-pulse' : 'text-gray-600'}`} />
              </div>
              <h3 className="text-3xl font-bold">{stats.threats_blocked}</h3>
              <p className="text-xs text-gray-500 mt-2">Policy violations caught</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-500">Money Saved (Routing)</p>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-3xl font-bold">${stats.money_saved}</h3>
              <p className="text-xs text-gray-500 mt-2">Smart model selection active</p>
            </div>
          </div>

          {/* 3D Visualizer & Scanner Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
            
            {/* 3D Visualizer */}
            <div className="lg:col-span-1 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">AI Engine Core</p>
              </div>
              <Canvas camera={{ position: [0, 0, 4] }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.2} />
                  <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} color={isThreat ? "#ff0033" : "#a855f7"} />
                  <AICore isThreat={isThreat} />
                  <Environment preset="night" />
                  <EffectComposer>
                    <Bloom intensity={isThreat ? 1.5 : 0.8} luminanceThreshold={0.1} luminanceSmoothing={0.9} radius={0.8} />
                  </EffectComposer>
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
                </Suspense>
              </Canvas>
              <div className={`absolute bottom-4 left-4 right-4 z-10 p-3 rounded-lg backdrop-blur-md border ${isThreat ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <p className={`text-xs font-mono ${isThreat ? 'text-red-400' : 'text-gray-400'}`}>
                  {isThreat ? "ALERT: Data leak attempt detected!" : "Status: Optimal. Scanning traffic..."}
                </p>
              </div>
            </div>

            {/* Scanner & Logs */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Input Area */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Prompt Scanner</h3>
                <div className="flex flex-col gap-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="Test an employee prompt... e.g., 'My API key is sk-12345...' or 'import fastapi'"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                  />
                  <button
                    onClick={handleScan}
                    disabled={loading}
                    className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {loading ? "Scanning..." : "Execute Scan"}
                  </button>
                </div>

                {/* --- MASKED OUTPUT BOX --- */}
                {sanitizedPrompt && (
                  <div className="mt-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> Safe Output (Sent to AI)
                    </p>
                    <p className="text-sm font-mono text-green-300/80 break-all">
                      {sanitizedPrompt}
                    </p>
                  </div>
                )}

                {/* --- AI RESPONSE BOX --- */}
                {aiResponse && (
                  <div className="mt-4 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                    <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="h-3 w-3" /> AI Assistant Response
                    </p>
                    <p className="text-sm font-mono text-indigo-300/80 break-words whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  </div>
                )}
              </div>

              {/* Logs Table (Database Driven) */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex-1 overflow-hidden flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Live Threat Logs (Database History)</h3>
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {dbLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-700 text-sm font-mono">Awaiting input data...</p>
                    </div>
                  ) : (
                    dbLogs.map((log) => (
                      <div key={log.id} className={`text-xs font-mono p-3 rounded-lg flex items-center gap-3 border ${log.blocked ? 'bg-red-500/5 border-red-500/20 text-red-400' : log.action_taken.includes('Error') ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' : 'bg-green-500/5 border-green-500/20 text-green-400'}`}>
                        <span className="text-gray-600">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-gray-500">User: {log.user_id}</span>
                        {log.blocked ? `🚨 BLOCKED: ${log.action_taken}` : `✅ PASSED: ${log.action_taken}`}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}