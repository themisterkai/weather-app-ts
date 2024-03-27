import { errorGeoCode1, errorGeoCodeOthers } from './constants';
import { errorPlaceholder } from './selectors';
import { ErrorLatLong } from './types';

// getUserLocation calls the browser built-in geolocation functionality
// to return the user's current geolcation information
const getUserLocation = async (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
};

// getUserLatLong is a helper function to get the user's geolocation information.
// It return the coordinates on success, and displays and returns errors on failure.
export const getUserLatLong = async (): Promise<GeolocationCoordinates> => {
  try {
    const position = await getUserLocation();
    return position.coords;
  } catch (e) {
    const u = e as ErrorLatLong;
    if (u.code === 1) {
      errorPlaceholder!.innerHTML = errorGeoCode1;
    } else {
      errorPlaceholder!.innerHTML = errorGeoCodeOthers;
    }
    console.error(u.code);
    return {} as GeolocationCoordinates;
  }
};

// celsiusToFahrenheit is a helper function to convert celcius to fahrenheit.
export const celsiusToFahrenheit = (celsius: number): number =>
  (celsius * 9) / 5 + 32;

// round is a helper function to return the temperature with 1 decimal place.
export const round = (value: number): string => {
  var multiplier = Math.pow(10, 1);
  return (Math.round(value * multiplier) / multiplier).toFixed(1);
};

// getTime is a helper function that takes in the time and timezone information
// so we can display time in the local time of a place selected.
export const getTime = (time: number, timezone: number): string => {
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
