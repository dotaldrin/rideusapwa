export interface EnvironmentConfig {
  readonly environment: "development" | "production";
  readonly apiBaseUrl: string;
  readonly rideHubUrl: string;
  readonly locationHubUrl: string;
  readonly taxicardHubUrl: string;
  readonly platformMessagesHubUrl: string;
}
