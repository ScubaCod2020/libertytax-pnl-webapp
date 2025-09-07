module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      startServerReadyPattern: 'ready in',
      startServerReadyTimeout: 30000,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.8}],
        'categories:pwa': 'off', // Disable PWA checks for now
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}],
        'first-contentful-paint': ['error', {maxNumericValue: 1800}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'max-potential-fid': ['error', {maxNumericValue: 100}],
        
        // Other important metrics
        'speed-index': ['error', {maxNumericValue: 3000}],
        'interactive': ['error', {maxNumericValue: 3500}],
        
        // Bundle size
        'total-byte-weight': ['warn', {maxNumericValue: 512000}], // 500KB
        'unused-javascript': ['warn', {maxNumericValue: 40000}],  // 40KB
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}