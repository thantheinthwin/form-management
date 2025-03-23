# Environment Variables

This directory contains environment configuration files for different parts of the application.

## Structure

- `frontend/`: Environment variables for the frontend application
- `backend/`: Environment variables for the backend server

## Usage

These environment files are used for different deployment environments (development, staging, production).
Copy the appropriate file to your project root and rename it to `.env` before starting the application.

## Security Notice

Never commit actual `.env` files containing secrets to version control. 
The files in this directory should only be used for local development or deployment pipelines. 