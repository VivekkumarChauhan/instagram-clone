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

// Update this to your deployed Render URL once live
const RENDER_URL = 'https://lumigram-api.onrender.com';

// In development:
// - Physical device with `adb reverse tcp:5000 tcp:5000`: 'http://localhost:5000'
// - Over local Wi-Fi without ADB: 'http://10.183.70.205:5000'
const DEV_URL = 'http://localhost:5000';

const BASE = __DEV__ ? DEV_URL : RENDER_URL;

export const API_BASE_URL = `${BASE}/v1`;
export const SOCKET_URL = BASE;
