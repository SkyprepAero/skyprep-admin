# Environment Configuration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1

# App Configuration
VITE_APP_NAME=SkyPrep Admin
VITE_APP_VERSION=1.0.0
```

## Development vs Production

### Development
For local development, you can override the API URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Production
For production deployment, use the live API:
```env
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1
```

## Configuration Usage

The configuration is centralized in `src/config/env.js` and used throughout the application:

```javascript
import { config } from '../config/env'

// Access configuration values
console.log(config.API_BASE_URL)
console.log(config.APP_NAME)
console.log(config.IS_DEVELOPMENT)
```

## Axios Configuration

The centralized axios instance in `src/lib/axios.js` automatically uses the environment configuration and includes:

- Request/response interceptors
- Error handling
- Authentication token management
- Request logging (development only)
- Retry logic for network errors
- Timeout configuration
