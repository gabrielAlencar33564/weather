import {
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  lon: string;
}

class SensorDataDto {
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @IsNumber()
  @IsNotEmpty()
  condition_code: number;
}

class AiAnalysisDto {
  @IsString()
  @IsNotEmpty()
  insight: string;

  @IsString()
  @IsNotEmpty()
  severity: string;
}

class MetadataDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsNumber()
  @IsNotEmpty()
  timestamp: number;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location: LocationDto;
}

export class CreateWeatherDto {
  @ValidateNested()
  @Type(() => SensorDataDto)
  @IsNotEmpty()
  sensor_data: SensorDataDto;

  @ValidateNested()
  @Type(() => AiAnalysisDto)
  @IsNotEmpty()
  ai_analysis: AiAnalysisDto;

  @ValidateNested()
  @Type(() => MetadataDto)
  @IsNotEmpty()
  metadata: MetadataDto;
}
