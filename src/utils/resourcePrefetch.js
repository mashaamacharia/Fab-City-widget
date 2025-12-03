/**
 * Resource Prefetching Utility
 * Prefetches DNS and establishes connections for resources to speed up loading
 */

// Cache of prefetched domains to avoid duplicate prefetching
const prefetchedDomains = new Set();

/**
 * Extract domain from URL
 */
const getDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
};

/**
 * Prefetch DNS and preconnect to a URL
 * This speeds up resource loading by establishing connections early
 */
export const prefetchResource = (url) => {
  if (!url) return;

  const domain = getDomain(url);
  if (!domain || prefetchedDomains.has(domain)) {
    return; // Already prefetched
  }

  prefetchedDomains.add(domain);

  // DNS prefetch - resolves DNS early
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = `https://${domain}`;
  document.head.appendChild(dnsPrefetch);

  // Preconnect - establishes connection early (DNS + TCP + TLS)
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = `https://${domain}`;
  preconnect.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect);

  // For YouTube, also prefetch the embed domain
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    if (!prefetchedDomains.has('www.youtube.com')) {
      prefetchedDomains.add('www.youtube.com');
      const youtubeDNS = document.createElement('link');
      youtubeDNS.rel = 'dns-prefetch';
      youtubeDNS.href = 'https://www.youtube.com';
      document.head.appendChild(youtubeDNS);

      const youtubePreconnect = document.createElement('link');
      youtubePreconnect.rel = 'preconnect';
      youtubePreconnect.href = 'https://www.youtube.com';
      youtubePreconnect.crossOrigin = 'anonymous';
      document.head.appendChild(youtubePreconnect);
    }
  }
};

/**
 * Extract URLs from text (markdown links, plain URLs)
 */
export const extractUrlsFromText = (text) => {
  const urls = [];
  
  // Match markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    urls.push(match[2]);
  }

  // Match plain URLs
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }

  return urls;
};

/**
 * Prefetch all URLs found in a message
 */
export const prefetchMessageUrls = (messageText) => {
  if (!messageText) return;
  
  const urls = extractUrlsFromText(messageText);
  urls.forEach(url => {
    try {
      prefetchResource(url);
    } catch (e) {
      // Silently fail for invalid URLs
    }
  });
};


