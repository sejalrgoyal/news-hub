/** Full Tailwind class strings — must be static so JIT includes them in the build */
const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  technology: "bg-blue-500/90",
  business: "bg-emerald-500/90",
  health: "bg-rose-500/90",
  science: "bg-violet-500/90",
  sports: "bg-amber-500/90",
  entertainment: "bg-fuchsia-500/90",
  general: "bg-slate-500/90",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_BADGE_CLASSES[category.toLowerCase()] ?? "bg-primary/90";
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  fullSummary: string;
  author: string;
  publisher: string;
  publisherLogo: string;
  thumbnail: string;
  date: string;
  category: string;
  externalUrl: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  technology: "Technology",
  business: "Business",
  health: "Health",
  science: "Science",
  sports: "Sports",
  entertainment: "Entertainment",
};

function mapArticle(
  raw: Record<string, unknown>,
  index: number,
  category: string
): Article {
  const source = (raw.source as Record<string, string>) ?? {};
  const url = (raw.url as string) ?? "#";

  return {
    id: `${category}_${index}`,
    title: (raw.title as string) || "Untitled",
    summary: (raw.description as string) || "",
    fullSummary: (raw.content as string) || (raw.description as string) || "",
    author: (raw.author as string) || source.name || "Unknown",
    publisher: source.name || "Unknown",
    publisherLogo:
      url !== "#"
        ? `https://www.google.com/s2/favicons?sz=48&domain=${new URL(url).hostname}`
        : "https://img.icons8.com/color/48/news.png",
    thumbnail: (raw.urlToImage as string) || FALLBACK_THUMBNAIL,
    date: (raw.publishedAt as string) || new Date().toISOString(),
    category: CATEGORY_LABELS[category] ?? category,
    externalUrl: url,
  };
}

export async function fetchTopHeadlines(
  category: string = "technology"
): Promise<Article[]> {
  const res = await fetch(
    `${API_BASE}/api/news/top-headlines?country=us&category=${category}&pageSize=12`
  );
  if (!res.ok) throw new Error("Failed to fetch news");
  const data = await res.json();
  return ((data.articles as Record<string, unknown>[]) || [])
    .filter((a) => a.title && a.title !== "[Removed]" && a.urlToImage)
    .map((a, i) => mapArticle(a, i, category));
}

export interface ConversationMessage {
  role: "user" | "bot";
  text: string;
}

export async function sendChatMessage(
  articleTitle: string,
  userMessage: string,
  history: ConversationMessage[] = []
): Promise<string> {
  const historyLines = history
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = [
    `You are a helpful news article assistant. The user is reading an article titled: "${articleTitle}".`,
    `Always keep your answers relevant to this article and topic.`,
    historyLines
      ? `\nConversation so far:\n${historyLines}`
      : "",
    `\nNow respond to the following:\nUser: ${userMessage}`,
    `\nBe clear and concise (2–4 sentences). Use the conversation history above for context when answering follow-up questions.`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`${API_BASE}/api/gemini/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    let serverMsg = "Failed to get AI response";
    try {
      const errData = await res.json();
      if (errData.error) serverMsg = errData.error;
    } catch { /* ignore parse errors */ }
    throw new Error(serverMsg);
  }

  const data = await res.json();
  return (data.reply as string) || "Sorry, I could not generate a response.";
}
