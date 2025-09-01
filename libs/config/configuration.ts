export default () => ({
  grafana: {
    port: parseInt(process.env.GRAFANA_PORT ?? '3000', 10),
  },
  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT ?? '9090', 10),
  },
  reporter: {
    port: parseInt(process.env.REPORTER_PORT ?? '3000', 10),
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
  },
});
