import ChatBot from "@/components/ChatBot";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTopHeadlines, getCategoryColor } from "@/lib/api";
import { useBookmarks } from "@/lib/bookmarks-context";
import { useReadingHistory } from "@/lib/use-reading-history";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Tag,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Clock,
  Layers,
  Minus,
  Plus,
  Mail,
  MessageSquare,
} from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/* ─── Inline SVG brand icons ─── */
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942.0209-.0414.0021-.0908-.0218-.1258-.4819-.1822-.9408-.4037-1.3848-.6583a.0824.0824 0 01-.0077-.1348c.0858-.0688.1717-.1405.2536-.2065a.0757.0757 0 01.0787-.0106c2.9087 1.3282 6.0566 1.3282 8.9256 0a.0757.0757 0 01.0787.0105c.0819.0661.1678.1378.2538.2066a.0824.0824 0 01-.0077.1348 13.2908 13.2908 0 01-1.3857.6583.0756.0756 0 00-.0218.1258c.3534.6989.7651 1.3636 1.226 1.9942a.0767.0767 0 00.0841.0276c1.9615-.607 3.9501-1.5222 6.003-3.0294a.077.077 0 00.0313-.0561c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const MIN_FONT = 13;
const MAX_FONT = 21;

const ArticlePage = () => {
  const { id } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(() => {
    try { return Number(localStorage.getItem("newshub_fontsize")) || 15; }
    catch { return 15; }
  });

  const category = id?.includes("_") ? id.split("_")[0] : "technology";

  const { data: articles, isLoading } = useQuery({
    queryKey: ["top-headlines", category],
    queryFn: () => fetchTopHeadlines(category),
    staleTime: 5 * 60 * 1000,
  });

  const article = articles?.find((a) => a.id === id);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addToHistory } = useReadingHistory();
  const bookmarked = article ? isBookmarked(article.id) : false;

  const related = articles ? articles.filter((a) => a.id !== id).slice(0, 3) : [];

  // Track reading history once article is loaded
  useEffect(() => {
    if (article) addToHistory(article);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  // Persist font size
  useEffect(() => {
    try { localStorage.setItem("newshub_fontsize", String(fontSize)); } catch {}
  }, [fontSize]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const adjustFont = (delta: number) =>
    setFontSize((prev) => Math.min(MAX_FONT, Math.max(MIN_FONT, prev + delta)));

  const handleBookmark = () => {
    if (!article) return;
    const was = isBookmarked(article.id);
    toggleBookmark(article);
    if (was) {
      toast("Removed from saved articles", { icon: "🗑️", duration: 2000 });
    } else {
      toast.success("Article saved!", { description: "Find it in the Saved tab anytime", duration: 2500 });
    }
  };

  const copyForPlatform = async (platform: string) => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(article.externalUrl);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2500);
      toast.success("Link copied!", {
        description: `Paste it into ${platform} to share`,
        duration: 3000,
      });
    } catch { /* clipboard unavailable */ }
  };

  const handleShare = async () => {
    const url = article?.externalUrl ?? window.location.href;
    const title = article?.title ?? "NewsHub article";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard!");
      }
    } catch { /* user cancelled */ }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Article not found.</p>
          <Link to="/" className="text-sm text-primary hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.date), { addSuffix: true });
  const isNew = differenceInHours(new Date(), new Date(article.date)) < 3;
  const paragraphs = article.fullSummary.split("\n\n").filter(Boolean);
  const wordCount = (article.fullSummary || article.summary).trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const badgeColor = getCategoryColor(article.category);

  const shareUrl = encodeURIComponent(article.externalUrl);
  const shareTitle = encodeURIComponent(article.title);

  type SocialPlatform = {
    name: string;
    icon: React.ReactNode;
    href: string | null;
    onClick?: () => void;
    hover: string;
  };

  const socialPlatforms: SocialPlatform[] = [
    { name: "Twitter / X", icon: <XIcon />,         href: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,           hover: "hover:border-zinc-600 hover:bg-zinc-800 hover:text-white" },
    { name: "Facebook",    icon: <FacebookIcon />,   href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,                      hover: "hover:border-blue-700 hover:bg-blue-700 hover:text-white" },
    { name: "LinkedIn",    icon: <LinkedInIcon />,   href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,               hover: "hover:border-blue-500 hover:bg-blue-600 hover:text-white" },
    { name: "WhatsApp",    icon: <WhatsAppIcon />,   href: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,                               hover: "hover:border-green-500 hover:bg-green-500 hover:text-white" },
    { name: "Reddit",      icon: <RedditIcon />,     href: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,             hover: "hover:border-orange-500 hover:bg-orange-500 hover:text-white" },
    { name: "Discord",     icon: <DiscordIcon />,    href: null, onClick: () => copyForPlatform("Discord"),                                  hover: "hover:border-indigo-500 hover:bg-indigo-600 hover:text-white" },
    { name: "Instagram",   icon: <InstagramIcon />,  href: null, onClick: () => copyForPlatform("Instagram"),                               hover: "hover:border-pink-500 hover:bg-pink-600 hover:text-white" },
    { name: "Email",       icon: <Mail className="h-3.5 w-3.5" />,         href: `mailto:?subject=${shareTitle}&body=${shareUrl}`,          hover: "hover:border-sky-500 hover:bg-sky-600 hover:text-white" },
    { name: "Messages",    icon: <MessageSquare className="h-3.5 w-3.5" />, href: `sms:?body=${shareTitle}%20${shareUrl}`,                  hover: "hover:border-emerald-500 hover:bg-emerald-500 hover:text-white" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-primary transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={16} />
            Back to NewsHub
          </Link>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full ${badgeColor} px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white`}>
              <Tag size={11} />
              {article.category}
            </span>
            {isNew && (
              <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">New</span>
            )}
            <button onClick={handleShare} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all duration-200 ${copied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
              {copied ? <><Check size={11} /> Copied!</> : <><Share2 size={11} /> Share</>}
            </button>
            <button onClick={handleBookmark} className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${bookmarked ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-secondary/50 text-muted-foreground hover:text-foreground"}`} title={bookmarked ? "Remove bookmark" : "Bookmark article"}>
              {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>
        </div>
      </header>

      <motion.main
        className="mx-auto max-w-3xl px-5 py-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Thumbnail */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <img src={article.thumbnail} alt={article.title} className="h-64 w-full object-cover sm:h-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-border/60 pb-6">
          <img
            src={article.publisherLogo}
            alt={article.publisher}
            className="h-9 w-9 rounded-full border border-border/60 flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://img.icons8.com/color/48/news.png"; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{article.publisher}</p>
            <p className="text-xs text-muted-foreground">By {article.author} · {timeAgo}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground flex-shrink-0">
            <Clock size={12} />
            {readingTime} min read
          </div>

          {/* Font size controls */}
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-1 py-1">
            <button
              onClick={() => adjustFont(-1)}
              disabled={fontSize <= MIN_FONT}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-30"
              title="Decrease font size"
            >
              <Minus size={11} />
            </button>
            <span className="min-w-[28px] text-center text-[11px] font-semibold text-muted-foreground tabular-nums">
              {fontSize}
            </span>
            <button
              onClick={() => adjustFont(1)}
              disabled={fontSize >= MAX_FONT}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-30"
              title="Increase font size"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

        {/* Article body */}
        <div className="mb-10 space-y-5" style={{ fontSize: `${fontSize}px` }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
            ))
          ) : (
            <p className="leading-relaxed text-muted-foreground">{article.summary}</p>
          )}
        </div>

        {/* Primary action row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <a href={article.externalUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 hover:brightness-110">
            Read Full Article <ExternalLink size={15} />
          </a>
          <button onClick={handleShare}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${copied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border/60 bg-secondary/40 text-foreground hover:border-border hover:bg-secondary"}`}>
            {copied ? <><Check size={15} /> Link Copied!</> : <><Share2 size={15} /> Share</>}
          </button>
          <button onClick={handleBookmark}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all ${bookmarked ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-secondary/40 text-foreground hover:border-border hover:bg-secondary"}`}>
            {bookmarked ? <><BookmarkCheck size={15} /> Saved</> : <><Bookmark size={15} /> Save</>}
          </button>
        </div>

        {/* Social share */}
        <div className="mb-12 rounded-xl border border-border/60 bg-card/50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Share this story
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {socialPlatforms.map((platform) => {
              const isCopied = copiedPlatform === platform.name;
              const sharedClass = `inline-flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 w-full ${platform.hover}`;
              return platform.href ? (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sharedClass}
                >
                  {platform.icon}
                  <span className="truncate">{platform.name}</span>
                </a>
              ) : (
                <button
                  key={platform.name}
                  onClick={platform.onClick}
                  className={`${sharedClass} ${isCopied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : ""}`}
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : platform.icon}
                  <span className="truncate">{isCopied ? "Copied!" : platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="border-t border-border/60 pt-10">
            <div className="mb-6 flex items-center gap-3">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                More in {article.category}
              </h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel, i) => (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <NewsCard article={rel} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.main>

      <ChatBot articleTitle={article.title} />
    </div>
  );
};

export default ArticlePage;
