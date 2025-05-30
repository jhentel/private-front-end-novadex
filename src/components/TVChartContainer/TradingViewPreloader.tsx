"use client";

import { useEffect } from "react";

// Load TradingView synchronously before anything else
const preloadTradingView = `
(function() {
  if (window.TradingView) return;
  
  // Pre-initialize configuration
  window.TradingView = {
    defaultConfig: {
      supported_resolutions: ["1S","15S","30S","1","5","15","30","60","240","D"],
      supports_marks: true,
      supports_time: true,
      supports_timescale_marks: true,
    }
  };

  // Preload library
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '/static/charting_library/charting_library.standalone.js';
  script.async = false; // Load synchronously
  document.head.appendChild(script);

  // Preload datafeed
  var datafeedScript = document.createElement('script');
  datafeedScript.type = 'text/javascript';
  datafeedScript.src = '/static/datafeeds/udf/dist/bundle.js';
  datafeedScript.async = false; // Load synchronously
  document.head.appendChild(datafeedScript);

  // Preload styles
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/static/charting_library/bundles/940.8a3b1935586627f4857c.css';
  document.head.appendChild(link);
})();
`;

export default function TradingViewPreloader() {
  useEffect(() => {
    // Execute preload immediately
    const script = document.createElement("script");
    script.textContent = preloadTradingView;
    document.head.appendChild(script);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/tradingview-preload-worker.js")
        .then((registration) => {
          if (registration.active) {
            registration.active.postMessage({ type: "WARM_UP_TRADINGVIEW" });
          }
        });
    }

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
