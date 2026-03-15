import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ActivitiesModule } from './modules/activities/activities.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://user1:SfrAS1RAa2JHD8Ln@cluster0.3uvoybs.mongodb.net/ActiMate'),
    AuthModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
