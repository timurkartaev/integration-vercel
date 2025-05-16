# Deploying to Vercel

This document provides instructions for deploying the Panda application to Vercel.

## Prerequisites

- A GitHub, GitLab, or Bitbucket repository with your project code
- A Vercel account (https://vercel.com)
- Your Integration.app workspace credentials
- A MongoDB database connection string

## Deployment Steps

1. Push your code to your Git repository

2. Log in to your Vercel account and go to the dashboard

3. Click "Add New" → "Project"

4. Connect to your Git repository and select the project

5. Configure the project:
   - **Framework Preset**: Next.js (should be automatically detected)
   - **Build and Output Settings**: Use default settings
   - **Environment Variables**: Add the following environment variables
     - `INTEGRATION_APP_WORKSPACE_KEY`: Your Integration.app workspace key
     - `INTEGRATION_APP_WORKSPACE_SECRET`: Your Integration.app workspace secret
     - `MONGODB_URI`: Your MongoDB connection string

6. Click "Deploy"

7. Wait for the deployment to complete, and Vercel will provide you with a URL where your application is hosted

## Vercel CLI Deployment (Alternative)

If you prefer to deploy using the command line:

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project and environment variables

## CI/CD with Vercel

Vercel automatically sets up a CI/CD pipeline when connected to your Git repository:

- New commits to the main branch will trigger a production deployment
- New commits to other branches or pull requests will create preview deployments

## Monitoring and Logs

- Visit your project dashboard in Vercel to view deployment status
- Check the "Deployments" tab to see all deployments
- View logs for each deployment to troubleshoot any issues 