import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatentsService } from './patents.service';
import { PatentsController } from './patents.controller';
import { Patent, PatentSchema } from './schemas/patent.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patent.name, schema: PatentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [PatentsController],
  providers: [PatentsService],
  exports: [PatentsService],
})
export class PatentsModule {}
