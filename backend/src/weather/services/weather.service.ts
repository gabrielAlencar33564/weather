import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Weather, WeatherDocument } from '../weather.schema';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import { WeatherAiService } from './weather-ai.service';
import { WeatherLoggerHelper, WeatherMessagesHelper } from '../helpers';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
    private weatherAiService: WeatherAiService,
  ) {}

  async create(data: CreateWeatherDto): Promise<Weather> {
    this.logger.log(WeatherLoggerHelper.PROCESSING_DATA);

    const { timestamp, ...rest } = data;
    const createdLog = new this.weatherModel({
      ...rest,
      createdAt: new Date(timestamp),
    });

    const saved = await createdLog.save();

    this.logger.debug(WeatherLoggerHelper.SAVED_SUCCESS);

    return saved;
  }

  async findAll(limit: number = 10, offset: number = 0) {
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.weatherModel.countDocuments();
    const currentPage = Math.floor(offset / limit) + 1;

    this.logger.debug(
      WeatherLoggerHelper.FIND_ALL_DEBUG(currentPage, data.length),
    );

    return {
      data,
      meta: {
        total,
        offset: offset,
        limit: limit,
        last_page: Math.ceil(total / limit),
        current_page: currentPage,
      },
    };
  }

  async getSmartAnalysis(city: string) {
    this.logger.log(WeatherLoggerHelper.SEARCHING_HISTORY(city));

    const history = await this.weatherModel
      .find({ city })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    if (!history.length) {
      this.logger.warn(WeatherLoggerHelper.CITY_NOT_FOUND_WARN(city));

      throw new NotFoundException(WeatherMessagesHelper.CITY_NOT_FOUND);
    }

    const analysis = await this.weatherAiService.analyzeHistory(history);

    return {
      city,
      current_data: history[0],
      analysis: analysis,
      history_sample: history.length,
      message: WeatherMessagesHelper.GET_ANALYSIS_SUCCESS,
    };
  }

  async exportExcel() {
    this.logger.log(WeatherLoggerHelper.EXPORT_START);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clima');

    sheet.columns = [
      { header: 'Data/Hora', key: 'date', width: 25 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Temp (°C)', key: 'temp', width: 10 },
      { header: 'Umidade (%)', key: 'hum', width: 12 },
      { header: 'Vento (km/h)', key: 'wind', width: 12 },
      { header: 'Condição', key: 'cond', width: 10 },
      { header: 'Chuva (%)', key: 'rain', width: 10 },
    ];

    const logs: WeatherDocument[] = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    logs.forEach((log) => {
      sheet.addRow({
        date: log.createdAt?.toISOString(),
        city: log.city,
        temp: log.temperature,
        hum: log.humidity,
        wind: log.wind_speed,
        cond: log.condition_code,
        rain: log.rain_probability,
      });
    });

    this.logger.log(WeatherLoggerHelper.EXPORT_DONE);

    return workbook;
  }
}
