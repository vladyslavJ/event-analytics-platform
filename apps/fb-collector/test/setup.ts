import 'reflect-metadata';

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

process.env.NODE_ENV = 'test';
process.env.FB_COLLECTOR_PORT = '3002';
process.env.NATS_SERVERS = 'nats://localhost:4222';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});
