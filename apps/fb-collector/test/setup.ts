// Jest setup file for fb-collector tests
import 'reflect-metadata';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.FB_COLLECTOR_PORT = '3002';
process.env.NATS_SERVERS = 'nats://localhost:4222';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test timeout
jest.setTimeout(10000);

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
