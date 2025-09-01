export interface LoggerInterface {
  setContext(context: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, trace?: unknown): void;
  debug(message: string): void;
}
