 
import { env } from "../../config/environment";

export interface MapsTokenResponse {
  accessToken: string;
  expiresOn: string;
  clientId: string;
}

export async function getMapsToken(): Promise<MapsTokenResponse> {
  const response = await fetch(
    `${env.apiBaseUrl}/api/maps/token`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Azure Maps token request failed: ${response.status}`,
    );
  }

  return (await response.json()) as MapsTokenResponse;
}
