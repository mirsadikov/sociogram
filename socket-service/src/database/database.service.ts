import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
  }

  async query(queryText: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(queryText, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
