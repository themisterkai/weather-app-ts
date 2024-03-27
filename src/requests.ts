import { API_KEY, weatherUrl, forecastUrl, error404 } from './constants';
import { errorPlaceholder } from './selectors';
import { WeatherResponse, ForecastResponse } from './types';

// fetchWeather fetches the current weather forecast either using a
// city name provided or the lat/lon of a specific place.
export const fetchWeather = async ({
  city = 'stockholm',
  lat,
  lon,
}: {
  city?: string;
  lat?: number;
  lon?: number;
}): Promise<WeatherResponse> => {
  let url = `${weatherUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${weatherUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        errorPlaceholder!.innerHTML = error404;
        return {} as WeatherResponse;
      } else {
        throw new Error(res.statusText);
      }
    }
    const json: WeatherResponse = await res.json();
    return json;
  } catch (e) {
    console.error(e);
    return {} as WeatherResponse;
  }
};

// fetchForecast fetches the future weather forecast either using a
// city name provided or the lat/lon of a specific place.
export const fetchForecast = async ({
  city = 'stockholm',
  lat,
  lon,
}: {
  city?: string;
  lat?: number;
  lon?: number;
}): Promise<ForecastResponse> => {
  let url = `${forecastUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${forecastUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        errorPlaceholder!.innerHTML = error404;
        return {} as ForecastResponse;
      } else {
        throw new Error(res.statusText);
      }
    }
    const json: ForecastResponse = await res.json();
    return json;
  } catch (e) {
    console.error(e);
    return {} as ForecastResponse;
  }
};
