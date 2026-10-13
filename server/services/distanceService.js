// /server/services/distanceService.js

const STORE_LOCATION = {
  latitude: Number(process.env.STORE_LATITUDE),
  longitude: Number(process.env.STORE_LONGITUDE),
};

const MAX_DELIVERY_DISTANCE_KM = Number(
  process.env.MAX_DELIVERY_DISTANCE_KM || 10
);

export const calculateDistance = (origin, destination) => {
  try {
    const { latitude: lat1, longitude: lon1 } = origin;
    const { latitude: lat2, longitude: lon2 } = destination;

    const R = 6371; // Earth radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceKm = R * c;

    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      distanceMeters: Math.round(distanceKm * 1000),
    };
  } catch (error) {
    throw new Error("Distance calculation failed: " + error.message);
  }
};

export const calculateDeliveryCharge = (distanceKm) => {
  if (distanceKm <= 5) {
    return 50;
  }

  if (distanceKm <= 10) {
    return 100;
  }

  return null;
};

export const isDeliverable = (distanceKm) => {
  return distanceKm <= MAX_DELIVERY_DISTANCE_KM;
};

export const calculateDeliveryInfo = (destination) => {
  const { distanceKm, distanceMeters } = calculateDistance(
    STORE_LOCATION,
    destination
  );

  const deliverable = isDeliverable(distanceKm);

  return {
    distanceKm,
    distanceMeters,
    deliverable,
    deliveryCharge: deliverable
      ? calculateDeliveryCharge(distanceKm)
      : null,
  };
};

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}