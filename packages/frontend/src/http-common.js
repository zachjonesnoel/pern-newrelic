import axios from "axios";

const APIUrl = `${import.meta.env.VITE_APP_API_URL}`;

const http = axios.create({
  baseURL: APIUrl,
  headers: {
    "Content-type": "application/json",
  }
});

// ─── Frontend Error Simulation ───────────────────────────────────────────────
// Controlled by VITE_ERROR_SCENARIO / VITE_ERROR_RATE / VITE_SLOW_RESPONSE_MS.
// Set these in your .env.scenario-* file and restart the dev server.
const FE_SCENARIO = (import.meta.env.VITE_ERROR_SCENARIO   || 'none').toLowerCase();
const FE_RATE     = parseInt(import.meta.env.VITE_ERROR_RATE       || '0', 10);
const FE_SLOW_MS  = parseInt(import.meta.env.VITE_SLOW_RESPONSE_MS || '0', 10);

if (FE_SCENARIO !== 'none') {
  console.warn(
    `[FE ErrorSim] ACTIVE — scenario: ${FE_SCENARIO} | error-rate: ${FE_RATE}% | slow-response: ${FE_SLOW_MS}ms`
  );

  // Randomly fail outgoing requests before they leave the browser
  http.interceptors.request.use((config) => {
    if (Math.random() * 100 < FE_RATE) {
      const err = new Error(`Simulated network error [${FE_SCENARIO}]`);
      err.isSimulated = true;
      console.error(`[FE ErrorSim:${FE_SCENARIO}] Injecting request error on ${config.url}`);
      return Promise.reject(err);
    }
    return config;
  });

  // Add artificial latency to successful responses
  if (FE_SLOW_MS > 0) {
    http.interceptors.response.use((response) => {
      const delay = Math.floor(Math.random() * FE_SLOW_MS);
      return new Promise((resolve) => setTimeout(() => resolve(response), delay));
    });
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default http;
