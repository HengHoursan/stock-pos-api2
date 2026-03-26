import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeds } from '../../db/seed';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    // Only run seeds if explicitly enabled via environment variable
    // or you can check if the database is empty
    if (process.env.RUN_SEEDS === 'true') {
      try {
        await runSeeds(this.dataSource);
      } catch (error) {
        console.error('❌ Seeding failed:', error);
      }
    }
  }
}
