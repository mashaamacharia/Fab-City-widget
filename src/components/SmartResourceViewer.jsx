import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { transformUrlForEmbedding, isPdf, truncateUrl } from '../utils/urlTransform';
import { prefetchResource } from '../utils/resourcePrefetch';

/**
 * SmartResourceViewer - Robust resource viewer with fallback handling
 * 
 * Features:
 * - URL transformation for Google Drive, YouTube, PDFs
 * - Resource toolbar with title and "Open in New Tab" button
 * - Overlay with "Trouble loading?" link
 * - Proper sandbox attributes for security
 * - Loading state with spinner
 * - Automatic fallback handling for blocked resources
 * 
 * Props:
 * - url: string - The resource URL to display
 * - title: string - Optional title for the resource (defaults to truncated URL)
 * - originalUrl: string - Optional original URL before transformation (for fallback)
 * - onClose: function - Optional callback when viewer should be closed
 */
const SmartResourceViewer = ({ 
  url, 
  title, 
  originalUrl, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const [transformedUrl, setTransformedUrl] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');

  // Transform URL and set up display title
  useEffect(() => {
    if (!url) {
      setTransformedUrl('');
      setDisplayTitle('');
      return;
    }

    // Transform URL for embedding
    const transformed = transformUrlForEmbedding(url);
    
    // Log transformation for debugging (especially for Google Drive)
    if (transformed !== url) {
      console.log('SmartResourceViewer: URL transformed', {
        original: url,
        transformed: transformed
      });
    }
    
    setTransformedUrl(transformed);

    // Set display title
    const resourceTitle = title || truncateUrl(originalUrl || url, 50);
    setDisplayTitle(resourceTitle);

    // Prefetch resource for faster loading
    prefetchResource(transformed);

    // Reset states
    setIsLoading(true);
    setHasError(false);

    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, [url, title, originalUrl]);

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('SmartResourceViewer: Iframe loaded successfully');
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setIsLoading(false);
    setHasError(false);
  };

  // Handle iframe load error
  const handleIframeError = () => {
    console.warn('SmartResourceViewer: Iframe failed to load');
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setIsLoading(false);
    setHasError(true);
  };

  // Set up timeout for iframe loading
  useEffect(() => {
    if (transformedUrl && isLoading) {
      // 20 second timeout for complex resources (forms, large files, etc.)
      loadTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          console.warn('SmartResourceViewer: Iframe loading timeout');
          setIsLoading(false);
          // Don't set hasError to true on timeout - let the iframe continue trying
          // The user can still use the fallback button if needed
        }
      }, 20000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [transformedUrl, isLoading]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-500 mb-2">No resource selected</div>
          <div className="text-sm text-gray-400">Click on a citation or link to view it here</div>
        </div>
      </div>
    );
  }

  const isPdfFile = isPdf(originalUrl || url);
  // Prefer the transformed (embed/preview) URL for opening in a new tab,
  // so Google Drive and similar resources don't trigger downloads.
  const externalUrl = transformedUrl || originalUrl || url;

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      {/* Resource Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full bg-fabcity-green animate-pulse flex-shrink-0"></div>
          <span 
            className="text-sm font-semibold text-gray-800 truncate" 
            title={displayTitle}
          >
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded-md border border-gray-300 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
              title="Open in New Tab"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </a>
          )}
        </div>
      </div>

      {/* Viewer Body */}
      <div className="w-full flex-1 overflow-hidden relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20"
            style={{ transition: 'opacity 0.2s ease' }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-fabcity-blue border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-gray-600">Loading resource...</div>
              <div className="text-xs text-gray-500">This may take a moment for forms and complex pages</div>
            </div>
          </div>
        )}

        {/* Iframe Container */}
        <div className="w-full h-full relative">
          {isPdfFile ? (
            // Use object tag for PDFs to trigger browser's native PDF viewer
            <object
              data={transformedUrl}
              type="application/pdf"
              className="w-full h-full"
              style={{ border: 'none' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            >
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-6">
                  <p className="text-gray-600 mb-4">Unable to display PDF in viewer.</p>
              {externalUrl && (
                    <a
                  href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-fabcity-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <ExternalLink size={16} />
                      Open PDF in New Tab
                    </a>
                  )}
                </div>
              </div>
            </object>
          ) : (
            // Use iframe for web content
            <iframe
              ref={iframeRef}
              key={transformedUrl}
              title={displayTitle}
              src={transformedUrl}
              className="w-full h-full"
              style={{
                border: 'none',
                position: 'relative',
                zIndex: 1,
                minHeight: '100%',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation allow-popups-to-escape-sandbox allow-modals"
              loading="eager"
            />
          )}
        </div>

        {/* Trouble Loading Overlay */}
        {externalUrl && (
          <div className="absolute bottom-4 right-4 z-30">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md shadow-lg transition-all duration-200 flex items-center gap-1.5 opacity-90 hover:opacity-100"
              title="Trouble loading? Open in new tab"
            >
              <span>Trouble loading?</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartResourceViewer;

