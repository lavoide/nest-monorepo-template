import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DOCUMENT_BUILDER_CONFIG_JWT } from './auth/auth.constants';
import { validationExceptionFactory } from './common/exceptions/validation-exception.factory';
import { ReportableExceptionFilter } from './exception-filters/reportable-exception.filter';
import { PrismaExceptionsFilter } from './exception-filters/prisma-exceptions.filter';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  });
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new PrismaExceptionsFilter(),
    new ReportableExceptionFilter(),
  );

  const config = new DocumentBuilder()
    .setTitle('App')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth(DOCUMENT_BUILDER_CONFIG_JWT, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Uncomment to enable Swagger UI
  // SwaggerModule.setup('swagger', app, document);

  // Scalar API Reference UI
  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
