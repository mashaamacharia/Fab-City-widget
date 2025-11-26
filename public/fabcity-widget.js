(function () {
  // Self-contained widget loader for embedding the Fab City chat
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const WIDGET_SRC = currentScript.getAttribute('data-widget-src') || 'https://fabcity-widget.onrender.com';
  const POSITION = currentScript.getAttribute('data-position') || 'bottom-right'; // bottom-right, bottom-left
  const LABEL = currentScript.getAttribute('data-label') || 'Chat';

  // create style link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = (currentScript.getAttribute('data-css') || '/fabcity-widget.css');
  document.head.appendChild(link);

  // container
  const container = document.createElement('div');
  container.className = 'fabcity-widget-container fabcity-' + POSITION;

  // iframe wrapper
  const panel = document.createElement('div');
  panel.className = 'fabcity-widget-panel';

  const iframe = document.createElement('iframe');
  iframe.className = 'fabcity-widget-iframe';
  iframe.src = WIDGET_SRC;
  iframe.title = 'Fab City Chat';
  iframe.setAttribute('allow', 'geolocation; microphone; camera;');
  iframe.setAttribute('loading', 'lazy');

  panel.appendChild(iframe);

  // toggle button
  const btn = document.createElement('button');
  btn.className = 'fabcity-widget-toggle';
  btn.setAttribute('aria-label', 'Open Fab City chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L22 2L13 22L10 13L2 12Z" fill="currentColor"/></svg>';

  // badge / label (optional)
  const label = document.createElement('div');
  label.className = 'fabcity-widget-label';
  label.textContent = LABEL;

  container.appendChild(panel);
  container.appendChild(label);
  container.appendChild(btn);
  document.body.appendChild(container);

  // state
  let open = false;

  function openPanel() {
    container.classList.add('fabcity-open');
    iframe.focus();
    open = true;
  }

  function closePanel() {
    container.classList.remove('fabcity-open');
    open = false;
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (open) closePanel(); else openPanel();
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && open) closePanel();
  });

  // expose minimal API
  window.FabCityWidget = window.FabCityWidget || {
    open: openPanel,
    close: closePanel,
  };
})();
