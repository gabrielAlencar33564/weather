import { ApiProperty } from '@nestjs/swagger';

export class WeatherEntity {
  @ApiProperty({ example: '67464abc123...' })
  _id: string;

  @ApiProperty({ example: 'Palmeiras - BA' })
  city: string;

  @ApiProperty({ example: 28.5 })
  temperature: number;

  @ApiProperty({ example: 60 })
  humidity: number;

  @ApiProperty({ example: 12.5 })
  wind_speed: number;

  @ApiProperty({ example: 1000 })
  condition_code: number;

  @ApiProperty({ example: 0 })
  rain_probability: number;

  @ApiProperty({ example: { lat: '-12.5', lon: '-41.5' } })
  location: { lat: string; lon: string };

  @ApiProperty()
  createdAt: Date;
}

class MetaData {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: 1 })
  current_page: number;
}

export class WeatherPaginationResponse {
  @ApiProperty({ type: [WeatherEntity] })
  data: WeatherEntity[];

  @ApiProperty({ type: MetaData })
  meta: MetaData;
}

export class AiAnalysisResult {
  @ApiProperty({
    example: 'O clima está estável e dentro dos padrões normais para a região.',
  })
  insight: string;

  @ApiProperty({
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class WeatherInsightResponse {
  @ApiProperty({ example: 'Palmeiras - BA' })
  city: string;

  @ApiProperty({ type: WeatherEntity })
  current_data: WeatherEntity;

  @ApiProperty({ type: AiAnalysisResult })
  analysis: AiAnalysisResult;

  @ApiProperty({ example: 10 })
  history_sample: number;

  @ApiProperty()
  message: string;
}
