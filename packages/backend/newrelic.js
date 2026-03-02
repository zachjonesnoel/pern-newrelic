'use strict'
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['my-instruct-lab-apm-express'],
  /**
   * Your New Relic license key.
   */
  license_key: 'YOUR_LICENSE_KEY',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, regardless of the security level
   */
  allow_all_headers: true,
  application_logging: {
    forwarding: {
      /**
       * Toggles whether the agent gathers log records for sending to New Relic.
       */
      enabled: true
    }
  },
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     */
    enabled: true
  },
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  /**
   * Transaction tracer settings
   */
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
    explain_threshold: 500
  },
  /**
   * Environment-specific settings
   */
  rules: {
    name: [
      { pattern: /^\/api\/tutorials$/, name: '/api/tutorials' },
      { pattern: /^\/api\/tutorials\/\w+$/, name: '/api/tutorials/:id' },
      { pattern: /^\/api\/tutorials\/\w+\/published$/, name: '/api/tutorials/:id/published' },
      { pattern: /^\/api\/tutorials\/categories$/, name: '/api/tutorials/categories' }
    ]
  }
}
