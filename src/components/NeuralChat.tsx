import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { streamChat, Message } from "../lib/gemini";

export default function NeuralChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMessage];
      let fullResponse = "";
      
      // Add a placeholder for the bot's response
      setMessages((prev) => [...prev, { role: "model", parts: [{ text: "" }] }]);

      const stream = streamChat(chatHistory);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "model",
            parts: [{ text: fullResponse }],
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Error connecting to neural network. Please check your connection." }] }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-10 space-y-8 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto aspect-square rounded-full border border-white/5 bg-white/[0.01]">
            <Bot className="w-12 h-12 text-blue-500 mb-4 opacity-50" />
            <h2 className="text-xl font-medium text-white mb-2">Neural Workspace</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Initiate a creative session. I am your neural assistant, ready to process, imagine, and resolve.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-zinc-800 border border-white/10" : "bg-blue-600/20 border border-blue-500/20"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
                </div>
                
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white/5 border border-white/10 text-zinc-300 rounded-tl-none markdown-body"
                }`}>
                  {msg.parts[0].text ? (
                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  ) : (isTyping && i === messages.length - 1 ? (
                    <div className="flex gap-1 py-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    </div>
                  ) : "")}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a0c]">
        <div className="max-w-4xl mx-auto flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Query neural network..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all transition-duration-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isTyping && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
              <Sparkles className="w-3 h-3 text-blue-500/30" />
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setMessages([])}
            className="p-3 rounded-xl border border-white/5 hover:bg-white/5 text-zinc-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-700 mt-4 font-mono uppercase tracking-widest">
          SYSTEM_ID // GEMINI_3_FLASH // BROADCAST_STABLE
        </p>
      </div>
    </div>
  );
}
