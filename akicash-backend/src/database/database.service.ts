import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService {
    readonly connection: Knex;
    constructor(private readonly configService : ConfigService){
    this.connection = knex({
      client: 'mysql2',
      connection: {
        host: this.configService.getOrThrow<string>('DB_HOST'),
        port: Number(this.configService.getOrThrow<string>('DB_PORT')),
        user: this.configService.getOrThrow<string>('DB_USER'),
        password: this.configService.getOrThrow<string>('DB_PASSWORD'),
        database: this.configService.getOrThrow<string>('DB_NAME'),
      },
    });
    }
}
