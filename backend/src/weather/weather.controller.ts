import type { Response } from 'express';
import { Controller, Get, Post, Body, Res, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  async create(@Body() createWeatherDto: CreateWeatherDto) {
    console.log('📥 [API] Recebido log do Worker Go');
    return this.weatherService.create(createWeatherDto);
  }

  @Get('logs')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.weatherService.findAll(Number(page), Number(limit));
  }

  @Get('insights')
  async getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const workbook = await this.weatherService.exportExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_data.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const workbook = await this.weatherService.exportExcel();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_data.csv',
    );

    await workbook.csv.write(res);
    res.end();
  }
}
