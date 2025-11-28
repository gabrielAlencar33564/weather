import { type Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WeatherService } from './services';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { JwtAuthGuard } from 'src/auth/guards';
import {
  ApiWeatherCreate,
  ApiWeatherExport,
  ApiWeatherFindAll,
  ApiWeatherInsights,
} from './weather.swagger';

@ApiTags('Weather')
@ApiBearerAuth()
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiWeatherCreate()
  @Post()
  async create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @ApiWeatherFindAll()
  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.weatherService.findAll(limit, offset);
  }

  @ApiWeatherInsights()
  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async getInsights() {
    return this.weatherService.getSmartAnalysis('Palmeiras - BA');
  }

  @ApiWeatherExport('xlsx')
  @UseGuards(JwtAuthGuard)
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

  @ApiWeatherExport('csv')
  @UseGuards(JwtAuthGuard)
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
