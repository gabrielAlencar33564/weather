import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  lat: string;

  @IsString()
  lon: string;
}

export class CreateWeatherDto {
  @IsString()
  city: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  @IsOptional()
  wind_speed: number;

  @IsNumber()
  condition_code: number;

  @IsNumber()
  rain_probability: number;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  timestamp: string;
}
