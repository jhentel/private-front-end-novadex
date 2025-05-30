import { Howl } from "howler";

class SoundManager {
  private static instance: SoundManager;
  private soundPool: Howl[];
  private poolSize: number;
  private currentIndex: number;
  private isInitialized: boolean = false;
  private audioContext: AudioContext | null = null;

  private constructor(poolSize = 5) {
    this.poolSize = poolSize;
    this.soundPool = [];
    this.currentIndex = 0;

    // Add event listeners for user interaction
    if (typeof window !== "undefined") {
      const handleInteraction = () => {
        if (this.audioContext?.state === "suspended") {
          this.audioContext.resume();
        }
        // Remove listeners after first interaction
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
      };

      window.addEventListener("click", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
      window.addEventListener("keydown", handleInteraction);
    }

    // Initialize audio context
    this.initAudioContext();
    this.initPool();
  }

  private initAudioContext() {
    if (typeof window !== "undefined") {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn("Failed to create AudioContext:", e);
      }
    }
  }

  private initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const sound = new Howl({
        src: ["/sfx/notification.mp3"],
        html5: true,
        preload: true,
        format: ["mp3"],
        onload: () => {
          if (i === this.poolSize - 1) {
            this.isInitialized = true;
          }
        },
        onloaderror: (id, error) => {
          console.warn("Error loading sound:", error);
        },
        onplayerror: (soundId, error) => {
          console.warn("Error playing sound:", error);
          // Try to unlock audio on error
          if (this.audioContext?.state === "suspended") {
            this.audioContext.resume();
          }
        },
      });
      this.soundPool.push(sound);
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async play(volume: number) {
    // Ensure audio context is running
    if (this.audioContext?.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn("Failed to resume AudioContext:", e);
      }
    }

    try {
      const sound = this.soundPool[this.currentIndex];
      const normalizedVolume = Math.max(0, Math.min(volume / 100, 1));
      sound.volume(normalizedVolume);

      // Try to find a sound that's not playing
      let soundToPlay = sound;
      if (sound.playing()) {
        for (let i = 0; i < this.poolSize; i++) {
          const nextIndex = (this.currentIndex + i) % this.poolSize;
          if (!this.soundPool[nextIndex].playing()) {
            soundToPlay = this.soundPool[nextIndex];
            this.currentIndex = nextIndex;
            break;
          }
        }
      }

      soundToPlay.play();
      this.currentIndex = (this.currentIndex + 1) % this.poolSize;
    } catch (error) {
      console.warn("Failed to play sound:", error);
    }
  }

  cleanup() {
    this.soundPool.forEach((sound) => {
      sound.unload();
    });
    this.soundPool = [];
    this.isInitialized = false;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default SoundManager;
