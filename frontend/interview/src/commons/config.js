export const CONFIG = {
  /*
   * Local Configs
   */
  // DOMAIN: "localhost",
  // AUTH_FRONTEND_URL: "http://localhost:3000",
  // APP_FRONTEND_URL: "http://localhost:3001/app",
  // APP_BACKEND_URL: "http://localhost:8000",
  // LINGUISTICS_BACKEND_URL: "http://localhost:8001",
  // LINGUISTICS_WEBSOCKET_URL: "ws://localhost:8001",
  // UPLOAD_BACKEND_URL: "http://localhost:8002",

  /*
   * Production Configs
   */
  DOMAIN: "cognatoai.com",
  AUTH_FRONTEND_URL: "https://cognatoai.com",
  APP_FRONTEND_URL: "https://cognatoai.com/app",
  APP_BACKEND_URL: "https://sora.cognatoai.com",
  LINGUISTICS_BACKEND_URL: "https://yume.cognatoai.com",
  LINGUISTICS_WEBSOCKET_URL: "wss://yume.cognatoai.com",
  UPLOAD_BACKEND_URL: "https://mizu.cognatoai.com",


  DEFAULT_VIDEO_MIME_TYPE: 'video/mp4; codecs=avc1.42E01E,mp4a.40.2',
  DEFAULT_AUDIO_MIME_TYPE: 'audio/webm;codecs=opus'
};

export const settings = {
  liveTranscript: {
    enabled: false,
    chunkSize: 2,
    websocket: false,
  },
  fullTranscript: {
    enabled: false,
  },
  e2ePipeline: {
    enabled: true,
    audio: {
      stream: true,
      chunk: 5000,
    }
  },
  speak: {
    enabled: true,
    playbackRate: 1.0,
  },
  listen: {
    auto: false,
  },
  camera: {
    enabled: false,
  },

};
