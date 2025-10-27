#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envContent = `# API Configuration
VITE_API_BASE_URL=https://api.skyprepaero.com/api/v1

# App Configuration
VITE_APP_NAME=SkyPrep Admin
VITE_APP_VERSION=1.0.0

# Development Configuration (uncomment for local development)
# VITE_API_BASE_URL=http://localhost:5000/api/v1
`

const envPath = path.join(process.cwd(), '.env')

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created successfully!')
  console.log('📝 Please review and update the configuration as needed.')
} else {
  console.log('⚠️  .env file already exists. Skipping creation.')
  console.log('📝 If you need to update the configuration, please edit the .env file manually.')
}

console.log('\n🚀 You can now start the development server with: npm run dev')
