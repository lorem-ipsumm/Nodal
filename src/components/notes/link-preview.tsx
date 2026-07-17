import { useEffect, useState } from "react";
import type { Tweet } from "react-tweet/api";

interface OGData {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

const ogCache = new Map<string, OGData | null>();
const tweetCache = new Map<string, Tweet | null>();

const isTwitterUrl = (url: string): boolean =>
  /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url);

const extractTweetId = (url: string): string | null => {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
};

const formatTweetDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const resolveTweetText = (tweet: Tweet): string => {
  let text = tweet.text;
  const urls = tweet.entities?.urls ?? [];
  for (const urlEntity of urls) {
    text = text.replace(urlEntity.url, urlEntity.display_url);
  }
  const mediaUrls = tweet.entities?.media ?? [];
  for (const mediaEntity of mediaUrls) {
    text = text.replace(mediaEntity.url, "").trim();
  }
  return text.trim();
};

const XLogo = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-3.5 w-3.5 fill-current"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TweetPreview = ({ href }: { href: string }) => {
  const tweetId = extractTweetId(href);

  const [tweet, setTweet] = useState<Tweet | null | undefined>(() => {
    if (!tweetId) return null;
    return tweetCache.has(tweetId)
      ? (tweetCache.get(tweetId) ?? null)
      : undefined;
  });

  useEffect(() => {
    if (!tweetId) return;
    if (tweetCache.has(tweetId)) {
      setTweet(tweetCache.get(tweetId) ?? null);
      return;
    }
    window.ipcRenderer
      .invoke("fetch-tweet", tweetId)
      .then((data: Tweet | null) => {
        tweetCache.set(tweetId, data);
        setTweet(data);
      });
  }, [tweetId]);

  if (!tweetId || tweet === undefined) return null;
  if (tweet === null) return null;

  const displayText = resolveTweetText(tweet);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.ipcRenderer.invoke("open-external", href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          window.ipcRenderer.invoke("open-external", href);
      }}
      className="not-prose mt-2 flex max-w-sm cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-card/80"
    >
      {/* Header: avatar + name + X logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={tweet.user.profile_image_url_https}
            alt={tweet.user.name}
            className="h-8 w-8 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-tight text-foreground">
              {tweet.user.name}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              @{tweet.user.screen_name}
            </span>
          </div>
        </div>
        <span className="text-muted-foreground/60">
          <XLogo />
        </span>
      </div>

      {/* Tweet text */}
      <p className="text-xs leading-relaxed text-foreground">{displayText}</p>

      {/* Timestamp */}
      <p className="text-[10px] text-muted-foreground/70">
        {formatTweetDate(tweet.created_at)}
      </p>
    </div>
  );
};

const OGPreview = ({ href }: { href: string }) => {
  const [data, setData] = useState<OGData | null | undefined>(() =>
    ogCache.has(href) ? (ogCache.get(href) ?? null) : undefined,
  );

  useEffect(() => {
    if (ogCache.has(href)) {
      setData(ogCache.get(href) ?? null);
      return;
    }
    window.ipcRenderer
      .invoke("fetch-og", href)
      .then((result: OGData | null) => {
        ogCache.set(href, result);
        setData(result);
      });
  }, [href]);

  if (data === undefined || data === null) return null;
  if (!data.title && !data.description && !data.image) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.ipcRenderer.invoke("open-external", href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          window.ipcRenderer.invoke("open-external", href);
      }}
      data-cuelume-press="bloom"
      className="not-prose mt-2 flex max-w-sm cursor-pointer flex-col overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/50 group"
    >
      {data.image && (
        <img
          src={data.image}
          alt=""
          className="h-36 w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-3">
        {data.siteName && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {data.siteName}
          </p>
        )}
        {data.title && (
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors">
            {data.title}
          </p>
        )}
        {data.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {data.description}
          </p>
        )}
        <p className="mt-2 truncate text-[10px] text-muted-foreground/60">
          {href}
        </p>
      </div>
    </div>
  );
};

export const LinkPreview = ({ href }: { href: string }) => {
  if (!href) return null;
  if (isTwitterUrl(href)) return <TweetPreview href={href} />;
  return <OGPreview href={href} />;
};
