/**
 * Error Simulator Middleware
 *
 * Controlled error injection for New Relic change tracking demos.
 * Behaviour is driven entirely by environment variables — flip a scenario
 * in your .env.scenario-* file and restart to change the error profile.
 *
 * Env vars:
 *   ERROR_SCENARIO  - none | low | high | db   (default: none)
 *   ERROR_RATE      - 0-100  % of requests to fail (default: 0)
 *   SLOW_RESPONSE_MS - max artificial delay in ms before responding (default: 0)
 */

const logger = require('../logger');

const SCENARIO       = (process.env.ERROR_SCENARIO  || 'none').toLowerCase();
const ERROR_RATE     = parseInt(process.env.ERROR_RATE      || '0', 10);
const SLOW_RESPONSE  = parseInt(process.env.SLOW_RESPONSE_MS || '0', 10);

// Log active state once at startup
if (SCENARIO !== 'none') {
  logger.error(
    `[ErrorSim] ACTIVE — scenario: ${SCENARIO} | error-rate: ${ERROR_RATE}% | slow-response: ${SLOW_RESPONSE}ms`
  );
} else {
  logger.info('[ErrorSim] Inactive — no error injection (scenario: none)');
}

function shouldTrigger() {
  return Math.random() * 100 < ERROR_RATE;
}

function pickErrorResponse(res) {
  switch (SCENARIO) {
    case 'low': {
      // Mostly 500s, occasional 503
      const code = Math.random() < 0.7 ? 500 : 503;
      return res.status(code).json({
        message: `Simulated server error [${SCENARIO}]`,
        scenario: SCENARIO,
        statusCode: code
      });
    }

    case 'high': {
      // Spread across 500/502/503/504
      const codes = [500, 500, 502, 503, 504];
      const code   = codes[Math.floor(Math.random() * codes.length)];
      return res.status(code).json({
        message: `Simulated server error [${SCENARIO}]`,
        scenario: SCENARIO,
        statusCode: code
      });
    }

    case 'db': {
      return res.status(500).json({
        message: 'Database connection error: connection pool exhausted',
        error:   'ECONNREFUSED',
        scenario: SCENARIO,
        statusCode: 500
      });
    }

    default:
      return null; // should never reach here
  }
}

function errorSimulator(req, res, next) {
  if (SCENARIO === 'none') return next();

  const jitter = SLOW_RESPONSE > 0 ? Math.floor(Math.random() * SLOW_RESPONSE) : 0;

  const apply = () => {
    if (!shouldTrigger()) return next();

    logger.error(
      `[ErrorSim:${SCENARIO}] Injecting error — ${req.method} ${req.path} (rate: ${ERROR_RATE}%)`
    );

    pickErrorResponse(res);
  };

  if (jitter > 0) {
    setTimeout(apply, jitter);
  } else {
    apply();
  }
}

module.exports = errorSimulator;
