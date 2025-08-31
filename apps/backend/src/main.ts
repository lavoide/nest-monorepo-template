import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as ngrok from 'ngrok';
import { AppModule } from './app.module';
import { DOCUMENT_BUILDER_CONFIG_JWT } from './auth/auth.constants';
import * as fs from 'fs';

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

  const config = new DocumentBuilder()
    .setTitle('App')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth(DOCUMENT_BUILDER_CONFIG_JWT, 'JWT-auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // Start ngrok tunnel in development mode
  if (process.env.NODE_ENV === 'development') {
    try {
      const url = await ngrok.connect({
        addr: port,
        authtoken: process.env.NGROK_AUTH_TOKEN,
      });
      console.log(`Ngrok tunnel is running at: ${url}`);

      const frontendPath = '../front-activities';
      const files = ['.env.dev', '.env.prod'];

      for (const file of files) {
        const envPath = `${frontendPath}/${file}`;
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          // Replace existing EXPO_PUBLIC_API_URL or add it if it doesn't exist
          const newUrl = `EXPO_PUBLIC_API_URL=${url}`;
          envContent = envContent.replace(/^EXPO_PUBLIC_API_URL=.*$/m, newUrl);
          if (!envContent.includes('EXPO_PUBLIC_API_URL')) {
            envContent += `\n${newUrl}`;
          }
          fs.writeFileSync(envPath, envContent);
          console.log(`Updated ${file} with ngrok URL`);
        }
      }
    } catch (err) {
      console.error('Ngrok tunnel failed to start:', err);
    }
  }

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
