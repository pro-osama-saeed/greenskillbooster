import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lon: number): Promise<{ city: string; country: string }> => {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
        country: data.address?.country || 'Unknown Country'
      };
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return { city: 'Unknown City', country: 'Unknown Country' };
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      toast.error('Geolocation not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get city and country from coordinates
        const { city, country } = await reverseGeocode(latitude, longitude);
        
        const locationData: LocationData = {
          latitude,
          longitude,
          city,
          country
        };

        setLocation(locationData);
        setLoading(false);
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        toast.success(`Location detected: ${city}, ${country}`);
      },
      (err) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using default location.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using default location.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
        
        // Use default location (Nairobi, Kenya as an example for climate learning)
        const defaultLocation: LocationData = {
          latitude: -1.2921,
          longitude: 36.8219,
          city: 'Nairobi',
          country: 'Kenya'
        };
        setLocation(defaultLocation);
        toast.info(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  useEffect(() => {
    // Try to load from localStorage first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to parse saved location:', err);
      }
    }

    // If no saved location, request it
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
