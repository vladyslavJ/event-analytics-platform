import { NestFactory } from '@nestjs/core';
import { ReporterModule } from './reporter.module';

async function bootstrap() {
  const app = await NestFactory.create(ReporterModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
