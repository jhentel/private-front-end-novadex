"use client";

import { useState, useEffect } from "react";

// Add type declarations for performance.memory
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export default function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(true);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [memoryMB, setMemoryMB] = useState<number>(0);
  const [maxMemoryMB, setMaxMemoryMB] = useState<number>(0);
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [domNodes, setDomNodes] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    // Update memory usage and DOM nodes every 2 seconds
    const updateMetrics = () => {
      // Update memory usage
      if (window.performance && window.performance.memory) {
        const usedHeap = window.performance.memory.usedJSHeapSize;
        const totalHeap = window.performance.memory.totalJSHeapSize;
        const memoryPercentage = (usedHeap / totalHeap) * 100;
        const currentMemoryMB = usedHeap / (1024 * 1024); // Convert to MB

        setMemoryUsage(memoryPercentage);
        setMemoryMB(currentMemoryMB);
        setMaxMemoryMB((prev) => Math.max(prev, currentMemoryMB));
      }

      // Update DOM node count
      const count = document.getElementsByTagName("*").length;
      setDomNodes(count);
    };

    // Update CPU usage using requestAnimationFrame
    let lastTime = performance.now();
    let frameCount = 0;
    let lastUpdate = performance.now();
    let idleTime = 0;

    const updateCpuUsage = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      frameCount++;

      // Track idle time between frames
      if (deltaTime > 16.67) {
        idleTime += deltaTime - 16.67;
      }

      // Only update CPU usage every 2 seconds
      if (currentTime - lastUpdate >= 2000) {
        const totalTime = currentTime - lastUpdate;
        const activeTime = totalTime - idleTime;
        const cpuPercentage = Math.min((activeTime / totalTime) * 100, 100);
        const currentFps = Math.round((frameCount * 1000) / totalTime);

        setCpuUsage(cpuPercentage);
        setFps(currentFps);
        frameCount = 0;
        idleTime = 0;
        lastUpdate = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateCpuUsage);
    };

    // Set up intervals
    const metricsInterval = setInterval(updateMetrics, 2000);
    let animationFrameId: number;

    // Start CPU monitoring
    updateCpuUsage();

    // Cleanup
    return () => {
      clearInterval(metricsInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-10 right-10 z-50 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md hover:bg-black/80"
      >
        Show Monitor
      </button>
    );
  }

  return (
    <div className="fixed bottom-10 right-10 z-50 rounded-lg border border-border bg-black/70 p-3 text-xs text-white backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Performance Monitor</span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">JS Heap:</span>
          <div className="h-1.5 w-16 rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
          <span>
            {memoryUsage.toFixed(1)}% {memoryMB.toFixed(1)}MB | Max:{" "}
            {maxMemoryMB.toFixed(1)}MB
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">JS CPU:</span>
          <div className="h-1.5 w-16 rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          <span>{cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">FPS:</span>
          <div className="h-1.5 w-16 rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-yellow-500"
              style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
            />
          </div>
          <span>{fps}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">DOM Nodes:</span>
          <span>{domNodes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
