import { Injectable, Scope } from '@nestjs/common';
import { LoggerInterface } from './interfaces/logger.interface';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements LoggerInterface {
  private context = 'App';
  private logDir = path.resolve(process.cwd(), 'logs');
  private samplingRate: number;

  constructor(private readonly configService: ConfigService) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.samplingRate = this.configService.get<number>('logger.samplingRate', 0.3);
  }

  setContext(context: string) {
    this.context = context;
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(): boolean {
    return Math.random() < this.samplingRate;
  }

  private writeToFile(level: string, message: string) {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(this.logDir, `${level}-${date}.log`);
    const logLine = `[${this.timestamp()}] [${level.toUpperCase()}] [${this.context}] ${message}\n`;
    fs.appendFile(filePath, logLine, err => {
      if (err) console.error('Logger file write failed', err);
    });
  }

  info(message: string) {
    if (this.shouldLog()) {
      const logMsg = `[${this.timestamp()}] [INFO] [${this.context}] ${message}`;
      console.info(logMsg);
      this.writeToFile('info', message);
    }
  }

  warn(message: string) {
    const logMsg = `[${this.timestamp()}] [WARN] [${this.context}] ${message}`;
    console.warn(logMsg);
    this.writeToFile('warn', message);
  }

  error(message: string, trace?: string) {
    const logMsg =
      `[${this.timestamp()}] [ERROR] [${this.context}] ${message}` + (trace ? `\n${trace}` : '');
    console.error(logMsg);
    this.writeToFile('error', logMsg);
  }

  debug(message: string) {
    if (process.env.DEBUG === 'true') {
      const logMsg = `[${this.timestamp()}] [DEBUG] [${this.context}] ${message}`;
      console.debug(logMsg);
      this.writeToFile('debug', message);
    }
  }
}
