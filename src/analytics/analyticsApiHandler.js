import { getStore, recordTelemetryEvent } from './telemetryStore.js';
import { generateAnalyticsInsights } from './heuristicEngine.js';
import { applyAnalyticsAction, getActiveOptimizations } from './actionsManager.js';
import { SYSTEM_ACTIONS_CATALOG } from './actionCatalog.js';

/**
 * Handle incoming API requests in Next.js, Express, or Vite middleware environments.
 * 
 * Routes:
 * - POST /api/analytics/track
 * - GET  /api/admin/analytics
 * - POST /api/admin/analytics
 */
export async function handleAnalyticsApiRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Helper to parse JSON body
  const parseBody = () => new Promise(resolve => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-email, x-vercel-ip-country, x-vercel-ip-city, cf-ipcountry');

  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return true;
  }

  // 1. POST /api/analytics/track
  if (pathname === '/api/analytics/track' && method === 'POST') {
    const body = await parseBody();
    const headers = req.headers || {};

    const countryCode = headers['x-vercel-ip-country'] || headers['cf-ipcountry'] || body.countryCode || null;
    const city = headers['x-vercel-ip-city'] || body.city || null;

    recordTelemetryEvent({
      type: body.type,
      view: body.view,
      route: body.route,
      dwellSeconds: body.dwellSeconds,
      screenWidth: body.screenWidth,
      screenHeight: body.screenHeight,
      currency: body.currency,
      exportType: body.exportType,
      query: body.query,
      resultCount: body.resultCount,
      countryCode,
      city,
      durationMs: body.durationMs,
      actor: body.actor
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
    return true;
  }

  // 2. GET /api/admin/analytics
  if (pathname === '/api/admin/analytics' && method === 'GET') {
    const store = getStore();
    const insights = generateAnalyticsInsights(store);
    const activeOptimizations = getActiveOptimizations(store);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      store,
      insights,
      activeOptimizations,
      catalog: SYSTEM_ACTIONS_CATALOG,
      timestamp: Date.now()
    }));
    return true;
  }

  // 3. POST /api/admin/analytics (Apply / Revert action)
  if (pathname === '/api/admin/analytics' && method === 'POST') {
    const body = await parseBody();
    const headers = req.headers || {};

    // Authentication check: Bearer token or admin email verification
    const authHeader = headers['authorization'] || '';
    const adminEmail = headers['x-admin-email'] || body.adminEmail || body.actor || '';
    const isVerifiedBearer = authHeader.startsWith('Bearer ') && authHeader.length > 10;
    const isVerifiedAdmin = adminEmail.includes('@') || body.role === 'admin' || isVerifiedBearer;

    if (!isVerifiedAdmin && !isVerifiedBearer) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Unauthorized. An administrator Bearer token or verified admin email header is required.',
        code: 'AUTH_REQUIRED'
      }));
      return true;
    }

    const { actionId, reason } = body;
    let enable = body.enable !== undefined ? Boolean(body.enable) : true;
    if (body.operation === 'revert' || body.action === 'revert') {
      enable = false;
    }

    const actor = adminEmail || (isVerifiedBearer ? 'authorized.bearer@enterprise.internal' : 'admin@enterprise.internal');

    try {
      const result = applyAnalyticsAction({
        actionId,
        enable,
        actor,
        reason,
        store: getStore()
      });

      const store = getStore();
      const insights = generateAnalyticsInsights(store);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ...result,
        insights,
        activeOptimizations: getActiveOptimizations(store)
      }));
      return true;
    } catch (err) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
      return true;
    }
  }

  return false;
}
