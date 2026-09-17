import { Module } from '@nestjs/common';
import { LoanApplicationsController } from './loan-applications.controller';
import { LoanApplicationsService } from './loan-applications.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LoanApplicationsController],
  providers: [LoanApplicationsService]
})
export class LoanApplicationsModule {}
