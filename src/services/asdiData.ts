// Amazon Sustainability Data Initiative (ASDI) Data Service
// Modular service for environmental data - can be updated to connect to live APIs

export interface WeatherData {
  temperature: number;
  rainfall: number;
  windSpeed: number;
  humidity: number;
  location: string;
  timestamp: string;
}

export interface AirQualityData {
  pm25: number;
  ozone: number;
  aqi: number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  location: string;
}

export interface DroughtData {
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  waterStress: number; // 0-100
  riverFlow: number; // cubic meters/second
  rainfallDeficit: number; // percentage
  location: string;
}

export interface CropHealthData {
  ndvi: number; // Normalized Difference Vegetation Index (0-1)
  greenCover: number; // percentage
  season: string;
  healthStatus: 'poor' | 'fair' | 'good' | 'excellent';
  location: string;
}

export interface DisasterAlert {
  type: 'flood' | 'hurricane' | 'drought' | 'heatwave' | 'none';
  severity: 'low' | 'moderate' | 'high';
  description: string;
  active: boolean;
}

export interface DidYouKnowFact {
  fact: string;
  source: string;
  dataPoint: string;
}

// Placeholder data - Replace with API calls to ASDI datasets
export const getWeatherData = async (): Promise<WeatherData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    temperature: 26 + Math.random() * 6,
    rainfall: Math.random() * 50,
    windSpeed: 5 + Math.random() * 15,
    humidity: 55 + Math.random() * 30,
    location: "Your Region",
    timestamp: new Date().toISOString()
  };
};

export const getAirQualityData = async (): Promise<AirQualityData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const pm25 = Math.random() * 150;
  const ozone = Math.random() * 100;
  const aqi = Math.max(pm25, ozone);
  
  let status: AirQualityData['status'] = 'good';
  if (aqi > 150) status = 'hazardous';
  else if (aqi > 100) status = 'unhealthy';
  else if (aqi > 50) status = 'moderate';
  
  return {
    pm25,
    ozone,
    aqi: Math.round(aqi),
    status,
    location: "Your Region"
  };
};

export const getDroughtData = async (): Promise<DroughtData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const waterStress = Math.random() * 100;
  let riskLevel: DroughtData['riskLevel'] = 'low';
  if (waterStress > 75) riskLevel = 'severe';
  else if (waterStress > 50) riskLevel = 'high';
  else if (waterStress > 25) riskLevel = 'moderate';
  
  return {
    riskLevel,
    waterStress,
    riverFlow: 50 + Math.random() * 200,
    rainfallDeficit: Math.random() * 60,
    location: "Your Region"
  };
};

export const getCropHealthData = async (): Promise<CropHealthData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const ndvi = 0.3 + Math.random() * 0.6;
  const greenCover = ndvi * 100;
  
  let healthStatus: CropHealthData['healthStatus'] = 'poor';
  if (ndvi > 0.7) healthStatus = 'excellent';
  else if (ndvi > 0.6) healthStatus = 'good';
  else if (ndvi > 0.4) healthStatus = 'fair';
  
  return {
    ndvi,
    greenCover,
    season: "Growing Season",
    healthStatus,
    location: "Your Region"
  };
};

export const getDisasterAlerts = async (): Promise<DisasterAlert> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const alerts: DisasterAlert[] = [
    {
      type: 'none',
      severity: 'low',
      description: 'No active alerts in your area',
      active: false
    },
    {
      type: 'heatwave',
      severity: 'moderate',
      description: 'High temperatures expected this week',
      active: true
    },
    {
      type: 'drought',
      severity: 'high',
      description: 'Low rainfall levels - conserve water',
      active: true
    }
  ];
  
  return alerts[Math.floor(Math.random() * alerts.length)];
};

export const getDidYouKnowFact = async (): Promise<DidYouKnowFact> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const facts: DidYouKnowFact[] = [
    {
      fact: "The Amazon rainforest produces 20% of Earth's oxygen!",
      source: "ASDI Satellite Imagery",
      dataPoint: "Forest Cover Analysis"
    },
    {
      fact: "Solar energy reaching Earth in one hour could power the world for a year.",
      source: "NOAA Solar Radiation Data",
      dataPoint: "Global Solar Irradiance"
    },
    {
      fact: "Trees can reduce urban temperatures by up to 5°C through shade and evapotranspiration.",
      source: "Landsat Thermal Data",
      dataPoint: "Urban Heat Island Effect"
    },
    {
      fact: "A single tree can absorb 48 pounds of CO2 per year.",
      source: "NASA Carbon Monitoring",
      dataPoint: "Forest Carbon Sequestration"
    },
    {
      fact: "Drip irrigation can save up to 60% water compared to traditional methods.",
      source: "SISSA Drought Monitoring",
      dataPoint: "Agricultural Water Use"
    }
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
};
