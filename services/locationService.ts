import { GeoLocation } from "../types";

export const getCurrentLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMsg = "Unable to retrieve your location";
        if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location permission denied";
        }
        resolve({ lat: 0, lng: 0, error: errorMsg }); // Resolve even on error to not block app
      }
    );
  });
};