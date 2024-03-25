// HTML Selectors
const mainSelector = document.getElementById('main');
const geolocationLink = document.getElementById('geolink');
const weatherPlaceholder = document.querySelector('.weather');
const errorPlaceholder = document.querySelector('.error');
const searchBar = document.getElementById('search-bar');
const forecastPlaceholder = document.querySelector('.forecast');
const descriptionPlaceholder = document.getElementById('description');
const fahrenheitController = document.getElementById('control-fahrenheit');
const celciusController = document.getElementById('control-celcius');
const controlPlaceHolder = document.querySelector('.control');
const celciusSelector = document.querySelectorAll('.celcius');

// We set the temperature to celcius when we first load the app
let temperatureMeasurementSetting = celcius;

// fetchWeather fetches the current weather forecast either using a
// city name provided or the lat/lon of a specific place.
const fetchWeather = async ({ city, lat, lon }) => {
  let url = `${weatherUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${weatherUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        errorPlaceholder.innerHTML = error404;
        return;
      } else {
        throw new Error(res.error);
      }
    }
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e);
  }
};

// fetchForecast fetches the future weather forecast either using a
// city name provided or the lat/lon of a specific place.
const fetchForecast = async ({ city, lat, lon }) => {
  let url = `${forecastUrl}q=${city}&appid=${API_KEY}&units=metric`;
  if (lat != null && lon != null) {
    url = `${forecastUrl}lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        errorPlaceholder.innerHTML = error404;
        return;
      } else {
        throw new Error(res);
      }
    }
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e.status);
  }
};

// getUserLocation calls the browser built-in geolocation functionality
// to return the user's current geolcation information
const getUserLocation = async () => {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
};

// getUserLatLong is a helper function to get the user's geolocation information.
// It return the coordinates on success, and displays and returns errors on failure.
const getUserLatLong = async () => {
  try {
    const position = await getUserLocation();
    return position.coords;
  } catch (e) {
    if (e.code === 1) {
      errorPlaceholder.innerHTML = errorGeoCode1;
    } else {
      errorPlaceholder.innerHTML = errorGeoCodeOthers;
    }
    console.error(e);
  }
};

// celsiusToFahrenheit is a helper function to convert celcius to fahrenheit.
const celsiusToFahrenheit = celsius => (celsius * 9) / 5 + 32;

// round is a helper function to return the temperature with 1 decimal place.
const round = value => {
  var multiplier = Math.pow(10, 1);
  return (Math.round(value * multiplier) / multiplier).toFixed(1);
};

// formatFutureForecast reduces the list of future forecast to return
// the high and low temperatures for the upcoming days.
const formatFutureForecast = forecastList => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const forecastCombined = forecastList.reduce((acc, forecast) => {
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
    if (forecast.main.temp_max > acc[forecastDate].highC) {
      acc[forecastDate].highC = round(forecast.main.temp_max);
      acc[forecastDate].highF = round(
        celsiusToFahrenheit(forecast.main.temp_max)
      );
    }
    if (forecast.main.temp_min < acc[forecastDate].lowC) {
      acc[forecastDate].lowC = round(forecast.main.temp_min);
      acc[forecastDate].lowF = round(
        celsiusToFahrenheit(forecast.main.temp_min)
      );
    }
    return acc;
  }, {});

  // we want to return the object above as an array of object
  // sorted by date.
  return Object.values(forecastCombined).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
};

// displayFutureForecast takes in a list of future forecast
// and displays it to the screen.
const displayFutureForecast = forecastList => {
  let futureforecastList = '';
  forecastList.forEach(forecast => {
    futureforecastList += `
      <div>
        <p>${forecast.day}</p>
        <p class=${celcius}><span class="low">↓ ${forecast.lowC} °C</span><span class="high">↑ ${forecast.highC} °C</span></p>
        <p class=${fahrenheit}><span class="low">↓ ${forecast.lowF} °F</span><span class="high">↑ ${forecast.highF} °F</span></p>
      </div>
    `;
  });
  return futureforecastList;
};

// getTime is a helper function that takes in the time and timezone information
// so we can display time in the local time of a place selected.
const getTime = (time, timezone) => {
  const timeFromAPI = new Date((time + timezone) * 1000);
  // we need to get the timezone offset so we can show it in the local time
  // instead of GMT
  const timezoneOffset = timeFromAPI.getTimezoneOffset() * 60000;
  return (
    new Date(timeFromAPI.getTime() + timezoneOffset)
      //set locale to 'en-uk' so we get it in the 24-hour format
      .toLocaleTimeString(['en-uk'], { hour: '2-digit', minute: '2-digit' })
      .replace(':', '.')
  );
};

// showDescription is our function to display the appropriate text, icons,
// and styling depending on the weather description.
const showDescription = (city, description) => {
  // we need to remove any previous class that was added to the body
  mainSelector.classList.remove(...mainSelector.classList);
  switch (description) {
    case 'Clear':
      descriptionPlaceholder.innerHTML = `Get your sunnies on. ${city} is looking rather great today.`;
      icon.src = './icons/sunglasses.svg';
      mainSelector.classList.add('sunny');
      break;
    case 'Clouds':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} is looking grey today.`;
      icon.src = './icons/clouds.svg';
      mainSelector.classList.add('grey');
      break;
    case 'Rain':
    case 'Thunderstorm':
    case 'Drizzle':
      descriptionPlaceholder.innerHTML = `Don't forget your umbrella. It's wet in ${city} today.`;
      icon.src = './icons/umbrella.svg';
      mainSelector.classList.add('wet');
      break;
    case 'Snow':
      descriptionPlaceholder.innerHTML = `Light a fire and get cosy. ${city} looks snowy today.`;
      icon.src = './icons/snow.svg';
      mainSelector.classList.add('snow');
      break;
    case 'Fog':
    case 'Mist':
    default:
      descriptionPlaceholder.innerHTML = `Be careful today in ${city}!`;
      icon.src = './icons/other.svg';
      mainSelector.classList.add('default');
  }
};

// displayTemperature displays the appropriate temperature depending
// on which meaurement the user has chosen. When a new option is chosen,
// we display the appropriate elements and hide the ones not needed.
const displayTemperature = () => {
  const fahrenheitSelector = document.querySelectorAll('.fahrenheit');
  const celciusSelector = document.querySelectorAll('.celcius');
  if (temperatureMeasurementSetting === celcius) {
    celciusController.innerHTML = `<b>°C</b>`;
    fahrenheitController.innerHTML = `<a href="javascript:void(0)">°F</a>`;
    fahrenheitSelector.forEach(element => {
      element.style.display = 'none';
    });
    celciusSelector.forEach(element => {
      element.style.display = 'flex';
    });
  } else {
    celciusController.innerHTML = `<a href="javascript:void(0)">°C</a>`;
    fahrenheitController.innerHTML = `<b>°F</b>`;
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
const displayWeather = (weather, forecast) => {
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
  weatherPlaceholder.innerHTML = weatherOutput;

  forecastPlaceholder.innerHTML = `${displayFutureForecast(futureForecast)}`;
  showDescription(name, main);

  displayTemperature();

  errorPlaceholder.innerHTML = '';
};

searchBar.onchange = async () => {
  const searchBarText = searchBar.value;
  searchBar.value = '';
  const weather = await fetchWeather({ city: searchBarText });
  const forecast = await fetchForecast({ city: searchBarText });
  displayWeather(weather, forecast);
};

geolocationLink.onclick = async () => {
  const { latitude: lat, longitude: lon } = await getUserLatLong();
  const weather = await fetchWeather({ lat, lon });
  const forecast = await fetchForecast({ lat, lon });
  displayWeather(weather, forecast);
};

fahrenheitController.onclick = () => {
  temperatureMeasurementSetting = fahrenheit;
  displayTemperature();
};

celciusController.onclick = () => {
  temperatureMeasurementSetting = celcius;
  displayTemperature();
};

// We call this anonymous async function when the page is first loaded
// We call it with the city `Stockholm`
(async () => {
  const initialWeather = await fetchWeather({ city: 'stockholm' });
  const initialForecast = await fetchForecast({ city: 'stockholm' });
  displayWeather(initialWeather, initialForecast);
})();
