# Weather App by Kai (Rewritten in TypeScript)

For this project, I created a weather app using the OpenWeather API. This was first implemented using vanilla Javascript before being rewritten to TypeScript.

You can see the original javascript code in './orig-js-code'

## The problem

We are using two endpoints from the OpenWeather API:
- the *weather* endpoint to return the current weather forecast
- the *forecast* endpoint to return the 5 day forecast

The weather app supports searching by a city name or using the user's current geolocation information. We use the same endpoints when making requests, just with different inputs.

The app also supports viewing temperature in either *celcius* or *fahrenheit*. So that we don't need to repull data from the API when a user changes the view option, we just hide and display the appropriate elements depending on the option the user chooses.

The app also displays the correct local time for the city selected, using the timezone property to do this.

We also added some CSS functionality. The theme of the page changes based on the description of the current weather. We are using gradient for the background. There is also some CSS animation on the page.

## View it live

[https://themisterkai.github.io/weather-app-ts/](https://themisterkai.github.io/weather-app-ts/)
