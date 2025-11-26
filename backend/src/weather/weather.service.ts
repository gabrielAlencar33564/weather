import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherDocument } from './weather.schema';
import * as ExcelJS from 'exceljs';
import { WeatherStats } from './weather.interface';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: CreateWeatherDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(data);
    return createdLog.save();
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

  async getInsights() {
    const stats = await this.weatherModel.aggregate<WeatherStats>([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$sensor_data.temperature' },
          avgHum: { $avg: '$sensor_data.humidity' },
          maxTemp: { $max: '$sensor_data.temperature' },
          minTemp: { $min: '$sensor_data.temperature' },
          totalLogs: { $sum: 1 },
        },
      },
    ]);

    const data = stats[0] || {};

    return {
      summary: `Análise baseada em ${data.totalLogs || 0} registros.`,
      metrics: {
        average_temperature: data.avgTemp ? data.avgTemp.toFixed(1) : 0,
        average_humidity: data.avgHum ? data.avgHum.toFixed(1) : 0,
        max_temperature: data.maxTemp,
        min_temperature: data.minTemp,
      },
    };
  }

  async exportExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clima');

    sheet.columns = [
      { header: 'Data/Hora', key: 'date', width: 20 },
      { header: 'Cidade', key: 'city', width: 15 },
      { header: 'Temp (°C)', key: 'temp', width: 10 },
      { header: 'Umidade (%)', key: 'hum', width: 10 },
      { header: 'Condição', key: 'cond', width: 15 },
      { header: 'Insight IA', key: 'insight', width: 30 },
    ];

    const logs = await this.weatherModel.find().sort({ createdAt: -1 }).exec();

    logs.forEach((log) => {
      sheet.addRow({
        date: log.createdAt?.toISOString(),
        city: log.metadata?.city || 'N/A',
        temp: log.sensor_data?.temperature,
        hum: log.sensor_data?.humidity,
        cond: log.sensor_data?.condition_code,
        insight: log.ai_analysis?.insight,
      });
    });

    return workbook;
  }
}
