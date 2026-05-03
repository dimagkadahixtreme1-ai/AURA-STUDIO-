/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Eye, 
  Cpu, 
  Settings, 
  LayoutDashboard,
  Zap,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NeuralChat from "./components/NeuralChat";
import ImageLab from "./components/ImageLab";
import VisionSuite from "./components/VisionSuite";

type Tool = "chat" | "image" | "vision";

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>("chat");

  const navItems = [
    { id: "chat", icon: MessageSquare, label: "Neural Chat", color: "text-blue-400" },
    { id: "image", icon: ImageIcon, label: "Image Lab", color: "text-purple-400" },
    { id: "vision", icon: Eye, label: "Vision Suite", color: "text-emerald-400" },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-purple-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0d0d0f]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              AURA STUDIO
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Creative Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Capabilities</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTool(item.id as Tool)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                activeTool === item.id 
                  ? "bg-white/5 text-white" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              {activeTool === item.id && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/5 rounded-lg border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`w-4 h-4 ${activeTool === item.id ? item.color : "text-zinc-500"} transition-colors`} />
              <span className="relative z-10">{item.label}</span>
              {activeTool === item.id && (
                <Sparkles className="w-3 h-3 ml-auto text-yellow-500/50" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-zinc-400">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>Free Usage Active</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">Unlimited creative tools via Aura Intelligence.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Header Strip */}
        <header className="h-14 border-bottom border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">
              Session // {activeTool.toUpperCase()}_ENV
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=aura" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {activeTool === "chat" && <NeuralChat />}
              {activeTool === "image" && <ImageLab />}
              {activeTool === "vision" && <VisionSuite />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
