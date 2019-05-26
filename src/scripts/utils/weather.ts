const getAltTemp = (unit: 'f' | 'c', temp: number) => {
  return unit === 'f' ?
    Math.round((5.0 / 9.0) * (temp - 32.0)) :
    Math.round((9.0 / 5.0) * (temp + 32.0));
};

 // TODO: typify this entire object
export const getWeather = async (
  latitude: number,
  longitude: number,
  day: Date = new Date(),
  {
    unit = 'f',
  }: {
    unit?: 'f' | 'c';
  } = {},
) => {
  if (!latitude || !longitude) {
    throw new Error('Could not retrieve weather due to an invalid location.');
  }
  const weatherUrl =
    `https://query.yahooapis.com/v1/public/yql?format=json&rnd=${day.getFullYear()}${day.getMonth()}${day.getDay()}${day.getHours()}&diagnostics=true&q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="(${latitude},${longitude})") and u="${unit}"`;

  const res = await fetch(encodeURI(weatherUrl));
  const data = await res.json();

  if (!data || !data.query || !data.query.results || data.query.results.channel.description === 'Yahoo! Weather Error')
    throw new Error('There was a problem retrieving the latest weather information.');

  const result = data.query.results.channel;
  const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  const image404 = 'https://s.yimg.com/os/mit/media/m/weather/images/icons/l/44d-100567.png';
  const weather = {
    title: result.item.title,
    temp: result.item.condition.temp,
    code: result.item.condition.code,
    todayCode: result.item.forecast[0].code,
    currently: result.item.condition.text,
    high: result.item.forecast[0].high,
    low: result.item.forecast[0].low,
    text: result.item.forecast[0].text,
    humidity: result.atmosphere.humidity,
    pressure: result.atmosphere.pressure,
    rising: result.atmosphere.rising,
    visibility: result.atmosphere.visibility,
    sunrise: result.astronomy.sunrise,
    sunset: result.astronomy.sunset,
    description: result.item.description,
    city: result.location.city,
    country: result.location.country,
    region: result.location.region,
    updated: result.item.pubDate,
    link: result.item.link,
    units: {
      temp: result.units.temperature,
      distance: result.units.distance,
      pressure: result.units.pressure,
      speed: result.units.speed,
    },
    wind: {
      chill: result.wind.chill,
      direction: compass[Math.round(result.wind.direction / 22.5)],
      degrees: result.wind.direction,
      speed: result.wind.speed,
    },
    heatindex: result.item.condition.temp < 80 && result.atmosphere.humidity < 40 ?
      -42.379 + 2.04901523 * result.item.condition.temp + 10.14333127 * result.atmosphere.humidity - 0.22475541 * result.item.condition.temp * result.atmosphere.humidity - 6.83783 * (Math.pow(10, -3)) * (Math.pow(result.item.condition.temp, 2)) - 5.481717 * (Math.pow(10, -2)) * (Math.pow(result.atmosphere.humidity, 2)) + 1.22874 * (Math.pow(10, -3)) * (Math.pow(result.item.condition.temp, 2)) * result.atmosphere.humidity + 8.5282 * (Math.pow(10, -4)) * result.item.condition.temp * (Math.pow(result.atmosphere.humidity, 2)) - 1.99 * (Math.pow(10, -6)) * (Math.pow(result.item.condition.temp, 2)) * (Math.pow(result.atmosphere.humidity, 2)) :
      result.item.condition.temp,
    thumbnail: image404,
    image: image404,
    alt: undefined as any,
    forecast: undefined as any,
  };
  if (result.item.condition.code === '3200') {
    weather.thumbnail = image404;
    weather.image = image404;
  } else {
    weather.thumbnail = `https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/${result.item.condition.code}ds.png`;
    weather.image = `https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/${result.item.condition.code}d.png`;
  }
  weather.alt = {
    temp: getAltTemp(unit, result.item.condition.temp),
    high: getAltTemp(unit, result.item.forecast[0].high),
    low: getAltTemp(unit, result.item.forecast[0].low),
    unit: unit === 'f' ? 'c' : 'f'
  };
  weather.forecast = result.item.forecast.map((forecast: any) => {
    forecast.alt = {
      high: getAltTemp(unit, forecast.high),
      low: getAltTemp(unit, forecast.low)
    };
    if (forecast.code === '3200') {
      forecast.thumbnail = image404;
      forecast.image = image404;
    } else {
      forecast.thumbnail = `https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/${forecast.code}ds.png`;
      forecast.image = `https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/${forecast.code}d.png`;
    }
    return forecast;
  });
  return weather;
};
