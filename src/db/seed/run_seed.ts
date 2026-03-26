import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../modules/app/app.module';
import { runSeeds } from './index';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🌱 Starting standalone seeder...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const dataSource = app.get(DataSource);
    await runSeeds(dataSource);
    console.log('✅ Seeding successful!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
