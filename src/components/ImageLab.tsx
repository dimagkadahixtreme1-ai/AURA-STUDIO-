import { useState } from "react";
import { Download, Image as ImageIcon, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateImage } from "../lib/gemini";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function ImageLab() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt);
      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: imageUrl,
          prompt,
          timestamp: Date.now(),
        };
        setGallery((prev) => [newImage, ...prev]);
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stylePresets = [
    "Photorealistic", "Digital Art", "Cyberpunk", "Minimalist", "3D Render", "Anatomical"
  ];

  return (
    <div className="flex h-full bg-[#0a0a0c] overflow-hidden">
      {/* Left Panel: Generation Controls */}
      <div className="w-1/3 border-r border-white/5 flex flex-col p-8 bg-[#0d0d0f]/50 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold tracking-tight text-white uppercase">Generator Node</h2>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Translate concepts into high-fidelity visuals using neural synthesis.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Neural Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic megacity with neon lights and floating vehicles..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 h-40 resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Style Encoders</label>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((style) => (
                <button
                  key={style}
                  onClick={() => setPrompt((prev) => prev + (prev ? ", " : "") + style)}
                  className="px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-[11px] text-zinc-400 hover:text-white hover:border-purple-500/30 transition-all font-medium"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Asset</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-auto pt-8">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-[10px] text-purple-300 leading-normal font-medium">
              Pro Tip: Be specific with lighting and composition for ultra-realistic results.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Gallery */}
      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="px-3 py-1 rounded bg-white/5 border border-white/10">
            <span className="text-[10px] font-mono text-zinc-500">ASSET_OUTPUT // v2.5_FLASH</span>
          </div>
          {gallery.length > 0 && (
            <button 
              onClick={() => setGallery([])}
              className="text-[10px] text-zinc-600 hover:text-red-400 uppercase font-bold tracking-widest transition-colors"
            >
              Clear Buffer
            </button>
          )}
        </div>

        {gallery.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
            <ImageIcon className="w-16 h-16 text-zinc-600 mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Buffer Empty // Waiting for Synthesis</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {gallery.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-[10px] text-white font-medium line-clamp-2 mb-2 italic">"{img.prompt}"</p>
                    <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = img.url;
                            link.download = `aura-${img.id}.png`;
                            link.click();
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Selected Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl w-full flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.url} 
                className="w-full aspect-square object-contain rounded-2xl bg-black shadow-2xl border border-white/5" 
                alt="Enlarged view" 
                referrerPolicy="no-referrer"
              />
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <p className="text-sm text-zinc-300 leading-relaxed italic mb-4">"{selectedImage.prompt}"</p>
                <div className="flex items-center gap-4">
                  <a 
                    href={selectedImage.url} 
                    download={`aura-${selectedImage.id}.png`}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD FULL RESOLUTION
                  </a>
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-auto">
                    ID // {selectedImage.id.toUpperCase()} // TIMESTAMP // {new Date(selectedImage.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
