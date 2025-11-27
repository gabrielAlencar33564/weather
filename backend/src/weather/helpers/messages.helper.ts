export const WeatherMessagesHelper = {
  CREATE_SUCCESS: 'Registro climático processado e salvo com sucesso.',
  FIND_ALL_SUCCESS: 'Lista de registros recuperada com sucesso.',
  GET_ANALYSIS_SUCCESS: 'Análise inteligente gerada com sucesso.',
  EXPORT_SUCCESS: 'Arquivo de exportação gerado.',

  INSUFFICIENT_DATA: 'Dados insuficientes para análise histórica confiável.',
  AI_UNAVAILABLE:
    'Serviço de IA indisponível. Uma análise técnica local foi gerada.',
  CITY_NOT_FOUND: 'Nenhum dado encontrado para a cidade informada.',

  FALLBACK_STORM:
    '🚨 Alerta de tempestade! Alta probabilidade de chuva com trovoadas.',
  FALLBACK_RAIN: '🌧️ Probabilidade de chuva considerável. Leve guarda-chuva.',
  FALLBACK_HEAT_CRITICAL:
    '🔥 Calor crítico detectado. Risco de insolação. Hidrate-se!',
  FALLBACK_HEAT_WARNING:
    '☀️ Temperatura alta. Evite exposição prolongada ao sol.',
  FALLBACK_COLD: '❄️ Temperatura baixa. Agasalhe-se bem.',
  FALLBACK_NORMAL:
    'O clima está estável e dentro dos padrões normais para a região.',
  formatTrendMessage: (tempDiff: number) => {
    const direction = tempDiff > 0 ? 'subindo' : 'caindo';
    const absValue = Math.abs(tempDiff).toFixed(1);

    return `📈 Tendência de temperatura ${direction} rapidamente (variação de ${absValue}°C em relação à média).`;
  },
};
