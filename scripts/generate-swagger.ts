import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable logging during generation
  });

  const config = new DocumentBuilder()
    .setTitle('Chore Tracker API')
    .setDescription('Firebase proxy API for chore tracking application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Firebase ID token',
      },
      'firebase-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Write the swagger spec to a JSON file
  writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  console.log('✅ Swagger documentation generated: swagger-spec.json');

  await app.close();
  process.exit(0);
}

generateSwagger().catch((err) => {
  console.error('❌ Error generating Swagger documentation:', err);
  process.exit(1);
});
