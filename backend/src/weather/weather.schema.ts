import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<WeatherLog>;

export class SensorData {
  @Prop({ required: true })
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  condition_code: number;

  @Prop()
  wind_speed: number;
}

export class AiAnalysis {
  @Prop()
  insight: string;

  @Prop()
  severity: string;
}

export class Metadata {
  @Prop()
  city: string;

  @Prop()
  source: string;
}

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ type: SensorData, _id: false })
  sensor_data: SensorData;

  @Prop({ type: AiAnalysis, _id: false })
  ai_analysis: AiAnalysis;

  @Prop({ type: Metadata, _id: false })
  metadata: Metadata;
}

export const WeatherSchema = SchemaFactory.createForClass(WeatherLog);
