export const WeatherLoggerHelper = {
  GEMINI_KEY_MISSING:
    '⚠️ GEMINI_API_KEY ausente. Usando análise heurística interna.',
  AI_CONNECTION_ERROR:
    '❌ Falha na conexão com IA externa. Ativando fallback local.',
  AI_START: (count: number) =>
    `🔄 Iniciando análise via Gemini com ${count} registros...`,
  AI_EMPTY_RESPONSE: '⚠️ Resposta vazia recebida da API do Gemini.',
  AI_PARSE_ERROR: '❌ Erro ao converter JSON da IA. Texto inválido.',
  AI_SUCCESS: '✅ Análise de IA gerada com sucesso via Google Gemini.',
  FALLBACK_ACTIVATED:
    'ℹ️ Fallback ativado: Gerando análise baseada em regras locais.',
  PROCESSING_DATA: 'Processando novos dados climáticos recebidos do Worker.',
  CRON_JOB_START: '🔄 Executando cron job de limpeza/análise diária.',
  SAVED_SUCCESS: '✅ Registro climático salvo no banco de dados.',
  SEARCHING_HISTORY: (city: string) =>
    `🔎 Buscando histórico para a cidade: ${city}`,
  EXPORT_START: '📊 Iniciando geração de relatório Excel...',
  EXPORT_DONE: '✅ Excel gerado com sucesso.',
  FIND_ALL_DEBUG: (page: number, count: number) =>
    `📄 Listagem solicitada: Página ${page} contendo ${count} registros.`,
  CITY_NOT_FOUND_WARN: (city: string) =>
    `⚠️ Análise abortada: Cidade '${city}' não encontrada no histórico.`,
};
