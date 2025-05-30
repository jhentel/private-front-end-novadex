type CacheEntry = {
  data: any;
  timestamp: number;
};

class ChartDataWarmupCache {
  private static instance: ChartDataWarmupCache;
  private cache: Map<string, CacheEntry>;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): ChartDataWarmupCache {
    if (!ChartDataWarmupCache.instance) {
      ChartDataWarmupCache.instance = new ChartDataWarmupCache();
    }
    return ChartDataWarmupCache.instance;
  }

  async warmup(mint: string): Promise<void> {
    // Prefetch initial data for common resolutions
    const resolutions = ["1S", "1", "5", "15"];
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    try {
      await Promise.all(
        resolutions.map(async (resolution) => {
          const key = `${mint}-${resolution}`;
          if (!this.get(key)) {
            const response = await fetch(
              `/api/chart/history?mint=${mint}&from=${oneDayAgo}&to=${now}&resolution=${resolution}`,
            );
            const data = await response.json();
            if (data.success) {
              this.set(key, data);
            }
          }
        }),
      );
    } catch (error) {
      console.warn("Chart data warmup failed:", error);
    }
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  prefetch(mint: string, resolution: string): void {
    const key = `${mint}-${resolution}`;
    if (!this.get(key)) {
      this.warmup(mint).catch(console.warn);
    }
  }
}

export const chartDataWarmupCache = ChartDataWarmupCache.getInstance();
