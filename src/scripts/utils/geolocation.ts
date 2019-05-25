const getLocationByIp = async () => {
  const req = await fetch(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.MAPS_API_KEY}`,
    {
      method: 'POST',
    },
  );
  const {
    error,
    location: {
      lat: latitude = undefined,
      lng: longitude = undefined,
    } = {},
  } = await req.json();
  if (error || typeof latitude === 'undefined' || typeof longitude === 'undefined') {
    throw new Error(error.message || 'Error retrieving user position');
  }
  return { latitude, longitude };
};

export const getUserLocation = (highAccuracy = true) => {
  return ('geolocation' in navigator) ? new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(({ coords }: Position) => {
      resolve({
        latitude: coords.latitude,
        longitude: coords.longitude
      });
    }, () => getLocationByIp().then(resolve).catch(reject), {
      timeout: 10000,
      maximumAge: 1800000,
      enableHighAccuracy: highAccuracy,
    });
  }) : getLocationByIp();
};
