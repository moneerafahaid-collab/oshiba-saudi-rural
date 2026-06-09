import { useCallback, useEffect, useState } from "react";
import {
  USER_REGION_STORAGE_KEY,
  detectRegionFromCoords,
} from "../data/regionGeolocation";

export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported"
  | "outside";

export function useUserRegion() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [fullRegion, setFullRegion] = useState<string | null>(null);

  const applyRegion = useCallback((region: string) => {
    setFullRegion(region);
    localStorage.setItem(USER_REGION_STORAGE_KEY, region);
    setStatus("granted");
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const region = detectRegionFromCoords(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (region) {
          applyRegion(region);
        } else {
          setStatus("outside");
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
    );
  }, [applyRegion]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_REGION_STORAGE_KEY);
      if (saved) {
        setFullRegion(saved);
        setStatus("granted");
        return;
      }
    } catch {
      /* ignore */
    }
    requestLocation();
  }, [requestLocation]);

  return { fullRegion, status, requestLocation };
}
