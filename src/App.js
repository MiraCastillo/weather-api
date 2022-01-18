import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {DateTime} from 'luxon'

const apiUrl = 'https://meta-weather.vercel.app'
const defaultCities = ['725746', '44418', '2423945']
const colors = {
  c: '#6ec7eb',
  lc: '#9299a6',
  hc: '#9299a6',
  sn: '#4d7b92',
  sl: '#4d7b92',
  h: '#4d7b92',
  t: '#495274',
  hr: '#495274',
  lr: '#495274',
  s: '#495274',
}

function App() {
  const [weatherList, setWeatherList] = useState([])
  const [cities, setCities] = useState([])
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchError, setSearchError] = useState(false)

  useEffect(() => {
    let weatherPromises = []
    defaultCities.forEach(city => {
      weatherPromises.push(axios.get(`${apiUrl}/api/location/${city}/`).then(res => res.data))
    })
    Promise.all(weatherPromises).then(allWeather => {
      setWeatherList(allWeather)
    })
  }, [])

  const roundToNearestWhole = (num) => {
    return Math.round(num)
  }

  const formatTemp = (temp, measure) => {
    if(measure === 'c') {
      return roundToNearestWhole(temp)
    } else {
      // Converts to fahrenheit
      return roundToNearestWhole((temp * 1.8) + 32)
    }
  }

  const formatDate = (date) => {
    const dateArr = date.split('-')
    const year = +dateArr[0]
    const month = +dateArr[1]
    const day = +dateArr[2]
    return DateTime.local(year, month, day).toLocaleString(DateTime.DATE_FULL)
  }

  const searchCities = async () => {
    if(search) {
      let cities = await axios.get(`${apiUrl}/api/location/search/?query=${search}`)
      if(cities.data.length) {
        setCities(cities.data)
      } else {
        setSearchError(true)
        setCities([])
      }
    }
  }

  const handleSearch = (e) => {
    if(searchError) {
      setSearchError(false)
    }
    setSearch(e.target.value)
  }

  const handleNewCity = async (city) => {
    setSearch('')
    setShowSearch(false)
    setCities([])
    let newCityWeather = await axios.get(`${apiUrl}/api/location/${city.woeid}/`)
    setWeatherList(prevWeatherList => [...prevWeatherList, newCityWeather.data])
  }

  const removeCity = (woeid) => {
    setWeatherList(prevWeatherList => {
      let index = prevWeatherList.findIndex(city => city.woeid === woeid)
      if(index >= 0) {
        prevWeatherList.splice(index, 1)
      }
      return [...prevWeatherList]
    })
  }

  return (
    <div className='app'>
      <div className='title-container'>
        <h1 className='site-title'>Weather You Like It Or Not</h1>
      </div>
      <div className='all-weather'>
        {weatherList.map((data, i) => (
          <div className='city' key={i}>
            <div className='city-title'>
              <h2>{data.title}, {data.parent.title}</h2>
              <button onClick={() => removeCity(data.woeid)}>Remove</button>
            </div>
            <div className='city-weather'>
              {data.consolidated_weather.map((day, j) => (
                <div className='day' style={{backgroundColor: colors[day.weather_state_abbr]}} key={j}>
                  <div className='date'>
                    <p>{formatDate(day.applicable_date)}</p>
                  </div>
                  <div className='day-details'>
                    <div className='predictability'>
                      <p>Predictability</p>
                      <p>{day.predictability}%</p>
                    </div>
                    <div className='at-a-glance'>
                      <img
                        src={`${apiUrl}/static/img/weather/${day.weather_state_abbr}.svg`}
                        alt="weather"
                        height="87"
                        width="100"
                      />
                      <p>{day.weather_state_name}</p>
                      <p>{formatTemp(day.the_temp, 'c')}°C / {formatTemp(day.the_temp)}°F</p>
                    </div>
                    <div>
                      <p>Low: {formatTemp(day.min_temp, 'c')}°C / {formatTemp(day.min_temp)}°F</p>
                      <p>High: {formatTemp(day.max_temp, 'c')}°C / {formatTemp(day.max_temp)}°F</p>
                      <p>Wind: {day.wind_direction_compass}. {roundToNearestWhole(day.wind_speed)} mph</p>
                      <p>Visibility: {roundToNearestWhole(day.visibility)} mi</p>
                      <p>Humidity: {day.humidity}%</p>
                      <p>Air pressure: {day.air_pressure} mb</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {showSearch ?
          <div className='search-section'>
            <div className='search'>
              <input value={search} onChange={(e) => handleSearch(e)} />
              <button className='search-button' onClick={() => searchCities()}>Search</button>
            </div>
            <div className='city-list'>
              {!!cities.length ? cities.map((city, i) => (
                <button key={i} onClick={() => handleNewCity(city)}>{city.title}</button>
                ))
                : searchError && <p>No cities found, please revise your search</p>
              }
            </div>
          </div>
        : <div className='new-city'>
            <button onClick={() => setShowSearch(true)}>New city</button>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
