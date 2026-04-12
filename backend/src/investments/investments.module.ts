import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { Investment, InvestmentSchema } from './schemas/investment.schema';
import { Patent, PatentSchema } from '../patents/schemas/patent.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: Patent.name, schema: PatentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
