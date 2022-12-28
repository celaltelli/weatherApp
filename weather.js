import axios from 'axios';

//https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,windspeed_10m_max&current_weather=true

export function getWeather(lat, lon, timezone) {
  return axios
    .get(
      'https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,windspeed_10m_max&current_weather=true',
      {
        params: {
          latitude: lat,
          longitude: lon,
          timezone: timezone,
        },
      }
    )
    .then(({ data }) => {
      console.log(data);
      return {
        current: parseCurrentWeatherData(data),
        daily: parseDailyWeatherData(data),
        hourly: parseHourlyWeatherData(data),
      };
    });
}

function parseCurrentWeatherData({ current_weather, daily }) {
  const { temperature: currentTemp, windspeed: windSpeed, weathercode: iconCode } = current_weather;
  const {
    temperature_2m_max: [maxTemp],
    temperature_2m_min: [minTemp],
    apparent_temperature_max: [maxFeelsLike],
    apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip],
  } = daily;
  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode,
  };
}

function parseDailyWeatherData({ daily }) {
  return daily.time.map((time, index) => {
    return {
      timestamp: time,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
    };
  });
}

function parseHourlyWeatherData({ hourly, current_weather }) {
  return hourly.time
    .map((time, index) => {
      return {
        timestamp: time,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100,
      };
    })
    .filter(({ timestamp }) => timestamp >= current_weather.time);
}
