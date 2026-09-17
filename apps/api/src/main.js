'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const swagger_1 = require('@nestjs/swagger');
const helmet_1 = __importDefault(require('helmet'));
const app_module_1 = require('./app.module');

async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  app.use((0, helmet_1.default)());
  
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').map((origin) =>
      origin.trim(),
    ) ?? ['http://localhost:5173'],
  });
  app.useGlobalPipes(
    new common_1.ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('Mini Job Queue API')
    .setDescription('API for creating and managing queued jobs')
    .setVersion('1.0')
    .build();
  swagger_1.SwaggerModule.setup(
    'docs',
    app,
    swagger_1.SwaggerModule.createDocument(app, swaggerConfig),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map
