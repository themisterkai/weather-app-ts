import { celcius, fahrenheit } from './constants';
import { getUserLatLong, celsiusToFahrenheit, round, getTime } from './helpers';
import { fetchWeather, fetchForecast } from './requests';
import {
  mainSelector,
  geolocationLink,
  weatherPlaceholder,
  errorPlaceholder,
  searchBar,
  forecastPlaceholder,
  descriptionPlaceholder,
  fahrenheitController,
  celciusController,
  iconLink,
} from './selectors';
import {
  WeatherResponse,
  ForecastList,
  ForecastResponse,
  ForecastResponseList,
  ForecastListByDate,
} from './types';

// We set the temperature to celcius when we first load the app
let temperatureMeasurementSetting = celcius;

// formatFutureForecast reduces the list of future forecast to return
// the high and low temperatures for the upcoming days.
const formatFutureForecast = (
  forecastList: Array<ForecastResponseList>
): Array<ForecastList> => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const forecastCombined: ForecastListByDate = forecastList.reduce(
    (acc, forecast) => {
      const systemDate = new Date();
      const forecastDateReadable = new Date(forecast.dt * 1000);
      const forecastDate = forecast.dt_txt.split(' ')[0];

      if (!acc.hasOwnProperty(forecastDate)) {
        acc[forecastDate] = {
          highC: round(forecast.main.temp_max),
          lowC: round(forecast.main.temp_min),
          highF: round(celsiusToFahrenheit(forecast.main.temp_max)),
          lowF: round(celsiusToFahrenheit(forecast.main.temp_min)),
          date: forecastDate,
          day:
            systemDate.getDay() === forecastDateReadable.getDay()
              ? 'Today'
              : days[forecastDateReadable.getDay()],
        };
      }
      if (forecast.main.temp_max > Number(acc[forecastDate].highC)) {
        acc[forecastDate].highC = round(forecast.main.temp_max);
        acc[forecastDate].highF = round(
          celsiusToFahrenheit(forecast.main.temp_max)
        );
      }
      if (forecast.main.temp_min < Number(acc[forecastDate].lowC)) {
        acc[forecastDate].lowC = round(forecast.main.temp_min);
        acc[forecastDate].lowF = round(
          celsiusToFahrenheit(forecast.main.temp_min)
        );
      }
      return acc;
    },
    {} as ForecastListByDate
  );

  // we want to return the object above as an array of object
  // sorted by date.
  return Object.keys(forecastCombined)
    .map(key => forecastCombined[key])
    .sort((a, b) => {
      return new Date(a.date).valueOf() - new Date(b.date).valueOf();
    });
};

// displayFutureForecast takes in a list of future forecast
// and displays it to the screen.
const displayFutureForecast = (forecastList: Array<ForecastList>): string => {
  let futureforecastListString = '';
  forecastList.forEach(forecast => {
    futureforecastListString += `
      <div>
        <p>${forecast.day}</p>
        <p class=${celcius}><span class="low">↓ ${forecast.lowC} °C</span><span class="high">↑ ${forecast.highC} °C</span></p>
        <p class=${fahrenheit}><span class="low">↓ ${forecast.lowF} °F</span><span class="high">↑ ${forecast.highF} °F</span></p>
      </div>
    `;
  });
  return futureforecastListString;
};

// showDescription is our function to display the appropriate text, icons,
// and styling depending on the weather description.
const showDescription = (city: string, description: string): void => {
  // we need to remove any previous class that was added to the body
  mainSelector!.classList.remove(...mainSelector!.classList);
  switch (description) {
    case 'Clear':
      descriptionPlaceholder!.innerHTML = `Get your sunnies on. ${city} is looking rather great today.`;
      iconLink.src = './icons/sunglasses.svg';
      mainSelector!.classList.add('sunny');
      break;
    case 'Clouds':
      descriptionPlaceholder!.innerHTML = `Light a fire and get cosy. ${city} is looking grey today.`;
      iconLink.src = './icons/clouds.svg';
      mainSelector!.classList.add('grey');
      break;
    case 'Rain':
    case 'Thunderstorm':
    case 'Drizzle':
      descriptionPlaceholder!.innerHTML = `Don't forget your umbrella. It's wet in ${city} today.`;
      iconLink.src = './icons/umbrella.svg';
      mainSelector!.classList.add('wet');
      break;
    case 'Snow':
      descriptionPlaceholder!.innerHTML = `Light a fire and get cosy. ${city} looks snowy today.`;
      iconLink.src = './icons/snow.svg';
      mainSelector!.classList.add('snow');
      break;
    case 'Fog':
    case 'Mist':
    default:
      descriptionPlaceholder!.innerHTML = `Be careful today in ${city}!`;
      iconLink.src = './icons/other.svg';
      mainSelector!.classList.add('default');
  }
};

// displayTemperature displays the appropriate temperature depending
// on which meaurement the user has chosen. When a new option is chosen,
// we display the appropriate elements and hide the ones not needed.
const displayTemperature = () => {
  const fahrenheitSelector = document.querySelectorAll(
    '.fahrenheit'
  ) as NodeListOf<HTMLElement>;
  const celciusSelector = document.querySelectorAll(
    '.celcius'
  ) as NodeListOf<HTMLElement>;
  if (temperatureMeasurementSetting === celcius) {
    celciusController!.innerHTML = `<b>°C</b>`;
    fahrenheitController!.innerHTML = `<a href="javascript:void(0)">°F</a>`;
    fahrenheitSelector.forEach(element => {
      element.style.display = 'none';
    });
    celciusSelector.forEach(element => {
      element.style.display = 'flex';
    });
  } else {
    celciusController!.innerHTML = `<a href="javascript:void(0)">°C</a>`;
    fahrenheitController!.innerHTML = `<b>°F</b>`;
    celciusSelector.forEach(element => {
      element.style.display = 'none';
    });
    fahrenheitSelector.forEach(element => {
      element.style.display = 'flex';
    });
  }
};

// displayWeather takes in the result of the weather and forecast
// API calls to display it on the screen. This is our main display function
// and calls most of the other ones
const displayWeather = (
  weather: WeatherResponse,
  forecast: ForecastResponse
) => {
  const { name, timezone } = weather;
  const { sunrise, sunset } = weather.sys;
  const { temp, feels_like: feelsLike } = weather.main;
  const { main, description } = weather.weather[0];

  const futureForecast = formatFutureForecast(forecast.list);

  const weatherOutput = `
    <p class=${celcius}>
      ${description} | ${round(temp)} °C
    </p>
    <p class=${celcius}>
      feels like ${round(feelsLike)} °C
    </p>
    <p class=${fahrenheit}>
      ${description} | ${round(celsiusToFahrenheit(temp))} °F
    </p>
    <p class=${fahrenheit}>
      feels like ${round(celsiusToFahrenheit(feelsLike))} °F
    </p>
    <p>
      sunrise ${getTime(sunrise, timezone)}
    </p>
    <p>
      sunset ${getTime(sunset, timezone)}
    </p>
  `;
  weatherPlaceholder!.innerHTML = weatherOutput;

  forecastPlaceholder!.innerHTML = `${displayFutureForecast(futureForecast)}`;
  showDescription(name, main);

  displayTemperature();

  errorPlaceholder!.innerHTML = '';
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  searchBar.value = '';
  const weather = await fetchWeather({ city: searchBarText });
  const forecast = await fetchForecast({ city: searchBarText });
  displayWeather(weather, forecast);
};

geolocationLink!.onclick = async () => {
  const { latitude: lat, longitude: lon } = await getUserLatLong();
  const weather = await fetchWeather({ lat, lon });
  const forecast = await fetchForecast({ lat, lon });
  displayWeather(weather, forecast);
};

fahrenheitController!.onclick = () => {
  temperatureMeasurementSetting = fahrenheit;
  displayTemperature();
};

celciusController!.onclick = () => {
  temperatureMeasurementSetting = celcius;
  displayTemperature();
};

// We call this anonymous async function when the page is first loaded
// We call it with the city `Stockholm`
(async () => {
  const initialWeather = await fetchWeather({});
  const initialForecast = await fetchForecast({});
  displayWeather(initialWeather, initialForecast);
})();
