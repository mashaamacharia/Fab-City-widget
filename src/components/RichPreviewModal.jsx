// import { motion, AnimatePresence } from 'framer-motion';
// import { X, Download, Maximize2, Minimize2, ExternalLink, AlertCircle, Globe, FileText, FileImage, Film, Play } from 'lucide-react';
// import { useEffect, useState, useCallback, useRef } from 'react';

// const RichPreviewModal = ({ url, onClose }) => {
//   const [fileType, setFileType] = useState('loading');
//   const [embedUrl, setEmbedUrl] = useState(url);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [embedFailed, setEmbedFailed] = useState(false);
//   const [metadata, setMetadata] = useState(null);
//   const [loadingMetadata, setLoadingMetadata] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [showBanner, setShowBanner] = useState(true);
//   const [autoOpenedExternal, setAutoOpenedExternal] = useState(false);
//   const iframeRef = useRef(null);
//   const embedTimeoutRef = useRef(null);

//   // Detect file type from URL
//   const detectFileType = useCallback((targetUrl) => {
//     const urlLower = targetUrl.toLowerCase();
    
//     // Video platforms
//     if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/')) {
//       return 'youtube';
//     }
//     if (targetUrl.includes('vimeo.com/')) {
//       return 'vimeo';
//     }
    
//     // Cloud storage - Google Drive
//     if (targetUrl.includes('drive.google.com')) {
//       // Check for direct download links and convert them
//       if (targetUrl.includes('export=download') || targetUrl.includes('/uc?')) {
//         // Try to extract file ID and determine type
//         const idMatch = targetUrl.match(/[?&]id=([^&]+)/);
//         if (idMatch) {
//           // Default to PDF for download links, will be converted to preview
//           return 'googledrive';
//         }
//       }
//       return 'googledrive';
//     }
//     if (targetUrl.includes('dropbox.com')) {
//       if (urlLower.includes('.pdf') || urlLower.endsWith('.pdf')) return 'pdf';
//       if (/\.(jpg|jpeg|png|gif|webp|svg)/i.test(urlLower)) return 'image';
//       return 'dropbox';
//     }
    
//     // File extensions
//     if (/\.(pdf)(\?|#|$)/i.test(urlLower)) return 'pdf';
//     if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|#|$)/i.test(urlLower)) return 'image';
//     if (/\.(mp4|webm|ogg|mov|avi)(\?|#|$)/i.test(urlLower)) return 'video';
//     if (/\.(doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/i.test(urlLower)) return 'office';
    
//     // Default to web
//     return 'web';
//   }, []);

//   // Process URL into embeddable format
//   const processUrl = useCallback((targetUrl, type) => {
//     switch (type) {
//       case 'youtube': {
//         let videoId = '';
//         if (targetUrl.includes('youtube.com/watch')) {
//           const urlParams = new URLSearchParams(targetUrl.split('?')[1]);
//           videoId = urlParams.get('v');
//         } else if (targetUrl.includes('youtu.be/')) {
//           videoId = targetUrl.split('youtu.be/')[1].split('?')[0].split('/')[0];
//         }
//         return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : targetUrl;
//       }
      
//       case 'vimeo': {
//         const videoIdMatch = targetUrl.match(/vimeo\.com\/(\d+)/);
//         return videoIdMatch ? `https://player.vimeo.com/video/${videoIdMatch[1]}` : targetUrl;
//       }
      
//       case 'googledrive': {
//         // Handle different Google Drive URL formats
//         let fileId = null;
        
//         // Format 1: /file/d/{id}/
//         const fileIdMatch = targetUrl.match(/\/file\/d\/([^\/\?]+)/);
//         if (fileIdMatch) {
//           fileId = fileIdMatch[1];
//         }
        
//         // Format 2: ?id={id} (download links)
//         if (!fileId) {
//           const idMatch = targetUrl.match(/[?&]id=([^&]+)/);
//           if (idMatch) {
//             fileId = idMatch[1];
//           }
//         }
        
//         // Format 3: /d/{id}/
//         if (!fileId) {
//           const dMatch = targetUrl.match(/\/d\/([^\/\?]+)/);
//           if (dMatch) {
//             fileId = dMatch[1];
//           }
//         }
        
//         // Convert to preview URL instead of download
//         if (fileId) {
//           return `https://drive.google.com/file/d/${fileId}/preview`;
//         }
        
//         return targetUrl;
//       }
      
//       case 'pdf': {
//         // Use Google Docs viewer for PDFs for better compatibility
//         if (!targetUrl.includes('drive.google.com') && !targetUrl.includes('docs.google.com/viewer')) {
//           return `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=true`;
//         }
//         return targetUrl;
//       }
      
//       case 'office': {
//         // Use Microsoft Office Online viewer for Office documents
//         return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(targetUrl)}`;
//       }
      
//       case 'dropbox': {
//         let processed = targetUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
//         processed = processed.replace('?dl=0', '').replace('?dl=1', '');
//         if (!processed.includes('dl=1') && !processed.includes('raw=1')) {
//           processed += (processed.includes('?') ? '&' : '?') + 'raw=1';
//         }
//         return processed;
//       }
      
//       default:
//         return targetUrl;
//     }
//   }, []);

//   // Handle PDF download
//   const handleDownloadPDF = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     if (isDownloading) return;
    
//     setIsDownloading(true);
    
//     try {
//       // Fetch the PDF as a blob
//       const response = await fetch(url);
//       const blob = await response.blob();
      
//       // Create a temporary URL for the blob
//       const blobUrl = window.URL.createObjectURL(blob);
      
//       // Create a temporary anchor element
//       const link = document.createElement('a');
//       link.href = blobUrl;
      
//       // Extract filename from URL or use default
//       const urlPath = new URL(url).pathname;
//       const filename = urlPath.split('/').pop() || 'document.pdf';
//       link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      
//       // Append to body, click, and remove
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       // Clean up the blob URL after a short delay
//       setTimeout(() => {
//         window.URL.revokeObjectURL(blobUrl);
//       }, 100);
      
//     } catch (error) {
//       console.error('Download failed:', error);
//       // Fallback: try opening in new tab with download attribute
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = 'document.pdf';
//       link.target = '_blank';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   // Fetch website metadata
//   const fetchMetadata = useCallback(async (targetUrl) => {
//     setLoadingMetadata(true);
//     try {
//       const corsProxy = 'https://api.allorigins.win/raw?url=';
//       const response = await fetch(corsProxy + encodeURIComponent(targetUrl), {
//         signal: AbortSignal.timeout(8000)
//       });
//       const html = await response.text();
      
//       const parser = new DOMParser();
//       const doc = parser.parseFromString(html, 'text/html');
      
//       const title = doc.querySelector('meta[property="og:title"]')?.content ||
//                     doc.querySelector('meta[name="twitter:title"]')?.content ||
//                     doc.querySelector('title')?.textContent ||
//                     new URL(targetUrl).hostname;
      
//       const description = doc.querySelector('meta[property="og:description"]')?.content ||
//                          doc.querySelector('meta[name="twitter:description"]')?.content ||
//                          doc.querySelector('meta[name="description"]')?.content ||
//                          '';
      
//       const image = doc.querySelector('meta[property="og:image"]')?.content ||
//                     doc.querySelector('meta[name="twitter:image"]')?.content ||
//                     null;
      
//       const domain = new URL(targetUrl).hostname;
//       const favicon = doc.querySelector('link[rel="icon"]')?.href ||
//                      doc.querySelector('link[rel="shortcut icon"]')?.href ||
//                      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      
//       setMetadata({
//         title: title.substring(0, 150),
//         description: description.substring(0, 300),
//         image,
//         favicon,
//         url: targetUrl,
//         domain
//       });
//     } catch (error) {
//       console.error('Failed to fetch metadata:', error);
//       const domain = new URL(targetUrl).hostname;
//       setMetadata({
//         title: domain,
//         description: '',
//         image: null,
//         favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
//         url: targetUrl,
//         domain
//       });
//     } finally {
//       setLoadingMetadata(false);
//     }
//   }, []);

//   // Initialize preview
//   useEffect(() => {
//     if (!url) return;
    
//     setEmbedFailed(false);
//     setLoadingMetadata(false);
//     setMetadata(null);
//     setShowBanner(true);
//     setAutoOpenedExternal(false);
    
//     const type = detectFileType(url);
//     const processed = processUrl(url, type);
    
//     setFileType(type);
//     setEmbedUrl(processed);
    
//     // For regular websites, start with iframe but have fallback ready
//     if (type === 'web') {
//       // Set a timeout to check if iframe loads successfully
//       embedTimeoutRef.current = setTimeout(() => {
//         // If we reach here, iframe might be loading slowly or failing
//         // We'll let the iframe error handler take care of it
//       }, 5000);
//     }
    
//     return () => {
//       if (embedTimeoutRef.current) {
//         clearTimeout(embedTimeoutRef.current);
//       }
//     };
//   }, [url, detectFileType, processUrl]);

//   const autoOpenExternal = useCallback(() => {
//     if (autoOpenedExternal) return;
//     const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
//     if (newWindow) {
//       newWindow.focus();
//       setAutoOpenedExternal(true);
//       onClose?.();
//     } else {
//       console.warn('Popup blocked while trying to open external site.');
//     }
//   }, [autoOpenedExternal, url, onClose]);

//   // Handle iframe load
//   const handleIframeLoad = () => {
//     if (embedTimeoutRef.current) {
//       clearTimeout(embedTimeoutRef.current);
//     }
//     setFileType(prev => (prev === 'loading' ? 'web' : prev));

//     if (fileType === 'web') {
//       const iframe = iframeRef.current;
//       if (iframe) {
//         try {
//           const frameLocation = iframe.contentWindow?.location?.href;
//           if (!frameLocation || frameLocation === 'about:blank') {
//             setEmbedFailed(true);
//             if (!metadata) {
//               fetchMetadata(url);
//             }
//             autoOpenExternal();
//           }
//         } catch (err) {
//           // Accessing cross-origin frame succeeded, so consider it loaded.
//         }
//       }
//     }
//   };

//   // Handle iframe error
//   const handleIframeError = () => {
//     if (embedTimeoutRef.current) {
//       clearTimeout(embedTimeoutRef.current);
//     }
//     setEmbedFailed(true);
//     if (fileType === 'web' && !metadata) {
//       fetchMetadata(url);
//     }
//     if (fileType === 'web') {
//       autoOpenExternal();
//     }
//   };

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === 'f' || e.key === 'F') setIsFullScreen(prev => !prev);
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [onClose]);

//   if (!url) return null;

//   const getTypeIcon = () => {
//     switch (fileType) {
//       case 'pdf': return <FileText size={20} />;
//       case 'image': return <FileImage size={20} />;
//       case 'video': return <Film size={20} />;
//       case 'youtube': return <Play size={20} />;
//       case 'vimeo': return <Play size={20} />;
//       default: return <Globe size={20} />;
//     }
//   };

//   const getTypeLabel = () => {
//     switch (fileType) {
//       case 'pdf': return 'PDF Document';
//       case 'image': return 'Image';
//       case 'video': return 'Video';
//       case 'youtube': return 'YouTube Video';
//       case 'vimeo': return 'Vimeo Video';
//       case 'googledrive': return 'Google Drive';
//       case 'office': return 'Office Document';
//       case 'loading': return 'Loading...';
//       default: return 'Website';
//     }
//   };

//   const renderContent = () => {
//     // Show rich preview card if embedding failed
//     if (embedFailed && fileType === 'web') {
//       return (
//         <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-auto">
//           {loadingMetadata ? (
//             <div className="flex flex-col items-center">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
//               <p className="text-gray-600 font-medium">Loading preview...</p>
//             </div>
//           ) : metadata ? (
//             <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
//               {/* Image Header */}
//               <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 h-72 flex items-center justify-center overflow-hidden">
//                 {metadata.image ? (
//                   <img 
//                     src={metadata.image} 
//                     alt={metadata.title}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.style.display = 'none';
//                     }}
//                   />
//                 ) : (
//                   <Globe size={96} className="text-blue-500/30" />
//                 )}
//                 <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-lg">
//                   <img 
//                     src={metadata.favicon} 
//                     alt="Site icon"
//                     className="w-12 h-12"
//                     onError={(e) => {
//                       e.target.src = `https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=128`;
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-8">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
//                   {metadata.title}
//                 </h2>
//                 <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
//                   <Globe size={14} />
//                   {metadata.domain}
//                 </p>
                      
//                 {metadata.description && (
//                   <p className="text-gray-600 leading-relaxed mb-6">
//                     {metadata.description}
//                   </p>
//                 )}

//                 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
//                   <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1">
//                     <p className="text-sm text-amber-900">
//                       <strong>Cannot embed this website.</strong> The site's security settings prevent preview. Please open in a new tab to view the content.
//                     </p>
//                   </div>
//                 </div>

//                 <a
//                   href={metadata.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl"
//                 >
//                   <ExternalLink size={20} />
//                   Open Website in New Tab
//                 </a>
//               </div>
//             </div>
//           ) : (
//             <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
//               <AlertCircle size={72} className="text-gray-400 mb-4 mx-auto" />
//               <h3 className="text-xl font-bold text-gray-800 mb-3">
//                 Cannot Display Website
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 This website's security settings prevent it from being embedded. Please open it in a new tab to view the content.
//               </p>
//               <a
//                 href={url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-semibold"
//               >
//                 <ExternalLink size={18} />
//                 Open in New Tab
//               </a>
//             </div>
//           )}
//         </div>
//       );
//     }

//     // Render based on file type
//     switch (fileType) {
//       case 'image':
//         return (
//           <div className="flex-1 flex items-center justify-center bg-black p-4">
//             <img
//               src={embedUrl}
//               alt="Preview"
//               className="max-w-full max-h-full object-contain"
//               onError={(e) => {
//                 e.target.src = url; // Fallback to original URL
//               }}
//             />
//           </div>
//         );

//       case 'video':
//         return (
//           <div className="flex-1 flex items-center justify-center bg-black p-4">
//             <video controls className="max-w-full max-h-full" autoPlay={false}>
//               <source src={embedUrl} />
//               <source src={url} />
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         );

//       case 'pdf':
//         return (
//           <iframe
//             ref={iframeRef}
//             src={embedUrl}
//             className="flex-1 w-full border-0"
//             title="PDF Preview"
//             onLoad={handleIframeLoad}
//             onError={handleIframeError}
//           />
//         );

//       case 'youtube':
//       case 'vimeo':
//       case 'googledrive':
//       case 'office':
//       case 'web':
//       case 'loading':
//       default:
//         return (
//           <iframe
//             ref={iframeRef}
//             src={embedUrl}
//             className="flex-1 w-full border-0"
//             title="Content Preview"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
//             allowFullScreen
//             sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation allow-popups-to-escape-sandbox"
//             onLoad={handleIframeLoad}
//             onError={handleIframeError}
//             referrerPolicy="no-referrer-when-downgrade"
//           />
//         );
//     }
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0, y: 20 }}
//           animate={{ scale: 1, opacity: 1, y: 0 }}
//           exit={{ scale: 0.95, opacity: 0, y: 20 }}
//           transition={{ type: 'spring', damping: 30, stiffness: 300 }}
//           className={`bg-white overflow-hidden relative transition-all duration-300 flex flex-col ${
//             isFullScreen 
//               ? 'fixed inset-0 w-full h-full rounded-none' 
//               : 'w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl'
//           }`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
//             <div className="flex items-center gap-3 min-w-0 flex-1">
//               <div className="text-white">
//                 {getTypeIcon()}
//               </div>
//               <div className="min-w-0 flex-1">
//                 <span className="text-sm font-semibold text-white block">
//                   {getTypeLabel()}
//                 </span>
//                 <span className="text-xs text-white/80 truncate block">
//                   {new URL(url).hostname}
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 flex-shrink-0">
//               {fileType === 'pdf' && (
//                 <button
//                   onClick={handleDownloadPDF}
//                   disabled={isDownloading}
//                   className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   title={isDownloading ? "Downloading..." : "Download PDF"}
//                 >
//                   {isDownloading ? (
//                     <div className="animate-spin rounded-full h-[18px] w-[18px] border-2 border-white border-t-transparent"></div>
//                   ) : (
//                     <Download size={18} />
//                   )}
//                 </button>
//               )}
//               {(fileType === 'googledrive' || fileType === 'image' || fileType === 'video') && (
//                 <a
//                   href={url}
//                   download
//                   className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/20 transition-colors"
//                   title="Download file"
//                 >
//                   <Download size={18} />
//                 </a>
//               )}
//               {fileType === 'web' && (
//                 <a
//                   href={url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/20 transition-colors"
//                   title="Open in new tab"
//                 >
//                   <ExternalLink size={18} />
//                 </a>
//               )}
//               <button
//                 onClick={() => setIsFullScreen(!isFullScreen)}
//                 className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/20 transition-colors"
//                 title={isFullScreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
//               >
//                 {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
//               </button>
//               <button
//                 onClick={onClose}
//                 className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/20 transition-colors"
//                 title="Close (Esc)"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           {/* Info Banner for Websites */}
//           {fileType === 'web' && showBanner && (
//             <motion.div
//               initial={{ height: 'auto', opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               animate={{ height: showBanner ? 'auto' : 0, opacity: showBanner ? 1 : 0 }}
//               transition={{ duration: 0.4, ease: 'easeInOut' }}
//               className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 overflow-hidden"
//             >
//               <AlertCircle size={18} className="text-blue-600 flex-shrink-0" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm text-blue-900">
//                   <strong>Can't see the website?</strong> Some sites prevent embedding. Click the <ExternalLink size={14} className="inline mx-1" /> icon above to open in a new tab.
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowBanner(false)}
//                 className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
//                 title="Dismiss"
//               >
//                 <X size={16} />
//               </button>
//             </motion.div>
//           )}

//           {/* Content */}
//           {renderContent()}
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default RichPreviewModal;

// Keep ONE global popup reference
let popupRef = null;


// Direct popup opener - no iframe, no modal
const processUrl = (targetUrl, type) => {
  switch (type) {
    case 'youtube': {
      let videoId = '';
      if (targetUrl.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(targetUrl.split('?')[1]);
        videoId = urlParams.get('v');
      } else if (targetUrl.includes('youtu.be/')) {
        videoId = targetUrl.split('youtu.be/')[1].split('?')[0].split('/')[0];
      }
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
        : targetUrl;
    }

    case 'vimeo': {
      const match = targetUrl.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : targetUrl;
    }

    case 'googledrive': {
      let fileId = null;

      const m1 = targetUrl.match(/\/file\/d\/([^\/\?]+)/);
      if (m1) fileId = m1[1];

      if (!fileId) {
        const m2 = targetUrl.match(/[?&]id=([^&]+)/);
        if (m2) fileId = m2[1];
      }

      if (!fileId) {
        const m3 = targetUrl.match(/\/d\/([^\/\?]+)/);
        if (m3) fileId = m3[1];
      }

      return fileId
        ? `https://drive.google.com/file/d/${fileId}/preview`
        : targetUrl;
    }

    case 'pdf':
      return targetUrl;

    case 'office':
      return targetUrl;

    case 'dropbox': {
      let processed = targetUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      processed = processed.replace('?dl=0', '').replace('?dl=1', '');
      if (!processed.includes('raw=1')) {
        processed += (processed.includes('?') ? '&' : '?') + 'raw=1';
      }
      return processed;
    }

    default:
      return targetUrl;
  }
};


// Detect file type
const detectFileType = (targetUrl) => {
  const urlLower = targetUrl.toLowerCase();

  if (targetUrl.includes('youtube.com/watch') || targetUrl.includes('youtu.be/'))
    return 'youtube';

  if (targetUrl.includes('vimeo.com/'))
    return 'vimeo';

  if (targetUrl.includes('drive.google.com'))
    return 'googledrive';

  if (targetUrl.includes('dropbox.com')) {
    if (urlLower.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif|webp|svg)/i.test(urlLower)) return 'image';
    return 'dropbox';
  }

  if (/\.(pdf)(\?|#|$)/i.test(urlLower)) return 'pdf';
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?|#|$)/i.test(urlLower)) return 'image';
  if (/\.(mp4|webm|ogg|mov|avi)(\?|#|$)/i.test(urlLower)) return 'video';
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/i.test(urlLower)) return 'office';

  return 'web';
};


export const openInPopup = (url, isFullScreen = false) => {
  if (!url) return;

  const fileType = detectFileType(url);
  const processedUrl = processUrl(url, fileType);

  // Reuse existing popup if it's open
  if (popupRef && !popupRef.closed) {
    try {
      popupRef.location.href = processedUrl; // load new resource
      popupRef.focus();                      // bring window back
      return;                                // done
    } catch (err) {
      // Cross-origin issues → reopen fresh popup
      popupRef.close();
    }
  }

  // Calculate popup size
  let width, height;

  if (isFullScreen) {
    width = window.innerWidth;
    height = window.innerHeight;
  } else {
    width = Math.min(window.innerWidth, 1152);
    height = Math.floor(window.innerHeight * 0.9);
  }

  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // Open popup and save reference
  popupRef = window.open(
    processedUrl,
    "previewPopup",
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
  );

  if (popupRef) {
    popupRef.focus();

    // Watch if user closes popup manually
    const interval = setInterval(() => {
      if (popupRef.closed) {
        popupRef = null;
        clearInterval(interval);
      }
    }, 400);
    
  } else {
    console.warn('Popup was blocked');
    window.open(processedUrl, '_blank', 'noopener,noreferrer');
  }
};


export default openInPopup;
