import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb://admin:gdash_secret@mongo:27017/gdash?authSource=admin',
    ),
    WeatherModule,
  ],
})
export class AppModule {}
