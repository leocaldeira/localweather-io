import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getData } from './cache';
import * as defaults from './defaults';
import { getUnitLabel, getWeatherIcon, isOnline } from './helpers';

export function populateMessage(messageText) {
  const messageTemplate = `
    <div class="columns is-mobile">
      <div class="column">
        <div class="content has-text-centered">
          <div class="loading-animation"></div>
          <!-- <i class="fad fa-fw fa-spinner fa-5x fa-pulse"></i> -->
          <p class="message-text">${messageText}</p>
        </div>
      </div>
    </div>
  `;
  const messageEl = document.querySelector('.loading-message');
  messageEl.innerHTML = messageTemplate;
}

export function populateAppShell() {
  const appShellTemplate = `
    <div class="container is-fullwidth loading-message hidden"></div>
    <div class="container weather-data">
      <div class="columns is-mobile is-vcentered primary-conditions-data"></div>
      <div class="columns is-mobile weather-alert hidden"></div>
      <div class="current-weather-data"></div>
      <div class="columns is-mobile hourly-data"></div>
      <div class="columns is-mobile forecast-data"></div>
      <div class="columns is-mobile last-updated-time"></div>
    </div>
  `;
  const appShellEl = document.querySelector('.hero-body');
  appShellEl.innerHTML = appShellTemplate;
}

const addLocationNameSpacing = () => {
  const locationNameEl = document.querySelector('.location-name');
  const locationNameLetters = locationNameEl.textContent.split('');
  const updatedLetters = locationNameLetters.map(letter => `<span class="location-name-letter">${letter}</span>`);
  const placeHolder = '<span class="location-name-letter"></span>';
  updatedLetters.push(placeHolder.repeat(3));
  updatedLetters.unshift(placeHolder.repeat(3));
  locationNameEl.innerHTML = updatedLetters.join('');
};

export function populateLocation(data) {
  const locationName = getData(defaults.locationNameDataKey);
  const locationAddress = getData(defaults.locationAddressDataKey);
  const locationTemplate = `
    <div class="column">
      <h1 class="title is-1 has-text-centered has-tooltip location-name" data-tippy-content="
        <i class='fad fa-fw fa-globe'></i>
        <strong>${locationAddress}</strong>
        <br>
        <i class='fad fa-fw fa-map-marker-alt'></i>
        ${Math.fround(data.latitude).toFixed(4)},${data.longitude.toFixed(4)}
      ">${locationName}</h1>
    </div>
  `;
  const locationEl = document.querySelector('.location');
  locationEl.innerHTML = locationTemplate;
  addLocationNameSpacing();
}

export function populatePrimaryData(data) {
  const conditionNextHourText = `<i class='${getWeatherIcon(data.hourly.data[1].icon)}'></i> ${data.hourly.data[1].summary}`;
  const tempNextHourText = `<i class='fad fa-fw fa-thermometer-half'></i>${Math.round(data.hourly.data[1].temperature)}&deg; (feels ${Math.round(data.hourly.data[1].apparentTemperature)}&deg;)`;
  const precipitationNextHourText = Math.floor(data.hourly.data[1].precipProbability * 100)
    ? `${Math.floor(data.hourly.data[1].precipProbability * 100)}% chance of ${data.hourly.data[1].precipType}`
    : 'No precipitation';
  const conditionTodayText = `<i class='${getWeatherIcon(data.daily.data[0].icon)}'></i> ${data.daily.data[1].summary}`;
  const tempTodayText = `
    <i class='fad fa-fw fa-temperature-high'></i> High ${Math.round(data.daily.data[0].temperatureMax)}&deg;
    (feels ${Math.round(data.daily.data[0].apparentTemperatureMax)}&deg;)
    around ${dayjs.unix(data.daily.data[0].apparentTemperatureMaxTime).format('h:mma')}
    <br>
    <i class='fad fa-fw fa-temperature-low'></i> Low ${Math.round(data.daily.data[0].temperatureMin)}&deg;
    (feels ${Math.round(data.daily.data[0].apparentTemperatureMin)}&deg;)
    around ${dayjs.unix(data.daily.data[0].apparentTemperatureMinTime).format('h:mma')}
  `;
  const precipitationTodayText = Math.floor(data.daily.data[0].precipProbability * 100)
    ? `${Math.floor(data.daily.data[0].precipProbability * 100)}% chance of ${data.daily.data[0].precipType} around ${dayjs.unix(data.daily.data[0].precipIntensityMaxTime).format('h:mma')}`
    : 'No precipitation';
  const sunTodayText = `
    <i class='fad fa-fw fa-sunrise'></i> Sunrise ${dayjs.unix(data.daily.data[0].sunriseTime).format('h:mma')}
    <i class='fad fa-fw fa-sunset'></i> Sunset ${dayjs.unix(data.daily.data[0].sunsetTime).format('h:mma')}
  `;
  const currentConditionsTooltip = `
    <div class='primarySummaryWrapper'>
      <div class='columns is-mobile'>
        <div class='column'>
          <strong>NEXT HOUR</strong>
          <br>
          ${conditionNextHourText}
          <br>
          ${tempNextHourText}
          <br>
          <i class='fad fa-fw fa-umbrella'></i> ${precipitationNextHourText}
        </div>
      </div>
      <div class='columns is-mobile'>
        <div class='column'>
          <strong>TODAY</strong>
          <br>
          ${conditionTodayText}
          <br>
          ${tempTodayText}
          <br>
          ${sunTodayText}
          <br><i class='fad fa-fw fa-umbrella'></i> ${precipitationTodayText}
        </div>
      </div>
      <div class='columns is-mobile'>
        <div class='column'>
          <strong>NEXT 7 DAYS</strong>
          <br>
          ${data.daily.summary}
        </div>
      </div>
    </div>
  `;
  const primaryDataTemplate = `
    <div class="column is-one-quarter has-text-right current-icon has-tooltip" data-tippy-content="<i class='${getWeatherIcon(data.currently.icon)}'></i> ${data.currently.summary}">
      <i class="${getWeatherIcon(data.currently.icon)}"></i>
    </div>
    <div class="column is-half has-text-centered current-conditions">
      <h2 class="subtitle is-1 has-text-centered has-tooltip" data-tippy-content="${currentConditionsTooltip}">
        ${data.currently.summary}
      </h2>
    </div>
    <div class="column is-one-quarter has-text-left current-temp has-tooltip" data-tippy-content="<i class='fad fa-fw fa-thermometer-half'></i> Feels like ${Math.round(data.currently.apparentTemperature)}&deg;">
      ${Math.round(data.currently.temperature)}&deg;
    </div>
  `;
  const priamryDataEl = document.querySelector('.primary-conditions-data');
  priamryDataEl.innerHTML = primaryDataTemplate;
}

export function populateWeatherAlert(title) {
  const weatherAlertTemplate = `
    <div class="column has-text-centered">
      <span class="tag is-large tag-weather-alert">
        <a href="#" class="link-weather-alert">
          <i class="fad fa-fw fa-exclamation-triangle"></i> ${title}
        </a>
      </span>
    </div>
  `;
  const weatherAlertEl = document.querySelector('.weather-alert');
  weatherAlertEl.innerHTML = weatherAlertTemplate;
}

export function populateWeatherData(data) {
  // const moonUi = getMoonUi(data);
  const weatherDataTemplate = `
    <div class="columns is-mobile is-vcentered">
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Wind">
        <p>
          <i class="fad fa-fw fa-wind"></i>
          <br>
          <i class="fad fa-fw fa-chevron-circle-up" data-fa-transform="rotate-${data.currently.windBearing}"></i>
          ${Math.round(data.currently.windSpeed)}${getUnitLabel('windSpeed', data.flags.units)[0]}
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Precipitation">
        <p>
          <i class="fad fa-fw fa-umbrella"></i>
          <br>
          ${Math.round(data.currently.precipProbability * 100)}%
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="UV">
        <p>
          <i class="fad fa-fw fa-sun fa-swap-opacity"></i>
          <br>
          ${Math.round(data.currently.uvIndex)}
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Visibility">
        <p>
          <i class="fad fa-fw fa-eye fa-swap-opacity"></i>
          <br>
          ${data.currently.visibility}${getUnitLabel('visibility', data.flags.units)[0]}
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Sunrise">
        <p>
          <i class="fad fa-fw fa-sunrise fa-swap-opacity"></i>
          <br>
          ${dayjs.unix(data.daily.data[0].sunriseTime).format('h:mma')}
        </p>
      </div>
    </div>
    <div class="columns is-mobile is-vcentered">
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Barometric Pressure">
        <p>
          <i class="fad fa-fw fa-tachometer fa-swap-opacity"></i>
          <br>
          ${Math.round(data.currently.pressure)}${getUnitLabel('pressure', data.flags.units)[0]}</i>
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Humidity">
        <p>
          <i class="fad fa-fw fa-humidity fa-swap-opacity"></i>
          <br>
          ${Math.round(data.currently.humidity * 100)}%
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Dew Point">
        <p>
          <i class="fad fa-fw fa-dewpoint"></i>
          <br>
          ${Math.round(data.currently.dewPoint)}&deg;</i>
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Cloud Cover">
        <p>
          <i class="fad fa-fw fa-cloud"></i>
          <br>
          ${Math.round(data.currently.cloudCover * 100)}%
        </p>
      </div>
      <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Sunset">
        <p>
          <i class="fad fa-fw fa-sunset fa-swap-opacity"></i>
          <br>${dayjs.unix(data.daily.data[0].sunsetTime).format('h:mma')}
        </p>
      </div>
    </div>
  `;
  const weatherDataEl = document.querySelector('.current-weather-data');
  weatherDataEl.innerHTML = weatherDataTemplate;
}

// <div class="column is-hidden-mobile has-text-centered has-tooltip" data-tippy-content="Moon">
//   <p class="moon-phase">
//    <i class="wi wi-fw ${moonUi.icon}"></i>
//    <br>
//    ${moonUi.phase}
//  </p>
// </div>
// <div class="column is-one-fifth-mobile has-text-centered has-tooltip" data-tippy-content="Feels Like">
//   <p>
//     <i class="fad fa-fw fa-thermometer-half"></i>
//     <br>
//     ${Math.round(data.currently.apparentTemperature)}&deg;</i>
//   </p>
// </div>

export function populateForecastData(data, numDays = 7) {
  const forecastWrappers = `
    <div class="column is-mobile has-text-centered forecast-1 is-one-quarter-mobile"></div>
    <div class="column is-mobile has-text-centered forecast-2 is-one-quarter-mobile"></div>
    <div class="column is-mobile has-text-centered forecast-3 is-one-quarter-mobile"></div>
    <div class="column is-mobile has-text-centered forecast-4 is-one-quarter-mobile"></div>
    <div class="column is-mobile has-text-centered forecast-5 is-hidden-mobile"></div>
    <div class="column is-mobile has-text-centered forecast-6 is-hidden-touch"></div>
    <div class="column is-mobile has-text-centered forecast-7 is-hidden-touch"></div>
  `;
  const forecastWrappersEl = document.querySelector('.forecast-data');
  forecastWrappersEl.innerHTML = forecastWrappers;
  for (let i = 0; i < numDays; i += 1) {
    const next = i + 1;
    const conditionText = `<i class='${getWeatherIcon(data.daily.data[next].icon)}'></i> ${data.daily.data[next].summary}`;
    const tempText = `
      <i class='fad fa-fw fa-temperature-high'></i> High ${Math.round(data.daily.data[next].temperatureMax)}&deg;
      (feels ${Math.round(data.daily.data[next].apparentTemperatureMax)}&deg;)
      around ${dayjs.unix(data.daily.data[next].apparentTemperatureMaxTime).format('h:mma')}
      <br>
      <i class='fad fa-fw fa-temperature-low'></i> Low ${Math.round(data.daily.data[next].temperatureMin)}&deg;
      (feels ${Math.round(data.daily.data[next].apparentTemperatureMin)}&deg;)
      around ${dayjs.unix(data.daily.data[next].apparentTemperatureMinTime).format('h:mma')}
    `;
    const precipitationText = Math.floor(data.daily.data[next].precipProbability * 100)
      ? `${Math.floor(data.daily.data[next].precipProbability * 100)}% chance of ${data.daily.data[next].precipType} around ${dayjs.unix(data.daily.data[next].precipIntensityMaxTime).format('h:mma')}`
      : 'No precipitation';
    const sunText = `
      <i class='fad fa-fw fa-sunrise'></i> Sunrise ${dayjs.unix(data.daily.data[next].sunriseTime).format('h:mma')}
      <i class='fad fa-fw fa-sunset'></i> Sunset ${dayjs.unix(data.daily.data[next].sunsetTime).format('h:mma')}
    `;
    const forecastTemplate = `
      <p class="has-tooltip" data-tippy-content="<div class='has-text-left'>${conditionText}<br>${tempText}<br>${sunText}<br><i class='fad fa-fw fa-umbrella'></i> ${precipitationText}</div>">
        <strong>${dayjs.unix(data.daily.data[next].time).format('ddd')}</strong>
        <br>
        <i class="${getWeatherIcon(data.daily.data[next].icon)}"></i>
        <br>
        ${Math.round(data.daily.data[next].temperatureMax)}&deg;/${Math.round(data.daily.data[next].temperatureMin)}&deg;
      </p>
    `;
    const forecastEl = document.querySelector(`.forecast-${next}`);
    forecastEl.innerHTML = forecastTemplate;
  }
}

export function populateHourlyData(data, numHours = 12) {
  const hourlyWrappers = `
    <div class="column has-text-centered hourly-1"></div>
    <div class="column has-text-centered hourly-2"></div>
    <div class="column has-text-centered hourly-3"></div>
    <div class="column has-text-centered hourly-4"></div>
    <div class="column has-text-centered hourly-5"></div>
    <div class="column has-text-centered hourly-6 is-hidden-mobile"></div>
    <div class="column has-text-centered hourly-7 is-hidden-mobile"></div>
    <div class="column has-text-centered hourly-8 is-hidden-touch"></div>
    <div class="column has-text-centered hourly-9 is-hidden-touch"></div>
    <div class="column has-text-centered hourly-10 is-hidden-touch"></div>
    <div class="column has-text-centered hourly-11 is-hidden-touch"></div>
    <div class="column has-text-centered hourly-12 is-hidden-touch"></div>
  `;
  const hourlyWrappersEl = document.querySelector('.hourly-data');
  hourlyWrappersEl.innerHTML = hourlyWrappers;
  for (let i = 0; i < numHours; i += 1) {
    const next = i + 1;
    const conditionText = `<i class='${getWeatherIcon(data.hourly.data[next].icon)}'></i> ${data.hourly.data[next].summary}`;
    const tempText = `<i class='fad fa-fw fa-thermometer-half'></i>${Math.round(data.hourly.data[next].temperature)}&deg; (feels ${Math.round(data.hourly.data[next].apparentTemperature)}&deg;)`;
    const precipitationText = Math.floor(data.hourly.data[next].precipProbability * 100)
      ? `${Math.floor(data.hourly.data[next].precipProbability * 100)}% chance of ${data.hourly.data[next].precipType}`
      : 'No precipitation';
    const hourlyTemplate = `
      <p class="has-tooltip" data-tippy-content="<div class='has-text-left'>${conditionText}<br>${tempText}<br><i class='fad fa-fw fa-umbrella'></i> ${precipitationText}</div>">
        <strong>${dayjs.unix(data.hourly.data[next].time).format('ha')}</strong>
        <br>
        <i class="${getWeatherIcon(data.hourly.data[next].icon)}"></i>
        <br>
        ${Math.round(data.hourly.data[next].temperature)}&deg;
      </p>
    `;
    const hourlyEl = document.querySelector(`.hourly-${next}`);
    hourlyEl.innerHTML = hourlyTemplate;
  }
}

export function populateLastUpdated(data) {
  dayjs.extend(relativeTime);
  const lastUpdateTime = dayjs.unix(data.currently.time);
  const nextUpdateTime = dayjs.unix(data.currently.time + defaults.cacheTimeSpan);

  let lastUpdatedString = `
    Weather data last refreshed at ${lastUpdateTime.format('hh:mm:ss A')}
    <br>
    Data is cached for 5 minutes, next update ${dayjs().to(nextUpdateTime)}
  `;
  let lastUpdatedTemplate = `
    <div class="column has-text-centered">
      <p class="last-updated has-tooltip" data-tippy-content="${lastUpdatedString}">
        Weather data last updated ${dayjs().from(lastUpdateTime, true)} ago
      </p>
    </div>
  `;

  if (!isOnline()) {
    lastUpdatedString = `
      Weather data will be refreshed automatically when your device has connectivity again
    `;
    lastUpdatedTemplate = `
      <div class="column has-text-centered">
        <p class="last-updated has-tooltip" data-tippy-content="${lastUpdatedString}">
          <i class='fad fa-fw fa-wifi-slash'></i> Weather data last updated ${lastUpdateTime.format('hh:mm:ss A')}
        </p>
      </div>
    `;
  }

  const lastUpdatedEl = document.querySelector('.last-updated-time');
  lastUpdatedEl.innerHTML = lastUpdatedTemplate;
}

export function populateFooter() {
  const footerTemplate = `
    <div class="column">
      <div class="content has-text-right">
        <a href="https://github.com/mikesprague/localweather-io/releases" target="_blank" rel="noopener" data-tippy-content="${defaults.versionString} Release Notes">
          LocalWeather.io ${defaults.versionString}
        </a>
      </div>
    </div>
    <div class="column">
      <div class="content has-text-centered">
        <a href="https://darksky.net/poweredby/" target="_blank" rel="noopener" data-tippy-content="Powered by Dark Sky">
          <i class="fad fa-tint"></i> Powered by Dark Sky
        </a>
      </div>
    </div>
    <div class="column">
      <div class="content has-text-left">
        <a href="https://github.com/mikesprague/localweather-io/" rel="noopener" target="_blank" data-tippy-content="Coded by Michael Sprague">
          <i class="fad fa-code"></i> by Michael Sprague
        </a>
      </div>
    </div>
  `;
  const footerEl = document.querySelector('.powered-by-dark-sky');
  footerEl.innerHTML = footerTemplate;
}

export const errorTemplates = {
  genericError: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> Error
    </p>
    <p class='message-alert-text-first'>
      We're sorry, an error occurred. Our developers have been notified.
      Please reload to try again or come back later.
    </p>
  `,
  locationError: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> Error
    </p>
    <p class='message-alert-text-first'>
      We're sorry, an error occurred identifying your location.
      Our developers have been notified of the problem and sent the error details.
      Please reload to try again or come back later.
    </p>`,
  geolocationUnavailable: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> GEOLOCATION_UNAVAILABLE
    </p>
    <p class='message-alert-text-first'>
      Geolocation is not available with your current browser.
    </p>
  `,
  geolocationUnknown: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> UNKNOWN ERROR
    </p>
    <p class='message-alert-text-first'>
      An unknown error occurred.
    </p>`,
  geolocationTimeout: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> TIMEOUT
    </p>
    <p class='message-alert-text-first'>
      The request to get user location timed out.
    </p>`,
  geolocationPosition: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> POSITION UNAVAILABLE
    </p>
    <p class='message-alert-text-first'>
      Location information is unavailable.
    </p>`,
  geolocationPermission: `
    <p class='message-alert-text-heading has-text-danger'>
      <i class='fad fa-fw fa-exclamation-triangle'></i> User denied the request for Geolocation
    </p>
    <p class='message-alert-text-first'>
      Please enable location services, clear any location tracking blocks for the domain
      'localweather.io' in your browser, and try again.
    </p>`,
};
