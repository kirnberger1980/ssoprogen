export interface OidcCredentials {
  scopes?: string[];
  startUrl?: string;
  region?: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  expiresAt: string;
  registrationExpiresAt?: string;
  refreshToken?: string;
}

export interface SsoDetails {
  accessToken: string;
  region: string;
  startUrl: string;
}