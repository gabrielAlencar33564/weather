package domain

type WeatherData struct {
	SensorData struct {
		Temperature float64 `json:"temperature"`
		Humidity int `json:"humidity"`
		Condition int `json:"condition_code"`
	} `json:"sensor_data"`
	AiAnalysis struct {
		Insight string `json:"insight"`
		Severity string `json:"severity"`
	} `json:"ai_analysis"`
	Metadata struct {
		City string `json:"city"`
		Source string `json:"source"`
		Timestamp float64 `json:"timestamp"`
	} `json:"metadata"`
}