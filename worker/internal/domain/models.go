package domain

type WeatherPayload struct {
	Location struct {
		Lat string `json:"lat"`
		Lon string `json:"lon"`
	} `json:"location"`
	Timestamp string `json:"timestamp"`
	Temperature float64 `json:"temperature"`
	Humidity int `json:"humidity"`
	WindSpeed float64 `json:"wind_speed"`
	ConditionCode int `json:"condition_code"`
	RainProbability int `json:"rain_probability"`
	City string `json:"city"`
}