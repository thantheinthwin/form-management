# Backend Environment Variables

This directory contains environment configuration files for the backend server.

## Available Files

- `.env.development`: Configuration for development environment
- `.env.staging`: Configuration for staging environment
- `.env.production`: Configuration for production environment

## Configuration Variables

- `PORT`: Server port
- `NODE_ENV`: Node environment
- `DB_*`: Database connection details
- `JWT_*`: Authentication settings
- `API_PREFIX`: API route prefix
- `CORS_ORIGIN`: Allowed origins for CORS

## Usage

Copy the appropriate file to your backend project root and rename it to `.env` before starting the server. 