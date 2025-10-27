export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.skyprepaero.com/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SkyPrep Admin',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}
