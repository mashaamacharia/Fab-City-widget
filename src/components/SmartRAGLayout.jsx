import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { prefetchResource } from '../utils/resourcePrefetch';
import { transformUrlForEmbedding, isPdf, isGoogleDrive } from '../utils/urlTransform';

/**
 * SmartRAGLayout - Modern RAG Chat Interface with Smart Split-View Layout
 * 
 * Features:
 * - Default: Split screen (50% chat, 50% resource viewer)
 * - Mobile: Stacked/tabbed view
 * - Full Screen: Resource viewer expands to 100% overlaying chat
 * - Smooth CSS transitions (0.3s ease)
 * - Two modes: Iframe (Mode A) and Fallback Card (Mode B)
 * 
 * Props:
 * - renderChat: function({ handleCitationClick }) => ReactNode
 *
 * Usage:
 * <SmartRAGLayout renderChat={({ handleCitationClick }) => <MyChat onCitation={handleCitationClick} />} />
 */
const isYouTubeUrl = (u) => {
  if (!u) return false;
  try {
    const url = new URL(u);
    const hostname = url.hostname.toLowerCase();
    return hostname.includes('youtube.com') || 
           hostname.includes('youtu.be') ||
           hostname.includes('m.youtube.com') ||
           hostname.includes('www.youtube.com');
  } catch (e) {
    // Fallback: check if URL string contains YouTube patterns
    const lowerUrl = u.toLowerCase();
    return lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
  }
};

const extractYouTubeId = (u) => {
  if (!u) return null;
  try {
    const url = new URL(u);
    
    // Handle youtu.be short links
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split('?')[0];
      if (id && id.length === 11) return id;
    }
    
    // Handle youtube.com/watch?v=ID
    if (url.searchParams.has('v')) {
      const id = url.searchParams.get('v');
      if (id && id.length === 11) return id;
    }
    
    // Handle youtube.com/embed/ID
    if (url.pathname.includes('/embed/')) {
      const match = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
    
    // Handle youtube.com/v/ID
    if (url.pathname.includes('/v/')) {
      const match = url.pathname.match(/\/v\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
    
    // Fallback: regex pattern matching
    const patterns = [
      /(?:v=|\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = u.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    
    return null;
  } catch (e) {
    // Final fallback: try regex on the raw string
    const match = u.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match && match[1] ? match[1] : null;
  }
};

const SmartRAGLayout = ({ renderChat }) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [resource, setResource] = useState({ url: '', type: 'iframe', title: '', originalUrl: '' });
  const [isMobile, setIsMobile] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmbed, setIsCheckingEmbed] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [popupOpened, setPopupOpened] = useState(false); // Track if popup was successfully opened
  const iframeLoadTimeoutRef = useRef(null);
  const iframeRef = useRef(null);
  const popupWindowRef = useRef(null); // Reference to popup window
  const loadedResourcesCache = useRef(new Set()); // Cache of successfully loaded resources

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-show viewer when resource URL is set (ensures viewer appears even if handleCitationClick doesn't set viewerVisible)
  useEffect(() => {
    if (resource.url && resource.url !== '') {
      setViewerVisible(true);
    }
  }, [resource.url]);

  // Simulated unsafe check: if url contains 'unsafe' treat unsafe
  // In production, this would come from backend
  const isUnsafe = (url) => url && (url.includes('unsafe') || url.includes('localhost') && url.includes('file://'));

  // Detect file type from URL
  const detectFileType = useCallback((targetUrl) => {
    if (!targetUrl) return 'web';
    const urlLower = targetUrl.toLowerCase();
    
    // PDF files
    if (/\.(pdf)(\?|#|$)/i.test(urlLower)) return 'pdf';
    
    // Image files
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|#|$)/i.test(urlLower)) return 'image';
    
    // Video files
    if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|#|$)/i.test(urlLower)) return 'video';
    
    // Office documents
    if (/\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp)(\?|#|$)/i.test(urlLower)) return 'office';
    
    // Text files
    if (/\.(txt|md|rtf)(\?|#|$)/i.test(urlLower)) return 'text';
    
    return 'web';
  }, []);

  const openExternal = useCallback(async (url) => {
    if (!url) return;
    const urlToOpen = resource.originalUrl || url;
    const fileType = detectFileType(urlToOpen);
    
    // For files that might download (PDFs, images, videos, office docs, text files),
    // try to fetch and create a blob URL to ensure they open in the browser
    const downloadableTypes = ['pdf', 'image', 'video', 'office', 'text'];
    
    if (downloadableTypes.includes(fileType)) {
      try {
        // Try to fetch the file and create a blob URL
        // This ensures the file opens in the browser rather than downloading
        // Default mode allows same-origin and CORS-enabled cross-origin requests
        const response = await fetch(urlToOpen, {
          method: 'GET',
        });
        
        if (response.ok && response.status === 200) {
          const blob = await response.blob();
          
          // Verify blob is not empty
          if (blob.size > 0) {
            const blobUrl = URL.createObjectURL(blob);
            
            // Open the blob URL in a new tab
            const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
            
            // Clean up the blob URL after a delay to allow the page to load
            if (newWindow) {
              // Wait longer for large files to load before revoking
              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
              }, 2000);
            } else {
              // If popup was blocked, revoke immediately
              URL.revokeObjectURL(blobUrl);
              // Fall back to direct opening
              window.open(urlToOpen, '_blank', 'noopener,noreferrer');
            }
            return; // Successfully opened blob URL
          }
        }
        
        // If response is not ok or blob is empty, fall through to fallback
        throw new Error('Response not ok or empty blob');
      } catch (error) {
        // If CORS fails, fetch fails, or blob is invalid, fall back to direct opening
        console.log('Could not fetch file for blob URL, opening directly:', error);
        // Use anchor element approach for better compatibility with file types
        const link = document.createElement('a');
        link.href = urlToOpen;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // For web pages and other types, use window.open
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }
  }, [resource.originalUrl, detectFileType]);

  // Check embeddability via backend API
  const checkEmbeddability = async (url) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/check-embed?url=${encodeURIComponent(url)}&type=web`);
      if (!response.ok) {
        console.warn('Embed check failed with status:', response.status);
        return { blocked: false }; // Default to allowed if check fails
      }
      return await response.json();
    } catch (e) {
      console.error('Embed check failed:', e);
      return { blocked: false }; // Default to allowed if check fails
    }
  };

  // Open resource in popup window (side panel style)
  const openInPopup = (urlToOpen) => {
    const popupWidth = 600;
    const popupHeight = window.screen.availHeight;
    const popupLeft = window.screen.availWidth - popupWidth;
    
    const popup = window.open(
      urlToOpen,
      'fabcity-resource-sidepanel',
      `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=0,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`
    );
    
    if (popup) {
      popupWindowRef.current = popup;
      setPopupOpened(true);
      return popup;
    }
    
    setPopupOpened(false);
    return null;
  };

  // Public handler to be used by chat to open citations
  const handleCitationClick = useCallback(async (url, citationText = '') => {
    if (!url) {
      console.warn('handleCitationClick called with empty URL');
      return;
    }

    console.log('handleCitationClick called with URL:', url, 'citationText:', citationText);
    const originalUrl = url;

    // Reset states immediately - CRITICAL: Set viewerVisible FIRST
    setViewerVisible(true);
    setIsFullScreen(false);
    setIframeError(false);
    setIsBlocked(false);
    setIsCheckingEmbed(true);
    setIsLoading(false);

    // Prefetch resource immediately for faster loading
    prefetchResource(url);

    // Normalize URLs (especially Google Drive) before embedding
    const transformedUrl = transformUrlForEmbedding(url);
    const isUrlTransformed = transformedUrl && transformedUrl !== url;

    if (isUrlTransformed) {
      prefetchResource(transformedUrl);
    }

    // Handle unsafe URLs
    if (isUnsafe(url)) {
      console.log('URL marked as unsafe, using fallback');
      setResource({ 
        url, 
        type: 'fallback', 
        title: citationText || url,
        originalUrl 
      });
      setIsCheckingEmbed(false);
      setIsLoading(false);
      return;
    }

    // Handle PDFs and Google Drive (always embeddable, skip check)
    if (isPdf(url) || isGoogleDrive(url)) {
      const baseUrl = isUrlTransformed ? transformedUrl : url;
      // For PDFs, use Google Docs Viewer if not already transformed
      let finalUrl = baseUrl;
      if (isPdf(url) && !baseUrl.includes('docs.google.com/viewer')) {
        finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      }
      
      const fragment = !isUrlTransformed && citationText ? `#:~:text=${encodeURIComponent(citationText)}` : '';
      const urlWithFragment = `${finalUrl}${fragment}`;
      console.log('PDF/Google Drive URL, setting as iframe:', urlWithFragment);
      setResource({ 
        url: urlWithFragment, 
        type: 'iframe', 
        title: citationText || url,
        originalUrl 
      });
      setIsCheckingEmbed(false);
      setIsLoading(true);
      return;
    }

    // For all URLs (including YouTube), transform first, then check embeddability via API
    // Transform URL immediately (YouTube watch URLs -> embed URLs, etc.)
    const urlToCheck = isUrlTransformed ? transformedUrl : url;
    
    try {
      const check = await checkEmbeddability(urlToCheck);
      
      if (check.blocked) {
        // Resource is blocked (security, size, or YouTube restrictions) - automatically open in side panel popup
        console.log('Resource is blocked from embedding, automatically opening in side panel popup');
        setIsBlocked(true);
        setPopupOpened(false); // Reset before opening
        // Automatically open in side panel popup window (stays within chatbot context)
        const popup = openInPopup(url);
        // Always show fallback card (whether popup opened or not)
        setResource({
          url,
          type: 'fallback',
          title: citationText || url,
          originalUrl
        });
        setIsCheckingEmbed(false);
        setIsLoading(false);
      } else {
        // Resource is embeddable - render iframe with transformed URL
        console.log('Resource is embeddable, rendering iframe');
        setIsBlocked(false);
        const baseUrl = isUrlTransformed ? transformedUrl : url;
        // Only append text fragments when pointing at the original document
        const fragment = !isUrlTransformed && citationText ? `#:~:text=${encodeURIComponent(citationText)}` : '';
        const urlWithFragment = `${baseUrl}${fragment}`;
        setResource({ 
          url: urlWithFragment, 
          type: 'iframe', 
          title: citationText || url,
          originalUrl 
        });
        setIsCheckingEmbed(false);
        setIsLoading(true); // Start iframe loading
      }
    } catch (error) {
      // On error, default to iframe (let browser handle it)
      console.error('Error checking embeddability:', error);
      setIsBlocked(false);
      const baseUrl = isUrlTransformed ? transformedUrl : url;
      const fragment = !isUrlTransformed && citationText ? `#:~:text=${encodeURIComponent(citationText)}` : '';
      const urlWithFragment = `${baseUrl}${fragment}`;
      setResource({ 
        url: urlWithFragment, 
        type: 'iframe', 
        title: citationText || url,
        originalUrl 
      });
      setIsCheckingEmbed(false);
      setIsLoading(true);
    }
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen((v) => !v);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setIsFullScreen(false);
    setIframeError(false);
    setPopupOpened(false);
    
    // Close popup window if open
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      try {
        popupWindowRef.current.close();
      } catch (e) {
        console.warn('Could not close popup on viewer close:', e);
      }
      popupWindowRef.current = null;
    }
    
    // Clear resource after transition completes for smooth animation
    setTimeout(() => {
      setResource({ url: '', type: 'iframe', title: '', originalUrl: '' });
    }, 350);
  };

  // Handle iframe load errors (connection refused, large files, etc.)
  const handleIframeError = () => {
    if (iframeLoadTimeoutRef.current) {
      clearTimeout(iframeLoadTimeoutRef.current);
      iframeLoadTimeoutRef.current = null;
    }
    setIframeError(true);
    setIsLoading(false);
    setIsBlocked(true);
    
    // Automatically open in side panel popup when iframe fails (likely too large or blocked)
    const urlToOpen = resource.originalUrl || resource.url;
    if (urlToOpen) {
      console.log('Iframe error detected, automatically opening in side panel popup');
      setPopupOpened(false); // Reset before opening
      const popup = openInPopup(urlToOpen);
      if (!popup) {
        // Popup blocked - will show fallback card below
        console.warn('Popup was blocked by browser');
      }
    }
    
    // Convert to fallback mode
    setResource(prev => ({
      ...prev,
      type: 'fallback'
    }));
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully:', resource.url);
    if (iframeLoadTimeoutRef.current) {
      clearTimeout(iframeLoadTimeoutRef.current);
      iframeLoadTimeoutRef.current = null;
    }
    setIframeError(false);
    setIsLoading(false);
    
    // Cache successfully loaded resource
    if (resource.url) {
      loadedResourcesCache.current.add(resource.originalUrl || resource.url);
    }
    
    // Give forms a bit more time to fully render after load event
    // Some forms (like Google Forms) may need additional time to initialize
    setTimeout(() => {
      // Check if iframe is still accessible and has content
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          if (iframeDoc && iframeDoc.body) {
            console.log('Iframe content verified, form should be visible');
          }
        } catch (e) {
          // Cross-origin - that's fine, resource is loading
          console.log('Cross-origin iframe, resource is loading');
        }
      }
    }, 1000); // Wait 1 second after load to ensure forms are fully rendered
  };

  // Note: Removed the blocking check that was too aggressive and preventing legitimate resources from loading
  // The timeout-based error detection is sufficient

  // Set up timeout for iframe loading (detect if it fails to load)
  useEffect(() => {
    if (resource.type === 'iframe' && resource.url && !iframeError && isLoading) {
      // Increased timeout to 20 seconds to give resources (especially forms) more time to load
      // Forms and complex resources may take longer to fully render
      iframeLoadTimeoutRef.current = setTimeout(() => {
        console.warn('Iframe taking too long to load, may have failed or be blocked');
        // If still loading after timeout, show error
        if (isLoading) {
          setIframeError(true);
          setIsLoading(false);
          setResource(prev => ({
            ...prev,
            type: 'fallback'
          }));
        }
      }, 20000); // 20 second timeout - increased to allow forms and complex resources to load
    }
    
    return () => {
      if (iframeLoadTimeoutRef.current) {
        clearTimeout(iframeLoadTimeoutRef.current);
        iframeLoadTimeoutRef.current = null;
      }
    };
  }, [resource.url, resource.type, iframeError, isLoading]);

  // Layout sizing logic with smooth transitions
  // Show split view if viewer is visible OR if there's a resource URL
  const hasResource = resource.url && resource.url !== '';
  const shouldShowViewer = viewerVisible || isFullScreen || hasResource;
  
  const leftWidth = shouldShowViewer ? (isFullScreen ? '0%' : '50%') : '100%';
  const rightWidth = shouldShowViewer ? (isFullScreen ? '100%' : '50%') : '0%';

  // Calculate heights for mobile
  const leftHeight = shouldShowViewer && isMobile ? (isFullScreen ? '0%' : '50%') : '100%';
  const rightHeight = shouldShowViewer && isMobile ? (isFullScreen ? '100%' : '50%') : '0%';

  return (
    <div className="w-full h-full relative bg-[#FDFBF7]">
      {/* Full screen backdrop overlay */}
      {isFullScreen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          style={{ transition: 'opacity 0.3s ease' }}
          onClick={toggleFullScreen}
        />
      )}
      
      <div 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full`}
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* LEFT - Chat */}
        <div
          className={`${isMobile ? 'order-1' : 'order-1'} h-full overflow-hidden`}
          style={{ 
            width: isMobile ? '100%' : leftWidth, 
            height: isMobile ? leftHeight : '100%',
            minWidth: isMobile ? '100%' : leftWidth,
            transition: 'all 0.3s ease',
            opacity: isFullScreen ? 0 : 1,
            pointerEvents: isFullScreen ? 'none' : 'auto',
            zIndex: isFullScreen ? 1 : 10
          }}
        >
          <div style={{ height: '100%', overflow: 'auto' }}>
            {typeof renderChat === 'function' ? renderChat({ handleCitationClick }) : (
              <div className="p-6">
                <h3 className="text-lg font-semibold">Chat</h3>
                <p className="text-sm text-gray-600">Pass a renderChat prop to render your chat and receive <code>handleCitationClick</code>.</p>
                <div className="mt-4">
                  <button
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => handleCitationClick('https://example.com/some-page', 'example highlight')}
                  >
                    Demo open example.com
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - Resource Viewer */}
        {/* Show viewer if explicitly visible, in fullscreen, OR if there's a resource URL */}
        {(viewerVisible || isFullScreen || (resource.url && resource.url !== '')) && (
          <div
            className={`${isMobile ? 'order-2' : 'order-2'} bg-white border-l border-gray-200 shadow-lg`}
            style={{
              width: isFullScreen ? 'calc(100% - 40px)' : (isMobile ? '100%' : rightWidth),
              height: isFullScreen ? 'calc(100vh - 40px)' : (isMobile ? rightHeight : '100%'),
              minWidth: isMobile ? '100%' : rightWidth,
              transition: 'all 0.3s ease',
              position: isFullScreen ? 'fixed' : 'relative',
              top: isFullScreen ? '20px' : 'auto',
              left: isFullScreen ? '20px' : 'auto',
              right: isFullScreen ? '20px' : 'auto',
              bottom: isFullScreen ? '20px' : 'auto',
              zIndex: isFullScreen ? 100 : 20,
              overflow: 'hidden',
              display: rightWidth === '0%' && !isMobile ? 'none' : 'flex',
              flexDirection: 'column',
              borderRadius: isFullScreen ? '12px' : '0px',
              boxShadow: isFullScreen ? '0 20px 60px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {/* Modern Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-2 h-2 rounded-full bg-fabcity-green animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {resource.title || 'Resource Viewer'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  title="Open External Link"
                  onClick={() => openExternal(resource.url)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-md border border-gray-300 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Open External</span>
                  <span className="sm:hidden">Open</span>
                </button>
                <button
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  onClick={toggleFullScreen}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-md border border-gray-300 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span className="hidden sm:inline">{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                </button>
                <button
                  title="Close"
                  onClick={closeViewer}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Viewer body */}
            <div 
              className="w-full flex-1 overflow-hidden relative"
              style={{ 
                height: isFullScreen ? 'calc(100vh - 100px)' : isMobile ? 'calc(50vh - 60px)' : 'calc(100% - 60px)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Show loading spinner during embed check */}
              {isCheckingEmbed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-fabcity-blue border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-sm text-gray-600">Checking resource compatibility...</div>
                  </div>
                </div>
              ) : resource.type === 'iframe' && resource.url ? (
                <>
                  {/* Show loading overlay only when actually loading and no error */}
                  {isLoading && !iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10" style={{ transition: 'opacity 0.2s ease' }}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-fabcity-blue border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-sm text-gray-600">Loading resource...</div>
                        <div className="text-xs text-gray-500">This may take a moment for forms and complex pages</div>
                      </div>
                    </div>
                  )}
                  {/* Render iframe immediately - starts loading as soon as src is set */}
                  {/* Always render iframe, even if there's an error (browser will show its own error) */}
                  {/* Forms and complex resources need full sandbox permissions */}
                  <iframe
                    ref={iframeRef}
                    key={resource.url} // Force remount when URL changes for fresh load
                    title={resource.title || 'Resource Viewer'}
                    src={resource.url}
                    className="w-full h-full"
                    style={{ 
                      border: 'none', 
                      position: 'relative', 
                      zIndex: 1,
                      opacity: iframeError ? 0 : 1, // Hide iframe if error, but keep it in DOM
                      transition: 'opacity 0.2s ease',
                      minHeight: '100%' // Ensure full height for forms
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation allow-popups-to-escape-sandbox allow-modals"
                    loading="eager" // Start loading immediately, don't lazy load
                  />
                </>
              ) : (resource.type === 'fallback' || iframeError) ? (
                <div className="p-6 md:p-8 flex flex-col items-start gap-4 h-full overflow-y-auto">
                  <div className="flex items-start gap-4 w-full">
                    <div className="flex-shrink-0">
                      <svg 
                        width="32" 
                        height="32" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-amber-500"
                      >
                        <path 
                          d="M12 9v4" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M12 17h.01" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                        <path 
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-gray-900 mb-1">
                        {isBlocked ? 'Resource cannot be embedded' : 'Unable to load resource'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isBlocked 
                          ? 'This resource cannot be embedded (security restrictions, file size, or YouTube restrictions). It has been automatically opened in a side panel window that stays within the chatbot.'
                          : iframeError 
                            ? 'The resource failed to load and has been automatically opened in a side panel window. This may be due to connection issues, large file size, or security restrictions.'
                            : 'The resource may be blocked, unsafe, or unsupported in the viewer. It has been automatically opened in a side panel window.'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Resource URL:</div>
                    <div className="text-sm font-mono text-gray-800 break-all">
                      {resource.originalUrl || resource.url}
                    </div>
                    {resource.title && resource.title !== resource.url && (
                      <>
                        <div className="text-xs font-medium text-gray-500 mt-3 mb-1">Title:</div>
                        <div className="text-sm text-gray-800 break-words">{resource.title}</div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 w-full">
                    {popupOpened ? (
                      <button 
                        className="px-4 py-2.5 bg-fabcity-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
                        onClick={() => {
                          // Re-open or focus existing popup
                          const urlToOpen = resource.originalUrl || resource.url;
                          if (popupWindowRef.current && !popupWindowRef.current.closed) {
                            popupWindowRef.current.focus();
                          } else {
                            openInPopup(urlToOpen);
                          }
                        }}
                      >
                        <ExternalLink size={16} />
                        Re-open Side Window
                      </button>
                    ) : (
                      <button 
                        className="px-4 py-2.5 bg-fabcity-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow flex items-center gap-2"
                        onClick={() => {
                          const urlToOpen = resource.originalUrl || resource.url;
                          const popup = openInPopup(urlToOpen);
                          if (!popup) {
                            // If popup was blocked, fallback to new tab
                            window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <ExternalLink size={16} />
                        Open in Side Window
                      </button>
                    )}
                    <button 
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      onClick={closeViewer}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-500 mb-2">No resource selected</div>
                    <div className="text-sm text-gray-400">Click on a citation or link to view it here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRAGLayout;
