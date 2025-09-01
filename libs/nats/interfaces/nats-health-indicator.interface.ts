import { HealthIndicatorResult } from "@nestjs/terminus";

export interface NatsHealthIndicatorInterface {
  isHealthy(key: string): Promise<HealthIndicatorResult>;
}
