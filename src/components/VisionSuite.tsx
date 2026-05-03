import { useState, useRef } from "react";
import { Upload, FileSearch, Trash2, Loader2, Image as ImageIcon, Send, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { analyzeImage } from "../lib/gemini";

export default function VisionSuite() {
  const [image, setImage] = useState<{ base64: string; type: string } | null>(null);
  const [analysis, setAnalysis] = useState<{ role: string; text: string }[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          base64: (reader.result as string).split(",")[1],
          type: file.type
        });
        setAnalysis([]); // Clear previous analysis when new image uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !prompt.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    const currentPrompt = prompt;
    setPrompt("");
    
    // Add user query to history
    setAnalysis(prev => [...prev, { role: "user", text: currentPrompt }]);

    try {
      const response = await analyzeImage(currentPrompt, image.base64, image.type);
      setAnalysis(prev => [...prev, { role: "model", text: response || "Analysis complete but no description returned." }]);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis(prev => [...prev, { role: "model", text: "Critical failure in vision processing node." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0a0a0c]">
      {/* Left Column: Image Insight */}
      <div className="w-1/2 border-r border-white/5 flex flex-col p-8 bg-[#0d0d0f]/20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSearch className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Vision Processor</h2>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Input_Source: // User_Buffer</p>
          </div>
          
          {image && (
            <button 
              onClick={() => { setImage(null); setAnalysis([]); }}
              className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-white/5 bg-white/[0.01] rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] hover:border-emerald-500/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-zinc-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-400 font-medium tracking-tight">Upload Visual Data</p>
              <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase">Drag and drop or click to initialize</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload} 
              />
            </div>
          ) : (
            <div className="flex-1 relative rounded-3xl overflow-hidden group border border-white/10 shadow-2xl bg-[#000]">
              <img 
                src={`data:${image.type};base64,${image.base64}`} 
                className="w-full h-full object-contain" 
                alt="Upload preview"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded bg-black/60 backdrop-blur-sm border border-emerald-500/20">
                  <span className="text-[10px] font-mono text-emerald-400">STATUS: // LOADED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interaction Hub */}
      <div className="flex-1 flex flex-col bg-[#0a0a0c]">
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-6">
          {analysis.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto">
              <Cpu className="w-10 h-10 text-emerald-500/20 mb-4" />
              <p className="text-zinc-600 text-xs leading-relaxed uppercase tracking-widest font-mono">
                Neural link initialized. Please provide an inquiry regarding the loaded visual matrix.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {analysis.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                   <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white font-medium" 
                      : "bg-white/5 border border-white/10 text-zinc-300 markdown-body"
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                    <span className="text-[10px] uppercase font-mono text-zinc-500">Processing Pixels...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-8 border-t border-white/5 bg-[#0d0d0f]/40 backdrop-blur-md">
          <div className="relative flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder={image ? "Ex: What's in this image? or Describe the style..." : "Upload an image to start..."}
              disabled={!image || isAnalyzing}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-30"
            />
            <button
              onClick={handleAnalyze}
              disabled={!image || !prompt.trim() || isAnalyzing}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 p-3 rounded-xl transition-all"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[9px] text-center text-zinc-800 mt-4 font-mono tracking-[0.2em]">
            SYSTEM: // VISION_CORE_INIT // READY
          </p>
        </div>
      </div>
    </div>
  );
}
