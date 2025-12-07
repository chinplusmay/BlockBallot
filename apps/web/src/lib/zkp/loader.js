/**
 * ZK Circuit Loader
 * Handles lazy loading of WASM and ZKey files for proof generation
 */

// Cache for loaded circuit files
let circuitCache = null;

// Loading state
let isLoading = false;
let loadingPromise = null;

/**
 * Fetches a file with progress tracking
 */
async function fetchWithProgress(
  url,
  onProgress
) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    return response.arrayBuffer();
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
    loaded += value.length;

    if (onProgress && total > 0) {
      onProgress(loaded, total);
    }
  }

  // Combine chunks into single ArrayBuffer
  const result = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}

/**
 * Load ZK circuit files (WASM and ZKey)
 * Uses caching to avoid reloading on subsequent calls
 */
export async function loadCircuit(onProgress) {
  // Return cached circuit if available
  if (circuitCache) {
    onProgress?.(100, 'Using cached circuit');
    return circuitCache;
  }

  // Return existing loading promise if already loading
  if (isLoading && loadingPromise) {
    return loadingPromise;
  }

  isLoading = true;

  loadingPromise = (async () => {
    try {
      onProgress?.(0, 'Loading WASM circuit...');

      // Load WASM file
      const wasm = await fetchWithProgress('/zkp/vote.wasm', (loaded, total) => {
        const progress = Math.round((loaded / total) * 40);
        onProgress?.(progress, 'Loading WASM circuit...');
      });

      onProgress?.(40, 'Loading proving key...');

      // Load ZKey file
      const zkey = await fetchWithProgress('/zkp/vote_final.zkey', (loaded, total) => {
        const progress = 40 + Math.round((loaded / total) * 60);
        onProgress?.(progress, 'Loading proving key...');
      });

      onProgress?.(100, 'Circuit loaded successfully');

      // Cache the loaded files
      circuitCache = { wasm, zkey };

      return circuitCache;
    } catch (error) {
      // Reset loading state on error
      isLoading = false;
      loadingPromise = null;
      throw error;
    } finally {
      isLoading = false;
    }
  })();

  return loadingPromise;
}

/**
 * Check if circuit is already cached
 */
export function isCircuitCached() {
  return circuitCache !== null;
}

/**
 * Clear the circuit cache (useful for testing or memory management)
 */
export function clearCircuitCache() {
  circuitCache = null;
  loadingPromise = null;
  isLoading = false;
}

/**
 * Preload circuit files in the background
 */
export function preloadCircuit() {
  if (!circuitCache && !isLoading) {
    loadCircuit().catch((error) => {
      console.warn('Failed to preload circuit:', error);
    });
  }
}
