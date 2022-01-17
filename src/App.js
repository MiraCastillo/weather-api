import './App.css';
import { useEffect, useMemo, useState } from 'react';

const apiUrl = 'https://meta-weather.vercel.app/api'
const defaultCities = ['725746', '44418', '2423945']

function App() {
  const [defaultCityWeather] = useMemo(() => {
    let allWeather = []
    defaultCities.forEach(city => {
      async function buildWeatherInfo(){
        let weather = await fetch(`${apiUrl}/location/${city}`)
        allWeather = [...allWeather, weather.data]
      }
      buildWeatherInfo()
    })
    return allWeather
  }, [])

  return (
    <div>
      {defaultCityWeather?.map(data => (
        <div>
          <h1>{data.title}, {data.parent.title}</h1>
          {data.consolidated_weather.map(day => (
            <div>
              <div>
                <p>{day.applicable_date} {data.timezone_name}</p>
              </div>
              <div>
                <div>
                  <p>Predictability</p>
                  <p>{day.predictability}</p>
                </div>
                <p>image</p>
                <p>{day.weather_state_name}</p>
                <p>{day.the_temp} C / F</p>
              </div>
              <div>
                <p>Min: {day.min_temp}°C / °F</p>
                <p>Max: {day.max_temp}°C / °F</p>
                <p>Wind: {day.wind_direction_compass}. {day.wind_speed} mph</p>
                <p>Visibility: {day.visibility} mi</p>
                <p>Humidity: {day.humidity}%</p>
                <p>Air pressure: {day.air_pressure}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;
