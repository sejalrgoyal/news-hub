import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { sendChatMessage, ConversationMessage } from "@/lib/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

/** Lightweight inline markdown renderer for chat bubbles */
function MarkdownText({ text }: { text: string }) {
  function parseLine(line: string): React.ReactNode {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (/^[-*•]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(<li key={i}>{parseLine(lines[i].replace(/^[-*•]\s+/, ""))}</li>);
        i++;
      }
      elements.push(<ul key={`ul${i}`} className="list-disc pl-4 my-1 space-y-0.5">{items}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(<li key={i}>{parseLine(lines[i].replace(/^\d+\.\s+/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol${i}`} className="list-decimal pl-4 my-1 space-y-0.5">{items}</ol>);
      continue;
    }

    elements.push(<p key={i}>{parseLine(line)}</p>);
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

const ChatBot = ({ articleTitle }: { articleTitle: string }) => {
  const makeGreeting = (title: string): Message => ({
    id: 1,
    text: `Hi! Ask me anything about "${title}".`,
    sender: "bot",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([makeGreeting(articleTitle)]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when the article changes
  useEffect(() => {
    setMessages([makeGreeting(articleTitle)]);
    setInput("");
  }, [articleTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now(), text: userText, sender: "user" };

    // Capture history (skip the greeting, keep all real exchanges)
    const history: ConversationMessage[] = messages
      .slice(1)
      .map((m) => ({ role: m.sender === "user" ? "user" : "bot", text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(articleTitle, userText, history);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: reply, sender: "bot" },
      ]);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const text = raw.toLowerCase().includes("gemini_api_key")
        ? "The AI assistant isn't configured yet. Please add your GEMINI_API_KEY in Netlify → Site settings → Environment variables, then redeploy."
        : raw || "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text, sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-110"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 bg-primary px-4 py-3">
            <MessageCircle size={18} className="text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">Article Assistant</span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <MarkdownText text={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about this article…"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
