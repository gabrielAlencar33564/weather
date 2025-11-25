import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherDocument } from './weather.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: any): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(data);
    return createdLog.save();
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }
}
