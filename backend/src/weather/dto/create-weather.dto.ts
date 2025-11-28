import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ example: '-12.5156', description: 'Latitude' })
  @IsString()
  lat: string;

  @ApiProperty({ example: '-41.5648', description: 'Longitude' })
  @IsString()
  lon: string;
}

export class CreateWeatherDto {
  @ApiProperty({ example: 'Palmeiras - BA', description: 'Nome da cidade' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 28.5, description: 'Temperatura em graus Celsius' })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 60, description: 'Umidade relativa do ar (%)' })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: 12.5, description: 'Velocidade do vento (km/h)' })
  @IsNumber()
  wind_speed: number;

  @ApiProperty({
    example: 1000,
    description: 'Código da condição climática (ex: WeatherAPI)',
  })
  @IsNumber()
  condition_code: number;

  @ApiProperty({ example: 10, description: 'Probabilidade de chuva (%)' })
  @IsNumber()
  rain_probability: number;

  @ApiProperty({ type: LocationDto, description: 'Coordenadas geográficas' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    example: '2025-11-27T10:00:00.000Z',
    description: 'Data/Hora da coleta',
  })
  @IsString()
  timestamp: string;
}
