// src/services/youtubePlayer.js
import { extractPlaylistId, YOUTUBE_PLAYLIST_URL } from '../config/music';

class YouTubePlayerService {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.playlistId = extractPlaylistId(YOUTUBE_PLAYLIST_URL);
    this.listeners = {
      stateChange: new Set(),
      trackChange: new Set(),
      timeUpdate: new Set(),
      ready: new Set(),
      error: new Set(),
    };
    this.timeUpdateInterval = null;
    this.currentVideoData = null;
    this.isInitializing = false;
    this.apiLoaded = false;
    this.pendingPlay = false;
    this.lastKnownState = -1; // -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].add(callback);
    }
    return () => {
      if (this.listeners[event]) {
        this.listeners[event].delete(callback);
      }
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in YouTubePlayer listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Loads the YouTube IFrame API script once
   */
  loadScript() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        this.apiLoaded = true;
        resolve();
        return;
      }

      if (window._ytApiLoadingPromise) {
        window._ytApiLoadingPromise.then(resolve);
        return;
      }

      window._ytApiLoadingPromise = new Promise((res) => {
        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          this.apiLoaded = true;
          res();
        };
      });

      window._ytApiLoadingPromise.then(resolve);
    });
  }

  /**
   * Initialize the player on the target container
   */
  async init(containerId = 'youtube-hidden-player') {
    if (this.player || this.isInitializing) {
      return;
    }
    this.isInitializing = true;

    await this.loadScript();

    return new Promise((resolve) => {
      const createPlayer = () => {
        if (!window.YT || !window.YT.Player) {
          setTimeout(createPlayer, 100);
          return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
          setTimeout(createPlayer, 100);
          return;
        }

        // Avoid re-creating if player already exists
        if (this.player) {
          this.isInitializing = false;
          resolve();
          return;
        }

        try {
          this.player = new window.YT.Player(containerId, {
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin,
              listType: 'playlist',
              list: this.playlistId,
            },
            events: {
              onReady: (event) => {
                this.isReady = true;
                this.isInitializing = false;
                this.startTimeTracking();
                this.updateTrackData();
                this.emit('ready', event);

                if (this.pendingPlay) {
                  this.pendingPlay = false;
                  this.play();
                }
                resolve();
              },
              onStateChange: (event) => {
                this.lastKnownState = event.data;
                this.updateTrackData();
                this.emit('stateChange', event.data);

                // Handle video end - advance or repeat
                if (event.data === window.YT.PlayerState.ENDED) {
                  this.next();
                }
              },
              onError: (event) => {
                console.warn('[YouTubePlayer] Error occurred:', event.data);
                // 101 or 150: Video owner does not allow embedding
                if (event.data === 101 || event.data === 150 || event.data === 2) {
                  console.info('[YouTubePlayer] Non-embeddable track detected. Auto-skipping to next track...');
                  setTimeout(() => {
                    this.next();
                  }, 500);
                } else {
                  this.emit('error', event.data);
                }
              },
            },
          });
        } catch (e) {
          console.error('[YouTubePlayer] Error creating YT.Player:', e);
          this.isInitializing = false;
        }
      };

      createPlayer();
    });
  }

  startTimeTracking() {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    this.timeUpdateInterval = setInterval(() => {
      if (this.isReady && this.player && typeof this.player.getCurrentTime === 'function') {
        try {
          const currentTime = this.player.getCurrentTime() || 0;
          const duration = this.player.getDuration() || 0;
          this.emit('timeUpdate', { currentTime, duration });
        } catch {
          // Player might be re-buffering
        }
      }
    }, 250);
  }

  updateTrackData() {
    if (!this.isReady || !this.player || typeof this.player.getVideoData !== 'function') return;
    try {
      const data = this.player.getVideoData();
      const duration = this.player.getDuration() || 0;
      const index = typeof this.player.getPlaylistIndex === 'function' ? this.player.getPlaylistIndex() : 0;
      const playlist = typeof this.player.getPlaylist === 'function' ? this.player.getPlaylist() : [];

      if (data && (data.video_id || data.title)) {
        const videoId = data.video_id;
        const thumbnail = videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : null;

        this.currentVideoData = {
          title: data.title || 'Udaipur Ambient Sound',
          author: data.author || 'Udaipur Music',
          videoId: videoId,
          thumbnail: thumbnail,
          duration: duration,
          index: index,
          playlistLength: playlist ? playlist.length : 0,
        };
        this.emit('trackChange', this.currentVideoData);
      }
    } catch {
      // Ignored
    }
  }

  play() {
    if (!this.isReady || !this.player) {
      this.pendingPlay = true;
      return;
    }
    try {
      if (typeof this.player.playVideo === 'function') {
        this.player.playVideo();
      }
    } catch (e) {
      console.error('[YouTubePlayer] playVideo failed:', e);
    }
  }

  pause() {
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.pauseVideo === 'function') {
        this.player.pauseVideo();
      }
    } catch (e) {
      console.error('[YouTubePlayer] pauseVideo failed:', e);
    }
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.nextVideo === 'function') {
        this.player.nextVideo();
        setTimeout(() => this.updateTrackData(), 600);
      }
    } catch (e) {
      console.error('[YouTubePlayer] nextVideo failed:', e);
    }
  }

  previous() {
    if (!this.isReady || !this.player) return;
    try {
      // If we are more than 3 seconds into the track, restart it first
      const curr = this.getCurrentTime();
      if (curr > 3) {
        this.seek(0);
      } else if (typeof this.player.previousVideo === 'function') {
        this.player.previousVideo();
        setTimeout(() => this.updateTrackData(), 600);
      }
    } catch (e) {
      console.error('[YouTubePlayer] previousVideo failed:', e);
    }
  }

  playTrackAt(index) {
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.playVideoAt === 'function') {
        this.player.playVideoAt(index);
        setTimeout(() => this.updateTrackData(), 600);
      }
    } catch (e) {
      console.error('[YouTubePlayer] playVideoAt failed:', e);
    }
  }

  seek(seconds) {
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.seekTo === 'function') {
        this.player.seekTo(seconds, true);
      }
    } catch (e) {
      console.error('[YouTubePlayer] seekTo failed:', e);
    }
  }

  setVolume(percent) {
    if (!this.isReady || !this.player) return;
    try {
      if (typeof this.player.setVolume === 'function') {
        this.player.setVolume(Math.max(0, Math.min(100, percent)));
      }
    } catch (e) {
      console.error('[YouTubePlayer] setVolume failed:', e);
    }
  }

  getVolume() {
    if (!this.isReady || !this.player) return 100;
    try {
      return typeof this.player.getVolume === 'function' ? this.player.getVolume() : 100;
    } catch {
      return 100;
    }
  }

  getCurrentTime() {
    if (!this.isReady || !this.player) return 0;
    try {
      return typeof this.player.getCurrentTime === 'function' ? this.player.getCurrentTime() : 0;
    } catch {
      return 0;
    }
  }

  getDuration() {
    if (!this.isReady || !this.player) return 0;
    try {
      return typeof this.player.getDuration === 'function' ? this.player.getDuration() : 0;
    } catch {
      return 0;
    }
  }

  isPlaying() {
    return this.lastKnownState === 1; // YT.PlayerState.PLAYING
  }

  getState() {
    return this.lastKnownState;
  }

  getVideoData() {
    return this.currentVideoData;
  }

  destroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch {
        // Ignored
      }
    }
    this.player = null;
    this.isReady = false;
  }
}

// Singleton instance
export const youtubePlayer = new YouTubePlayerService();
export default youtubePlayer;
