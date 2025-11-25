import { Controller, Get, Post, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  async create(@Body() createWeatherDto: any) {
    console.log('📥 [API] Recebendo dados do Worker Go...');
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  async findAll() {
    return this.weatherService.findAll();
  }
}
