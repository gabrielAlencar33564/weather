import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherAiService, WeatherService } from './services';
import { Weather, WeatherSchema } from './weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAiService],
})
export class WeatherModule {}
