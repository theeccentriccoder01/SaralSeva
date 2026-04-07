// backend/middleware/rateLimiting/rateLimiterConfig.js
export default {
  strict: {
    points: 30,
    duration: 60,
  },
  moderate: {
    points: 100,
    duration: 60,
  },
  light: {
    points: 300,
    duration: 60,
  },
};
