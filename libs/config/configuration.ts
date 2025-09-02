export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
    bodyLimit: process.env.BODY_SIZE_LIMIT || '50mb',
    rateLimit: parseInt(process.env.RATE_LIMIT ?? '1000', 10),
  },
  grafana: {
    port: parseInt(process.env.GRAFANA_PORT ?? '3000', 10),
  },
  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT ?? '9090', 10),
  },
  reporter: {
    port: parseInt(process.env.REPORTER_PORT ?? '3001', 10),
  },
  gateway: {
    port: parseInt(process.env.GATEWAY_PORT ?? '3000', 10),
  },
  fbCollector: {
    port: parseInt(process.env.FB_COLLECTOR_PORT ?? '3010', 10),
  },
  ttkCollector: {
    port: parseInt(process.env.TTK_COLLECTOR_PORT ?? '3020', 10),
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'events_db',
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@postgres:5432/events_db?schema=public',
  },
  nats: {
    port: parseInt(process.env.NATS_PORT ?? '4222', 10),
    url: process.env.NATS_URL || 'nats://nats:4222',
    maxReconnectAttempts: parseInt(process.env.NATS_MAX_RECONNECT_ATTEMPTS ?? '10', 10),
    reconnectTimeWait: parseInt(process.env.NATS_RECONNECT_TIME_WAIT ?? '2000', 10),
    timeout: parseInt(process.env.NATS_TIMEOUT ?? '10000', 10),
    pingInterval: parseInt(process.env.NATS_PING_INTERVAL ?? '60000', 10),
    maxPingOut: parseInt(process.env.NATS_MAX_PING_OUT ?? '5', 10),
  },
  logger: {
    samplingRate: parseFloat(process.env.LOGGER_SAMPLING_RATE ?? '0.3'),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  collectors: {
    connectRetries: parseInt(process.env.COLLECTOR_CONNECT_RETRIES ?? '5', 10),
    connectDelay: parseInt(process.env.COLLECTOR_CONNECT_DELAY ?? '5000', 10),
  },
  health: {
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT ?? '5000', 10),
  },
  publisher: {
    eventEndpoint: process.env.EVENT_ENDPOINT || 'http://gateway:3000/events',
  },
  security: {
    enableCors: process.env.ENABLE_CORS !== 'false',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },
  monitoring: {
    enableMetricsCollection: process.env.ENABLE_METRICS_COLLECTION === 'true',
    metricsRetentionDays: parseInt(process.env.METRICS_RETENTION_DAYS ?? '7', 10),
    enableAlerts: process.env.ENABLE_ALERTS === 'true',
    alertWebhookUrl: process.env.ALERT_WEBHOOK_URL,
  },
});
