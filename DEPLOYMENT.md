# Deployment Guide

## Azure Static Web Apps Deployment

This project is configured to deploy to Azure Static Web Apps using GitHub Actions.

### Setup Instructions

1. **Create an Azure Static Web App**:
   ```bash
   # Using Azure CLI
   az staticwebapp create \
     --name migration-coach \
     --resource-group your-resource-group \
     --location "East US 2" \
     --sku Free
   ```

2. **Get the Deployment Token**:
   ```bash
   az staticwebapp secrets list \
     --name migration-coach \
     --resource-group your-resource-group \
     --query "properties.apiKey" -o tsv
   ```

3. **Add GitHub Secret**:
   - Go to your GitHub repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Paste the deployment token from step 2

4. **Push to Main Branch**:
   The GitHub Action will automatically trigger on push to main and deploy your app.

### Security Note

**No Azure credentials are deployed with the application.** Users must configure their own Azure OpenAI credentials through the Settings page in the browser. These credentials are:
- Stored only in the user's browser localStorage
- Never sent to your server or repository
- Completely private to each user

This approach ensures:
- ✅ Your Azure OpenAI keys remain private
- ✅ Users bring their own Azure subscriptions
- ✅ No credential management needed on your part
- ✅ Each user has full control over their data

### First-Time User Experience

1. User visits the deployed app
2. App detects no configuration and shows a welcome prompt
3. User clicks "Configure Azure OpenAI"
4. User enters their own Azure credentials
5. Credentials are saved in browser localStorage
6. User can now use the app

### Local Development

For local development, you can optionally create a `.env` file:

```env
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-key
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-5.1
```

These variables are only used in development and will NOT be included in the production build.

### Deployment URL

After deployment, your app will be available at:
```
https://<app-name>.azurestaticapps.net
```

You can also configure a custom domain in the Azure Portal.
