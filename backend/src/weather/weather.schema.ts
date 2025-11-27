import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema()
class Location {
  @Prop() lat: string;
  @Prop() lon: string;
}

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  wind_speed: number;

  @Prop()
  condition_code: number;

  @Prop()
  rain_probability: number;

  @Prop({ type: Location })
  location: Location;

  createdAt: Date;
  updatedAt: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
