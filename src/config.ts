/**
 * Environment-driven API configuration.
 *
 * In development (__DEV__ = true):
 *   - Android Emulator: 10.0.2.2 maps to the host machine's localhost
 *   - Physical Device: update DEV_HOST to your machine's local IP (e.g. 192.168.1.x)
 *
 * In production:
 *   - Points to the Render-deployed backend
 *   - No USB/adb reverse required
 */

// Live deployed Render URL
const RENDER_URL = 'https://instagram-clone-backend-za4z.onrender.com';

// Local development fallback
const DEV_URL = 'http://localhost:5000';

// Set to true to test against live Render backend directly on physical device without ADB
const USE_PRODUCTION_API = true;

const BASE = USE_PRODUCTION_API ? RENDER_URL : (__DEV__ ? DEV_URL : RENDER_URL);

export const API_BASE_URL = `${BASE}/v1`;
export const SOCKET_URL = BASE;
