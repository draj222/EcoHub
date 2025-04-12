/**
 * Machine Learning Prediction Utility
 * 
 * This module provides environmental data analysis and prediction functions
 * using statistical models and ML algorithms (simulated for demonstration)
 */

// Type definitions for input data
export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  timestamp: string;
}

export interface WaterQualityData {
  waterTemp: number;
  salinity: number;
  pH: number;
  dissolvedOxygen: number;
  timestamp: string;
}

// Prediction timeframes
export type TimeFrame = '24h' | '72h' | '7d' | '30d';

// Prediction output types
export interface AirQualityPrediction {
  predictedAQI: number;
  predictedPM25: number;
  predictedO3: number;
  trend: 'improving' | 'stable' | 'worsening';
  confidence: number;
  timeframe: TimeFrame;
}

export interface WaterQualityPrediction {
  predictedTemp: number;
  tempTrend: 'rising' | 'stable' | 'falling';
  predictedOxygen: number;
  oxygenTrend: 'rising' | 'stable' | 'falling';
  confidence: number;
  timeframe: TimeFrame;
}

export interface MarineHealthResult {
  healthScore: number;  // 0-100 scale
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  factorsAffectingHealth: string[];
  recommendations: string[];
}

/**
 * Predict future air quality based on current data and historical trends
 * 
 * @param currentData - Current air quality measurements
 * @param timeframe - Prediction timeframe (24h, 72h, 7d, 30d)
 * @returns Promise with air quality prediction
 */
export async function predictAirQuality(
  currentData: AirQualityData,
  timeframe: TimeFrame
): Promise<AirQualityPrediction> {
  // Simulate ML processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demonstration, we'll use simplified trend-based predictions
  // In a real app, this would use actual ML models
  
  // Calculate trend direction based on current values vs. historical averages
  // (For demo we'll use random values, but weighted by current data)
  let trendFactor: number;
  
  // Higher AQI values indicate worse air quality
  // Higher trend factors indicate worsening conditions
  if (currentData.aqi > 100) {
    // Poor air quality tends to improve due to regulations/weather patterns (regression to mean)
    trendFactor = Math.random() * 0.5 - 0.3; // -0.3 to +0.2
  } else if (currentData.aqi > 50) {
    // Moderate air quality could go either way
    trendFactor = Math.random() * 0.6 - 0.3; // -0.3 to +0.3
  } else {
    // Good air quality has more room to worsen than improve
    trendFactor = Math.random() * 0.5; // 0 to +0.5
  }
  
  // Apply time factor - longer predictions have more uncertainty and variation
  let timeFactor: number;
  switch(timeframe) {
    case '24h': timeFactor = 1; break;
    case '72h': timeFactor = 2.5; break;
    case '7d': timeFactor = 5; break;
    case '30d': timeFactor = 12; break;
    default: timeFactor = 1;
  }
  
  // Calculate predicted values
  const predictedAQI = Math.max(1, Math.round(
    currentData.aqi * (1 + (trendFactor * timeFactor * 0.1))
  ));
  
  const predictedPM25 = Math.max(0.1, parseFloat(
    (currentData.pm25 * (1 + (trendFactor * timeFactor * 0.15))).toFixed(1)
  ));
  
  const predictedO3 = Math.max(0.001, parseFloat(
    (currentData.o3 * (1 + (trendFactor * timeFactor * 0.08))).toFixed(2)
  ));
  
  // Determine trend direction
  let trend: 'improving' | 'stable' | 'worsening';
  if (trendFactor < -0.1) {
    trend = 'improving';
  } else if (trendFactor > 0.1) {
    trend = 'worsening';
  } else {
    trend = 'stable';
  }
  
  // Calculate confidence level (longer predictions have lower confidence)
  const confidence = Math.max(
    0.4, 
    Math.min(
      0.95, 
      0.9 - (timeFactor * 0.05) + (Math.random() * 0.1)
    )
  );
  
  return {
    predictedAQI,
    predictedPM25,
    predictedO3,
    trend,
    confidence: parseFloat(confidence.toFixed(2)),
    timeframe
  };
}

/**
 * Predict future water temperature and quality based on current data
 * 
 * @param currentData - Current water quality measurements
 * @param timeframe - Prediction timeframe (24h, 72h, 7d, 30d)
 * @returns Promise with water quality prediction
 */
export async function predictWaterTemperature(
  currentData: WaterQualityData,
  timeframe: TimeFrame
): Promise<WaterQualityPrediction> {
  // Simulate ML processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Extract timestamp to determine season (simplified)
  const date = new Date(currentData.timestamp);
  const month = date.getMonth(); // 0-11
  
  // Determine seasonal trend (Northern Hemisphere)
  // Spring/Summer (warming): months 2-7 (March-August)
  // Fall/Winter (cooling): months 8-1 (September-February)
  const isWarmingSeason = month >= 2 && month <= 7;
  
  // Base temperature trend on season, but with randomness
  let tempTrendFactor = isWarmingSeason ? 
    0.05 + (Math.random() * 0.1) : // warming
    -0.05 - (Math.random() * 0.1); // cooling
  
  // Apply time factor
  let timeFactor: number;
  switch(timeframe) {
    case '24h': timeFactor = 1; break;
    case '72h': timeFactor = 3; break;
    case '7d': timeFactor = 7; break;
    case '30d': timeFactor = 15; break; // Non-linear since weather predictability drops
    default: timeFactor = 1;
  }
  
  // Calculate predicted temperature
  const tempChange = currentData.waterTemp * tempTrendFactor * timeFactor;
  const predictedTemp = parseFloat(
    (currentData.waterTemp + tempChange).toFixed(1)
  );
  
  // Oxygen is inversely related to temperature
  // (colder water holds more dissolved oxygen)
  const oxygenChangeFactor = -tempTrendFactor * 0.7 + (Math.random() * 0.2 - 0.1);
  const oxygenChange = currentData.dissolvedOxygen * oxygenChangeFactor * timeFactor;
  const predictedOxygen = Math.max(
    3, // Minimum level for most aquatic life
    Math.min(
      12, // Maximum typical level
      parseFloat((currentData.dissolvedOxygen + oxygenChange).toFixed(1))
    )
  );
  
  // Determine trends
  const tempTrend: 'rising' | 'stable' | 'falling' = 
    tempChange > 0.5 ? 'rising' :
    tempChange < -0.5 ? 'falling' : 'stable';
    
  const oxygenTrend: 'rising' | 'stable' | 'falling' = 
    oxygenChange > 0.3 ? 'rising' :
    oxygenChange < -0.3 ? 'falling' : 'stable';
  
  // Calculate confidence (longer predictions have lower confidence)
  const confidence = Math.max(
    0.4,
    Math.min(
      0.95,
      0.9 - (timeFactor * 0.03) + (Math.random() * 0.1)
    )
  );
  
  return {
    predictedTemp,
    tempTrend,
    predictedOxygen,
    oxygenTrend,
    confidence: parseFloat(confidence.toFixed(2)),
    timeframe
  };
}

/**
 * Assess marine ecosystem health based on water quality data
 * 
 * @param waterData - Current water quality measurements
 * @returns Promise with marine health assessment
 */
export async function assessMarineHealth(
  waterData: WaterQualityData
): Promise<MarineHealthResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Scoring system for marine health factors (0-100 scale)
  const scores: Record<string, number> = {};
  const factors: string[] = [];
  const recommendations: string[] = [];
  
  // Score for water temperature
  // Ideal range is typically 10-25°C for many marine ecosystems
  if (waterData.waterTemp < 5) {
    scores.temperature = 60 + Math.random() * 15;
    factors.push("Water temperature is very cold");
    recommendations.push("Monitor cold-sensitive species");
  } else if (waterData.waterTemp > 30) {
    scores.temperature = 40 + Math.random() * 20;
    factors.push("Water temperature is elevated");
    recommendations.push("Monitor for coral bleaching and heat stress in marine life");
  } else if (waterData.waterTemp > 27) {
    scores.temperature = 70 + Math.random() * 10;
    factors.push("Water temperature is somewhat warm");
    recommendations.push("Regular monitoring of temperature-sensitive species recommended");
  } else {
    scores.temperature = 85 + Math.random() * 15;
  }
  
  // Score for pH
  // Healthy ocean pH is typically 8.1-8.2
  // Climate change is causing ocean acidification (lower pH)
  if (waterData.pH < 7.7) {
    scores.pH = 40 + Math.random() * 20;
    factors.push("Water is acidic - concerning for shell-forming organisms");
    recommendations.push("Monitor shellfish and coral populations closely");
    recommendations.push("Investigate sources of acidification");
  } else if (waterData.pH < 7.9) {
    scores.pH = 60 + Math.random() * 15;
    factors.push("pH is slightly below optimal range");
    recommendations.push("Regular monitoring of shellfish and coral health recommended");
  } else if (waterData.pH > 8.5) {
    scores.pH = 70 + Math.random() * 10;
    factors.push("pH is elevated");
    recommendations.push("Check for algal bloom activity");
  } else {
    scores.pH = 90 + Math.random() * 10;
  }
  
  // Score for dissolved oxygen
  // Below 2 mg/L is hypoxic (dangerous)
  // Below 5 mg/L is concerning for many species
  if (waterData.dissolvedOxygen < 2) {
    scores.oxygen = 20 + Math.random() * 15;
    factors.push("Hypoxic conditions - dangerous for marine life");
    recommendations.push("Urgent: Investigate sources of oxygen depletion");
    recommendations.push("Monitor for fish kills and marine life stress");
  } else if (waterData.dissolvedOxygen < 5) {
    scores.oxygen = 50 + Math.random() * 15;
    factors.push("Oxygen levels are below optimal for many species");
    recommendations.push("Monitor fish behavior and invertebrate health");
    recommendations.push("Investigate potential pollution or nutrient sources");
  } else if (waterData.dissolvedOxygen > 10) {
    scores.oxygen = 75 + Math.random() * 15;
    factors.push("Oxygen levels are high - possibly due to algal activity");
    recommendations.push("Monitor for algal blooms");
  } else {
    scores.oxygen = 85 + Math.random() * 15;
  }
  
  // Score for salinity
  // Typical ocean salinity is ~35 PSU
  // Estuaries have more variation but typically 15-30 PSU
  if (waterData.salinity < 15) {
    scores.salinity = 60 + Math.random() * 15;
    factors.push("Salinity is very low - possibly due to freshwater input");
    recommendations.push("Monitor for impacts on marine organisms");
  } else if (waterData.salinity > 40) {
    scores.salinity = 65 + Math.random() * 15;
    factors.push("Salinity is elevated");
    recommendations.push("Check for water circulation issues or evaporation effects");
  } else {
    scores.salinity = 90 + Math.random() * 10;
  }
  
  // Calculate overall health score
  // Weighted average of individual scores
  const weights = {
    temperature: 0.25,
    pH: 0.25,
    oxygen: 0.35,
    salinity: 0.15
  };
  
  let healthScore = 0;
  let totalWeight = 0;
  
  Object.entries(scores).forEach(([factor, score]) => {
    const weight = weights[factor as keyof typeof weights] || 0;
    healthScore += score * weight;
    totalWeight += weight;
  });
  
  // Normalize score to 0-100
  healthScore = Math.round(healthScore / totalWeight);
  
  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  
  if (healthScore >= 80) {
    riskLevel = 'low';
    if (factors.length === 0) {
      factors.push("Overall marine conditions appear healthy");
      recommendations.push("Continue regular monitoring and conservation efforts");
    }
  } else if (healthScore >= 60) {
    riskLevel = 'moderate';
    if (factors.length === 0) {
      factors.push("Some parameters show minor deviation from optimal conditions");
      recommendations.push("Increase monitoring frequency");
    }
  } else if (healthScore >= 40) {
    riskLevel = 'high';
    if (recommendations.length === 0) {
      recommendations.push("Comprehensive water quality assessment recommended");
      recommendations.push("Implement management interventions to address risk factors");
    }
  } else {
    riskLevel = 'severe';
    if (recommendations.length === 0) {
      recommendations.push("Urgent intervention needed to address water quality issues");
      recommendations.push("Alert relevant environmental authorities");
    }
  }
  
  return {
    healthScore,
    riskLevel,
    factorsAffectingHealth: factors,
    recommendations
  };
} 