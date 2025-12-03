/**
 * URL Transformation Utility
 * Transforms URLs to optimize them for embedding in iframes
 */

/**
 * Check if a URL is a Google Drive/Docs/Sheets/Slides link
 */
const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname.includes('drive.google.com') ||
      hostname.includes('docs.google.com') ||
      hostname.includes('sheets.google.com') ||
      hostname.includes('slides.google.com')
    );
  } catch (e) {
    return false;
  }
};

/**
 * Extract Google Drive file ID from various URL formats
 * Google Drive file IDs are typically 33 characters but can vary (19-33 chars)
 * They contain: a-z, A-Z, 0-9, -, _
 */
const extractGoogleDriveFileId = (url) => {
  if (!url) return null;
  
  // Pattern 1: /file/d/FILE_ID/view, /file/d/FILE_ID/edit, /file/d/FILE_ID/preview
  // Match file ID between /file/d/ and the next / or end of path
  let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]{19,50})(?:\/|$|\?|#)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Pattern 2: /open?id=FILE_ID (shared link format)
  match = url.match(/[?&]id=([a-zA-Z0-9_-]{19,50})(?:&|$|#)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Pattern 3: /d/FILE_ID/ (shortened format, often used in shared links)
  match = url.match(/\/d\/([a-zA-Z0-9_-]{19,50})(?:\/|$|\?|#)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Pattern 4: /uc?export=download&id=FILE_ID or /uc?id=FILE_ID
  match = url.match(/\/uc\?[^&]*[&]?id=([a-zA-Z0-9_-]{19,50})(?:&|$|#)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Pattern 5: More flexible pattern - catch file IDs in various contexts
  // This is a fallback that looks for the typical Google Drive ID pattern
  match = url.match(/(?:file\/d\/|id=|d\/|folders\/)([a-zA-Z0-9_-]{19,50})(?:\/|$|\?|&|#)/);
  if (match && match[1]) {
    // Validate it's not a folder ID (folders are usually longer and have different structure)
    // But we'll accept it anyway as the preview endpoint should handle it
    return match[1];
  }
  
  return null;
};

/**
 * Extract Google Docs/Sheets/Slides document ID
 */
const extractGoogleDocId = (url, type) => {
  if (!url) return null;
  
  const patterns = {
    document: /\/document\/d\/([a-zA-Z0-9_-]+)/,
    spreadsheet: /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    presentation: /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
  };
  
  const pattern = patterns[type];
  if (pattern) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Transform Google Drive/Docs/Sheets/Slides URLs to embeddable format
 */
const transformGoogleUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    
    // Google Docs - check first as it's more specific
    if (hostname.includes('docs.google.com') && pathname.includes('/document/d/')) {
      const docId = extractGoogleDocId(url, 'document');
      if (docId) {
        // Always normalize to the Drive preview endpoint for consistency
        return `https://drive.google.com/file/d/${docId}/preview`;
      }
    }
    
    // Google Sheets
    if (hostname.includes('docs.google.com') && pathname.includes('/spreadsheets/d/')) {
      const sheetId = extractGoogleDocId(url, 'spreadsheet');
      if (sheetId) {
        return `https://drive.google.com/file/d/${sheetId}/preview`;
      }
    }
    
    // Google Slides
    if (hostname.includes('docs.google.com') && pathname.includes('/presentation/d/')) {
      const slideId = extractGoogleDocId(url, 'presentation');
      if (slideId) {
        return `https://drive.google.com/file/d/${slideId}/preview`;
      }
    }
    
    // Google Drive files - handle all formats
    if (hostname.includes('drive.google.com')) {
      // Try to extract file ID from any format
      const fileId = extractGoogleDriveFileId(url);
      
      if (fileId) {
        // Always convert to preview format for embedding
        // The /preview endpoint is specifically designed for iframe embedding
        // Remove any query parameters that might interfere with embedding
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      
      // Fallback: if URL contains /view, /edit, or /share, replace with /preview
      if (pathname.includes('/view') || pathname.includes('/edit') || pathname.includes('/share')) {
        const cleanUrl = url.replace(/\/(view|edit|share)(\/|$|\?)/, '/preview$2');
        // Remove query parameters that might prevent embedding
        try {
          const cleanUrlObj = new URL(cleanUrl);
          // Keep only essential parameters, remove sharing/usp parameters
          cleanUrlObj.searchParams.delete('usp');
          cleanUrlObj.searchParams.delete('usp=sharing');
          return cleanUrlObj.toString();
        } catch (e) {
          return cleanUrl;
        }
      }
      
      // Handle /open format specifically
      if (pathname === '/open' || pathname.includes('/open')) {
        const fileId = searchParams.get('id') || extractGoogleDriveFileId(url);
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
    }
    
    // For docs.google.com with /open format
    if (hostname.includes('docs.google.com')) {
      const fileId = searchParams.get('id') || extractGoogleDriveFileId(url);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // If URL already contains /preview, return as-is (but clean up query params)
    if (pathname.includes('/preview')) {
      // Remove unnecessary query parameters that might interfere with embedding
      const cleanUrl = new URL(url);
      cleanUrl.searchParams.delete('usp');
      cleanUrl.searchParams.delete('usp=sharing');
      return cleanUrl.toString();
    }
    
    // Last resort: try to find any file ID pattern and convert
    const anyFileId = extractGoogleDriveFileId(url);
    if (anyFileId) {
      return `https://drive.google.com/file/d/${anyFileId}/preview`;
    }
    
    // If no transformation possible, return original
    return url;
  } catch (e) {
    console.warn('Error transforming Google URL:', e, url);
    return url;
  }
};

/**
 * Check if a URL is a YouTube link
 */
const isYouTubeUrl = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('m.youtube.com')
    );
  } catch (e) {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
  }
};

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
const extractYouTubeId = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short links
    if (urlObj.hostname.includes('youtu.be')) {
      const id = urlObj.pathname.slice(1).split('?')[0];
      if (id && id.length === 11) return id;
    }
    
    // Handle youtube.com/watch?v=ID
    if (urlObj.searchParams.has('v')) {
      const id = urlObj.searchParams.get('v');
      if (id && id.length === 11) return id;
    }
    
    // Handle youtube.com/embed/ID
    if (urlObj.pathname.includes('/embed/')) {
      const match = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
    
    // Handle youtube.com/v/ID
    if (urlObj.pathname.includes('/v/')) {
      const match = urlObj.pathname.match(/\/v\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
    
    // Fallback: regex pattern matching
    const patterns = [
      /(?:v=|\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    
    return null;
  } catch (e) {
    // Final fallback: try regex on the raw string
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match && match[1] ? match[1] : null;
  }
};

/**
 * Transform YouTube URLs to embed format
 */
const transformYouTubeUrl = (url) => {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  }
  return url;
};

/**
 * Check if a URL is a PDF file
 * Excludes Google Drive URLs as they need special handling
 */
const isPdfUrl = (url) => {
  if (!url) return false;
  
  // Don't treat Google Drive URLs as PDFs - they need special transformation
  if (isGoogleDriveUrl(url)) {
    return false;
  }
  
  const urlLower = url.toLowerCase();
  return /\.pdf(\?|#|$)/i.test(urlLower);
};

/**
 * Transform URL for optimal iframe embedding
 * 
 * @param {string} url - The original URL
 * @returns {string} - The transformed URL optimized for embedding
 */
export const transformUrlForEmbedding = (url) => {
  if (!url) return url;
  
  // Google Drive/Docs/Sheets/Slides
  if (isGoogleDriveUrl(url)) {
    return transformGoogleUrl(url);
  }
  
  // YouTube
  if (isYouTubeUrl(url)) {
    return transformYouTubeUrl(url);
  }
  
  // PDFs and other URLs don't need transformation
  return url;
};

/**
 * Check if URL is a PDF
 */
export const isPdf = (url) => {
  return isPdfUrl(url);
};

/**
 * Check if URL is a YouTube link
 */
export const isYouTube = (url) => {
  return isYouTubeUrl(url);
};

/**
 * Check if URL is a Google Drive/Docs/Sheets/Slides link
 */
export const isGoogleDrive = (url) => {
  return isGoogleDriveUrl(url);
};

/**
 * Truncate URL for display purposes
 */
export const truncateUrl = (url, maxLength = 60) => {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // If hostname + short pathname fits, use it
    if ((hostname + pathname).length <= maxLength) {
      return hostname + pathname;
    }
    
    // Otherwise truncate with ellipsis
    return url.substring(0, maxLength - 3) + '...';
  } catch (e) {
    // If URL parsing fails, just truncate the string
    return url.substring(0, maxLength - 3) + '...';
  }
};

