import type { EnvironmentConfig } from "../shared/environment.types";

export const developmentEnvironment: EnvironmentConfig = {
  environment: "development",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL!,
  rideHubUrl: import.meta.env.VITE_RIDE_HUB_URL,
  locationHubUrl: import.meta.env.VITE_LOCATION_HUB_URL,
  taxicardHubUrl: import.meta.env.VITE_TAXICARD_HUB_URL,
  platformMessagesHubUrl: import.meta.env.VITE_PLATFORM_MESSAGES_HUB_URL,
  azureMapsKey: import.meta.env.VITE_AZURE_MAPS_KEY,
};