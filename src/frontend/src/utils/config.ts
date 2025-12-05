// Configuration management for Azure services

export interface AzureConfig {
  openai: {
    endpoint: string;
    apiKey: string;
    deploymentName: string;
  };
}

const CONFIG_STORAGE_KEY = 'migration-coach-azure-config';

// Get default configuration from environment variables (only for local development)
// In production, these will be empty and users must configure via Settings page
export const getDefaultConfig = (): AzureConfig => {
  return {
    openai: {
      endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
      apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
      deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-5.1',
    },
  };
};

// Get current configuration (from localStorage or environment)
export const getConfig = (): AzureConfig => {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      const defaults = getDefaultConfig();
      return {
        openai: { ...defaults.openai, ...parsed.openai },
      };
    }
  } catch (e) {
    console.error('Failed to parse stored configuration', e);
  }
  return getDefaultConfig();
};

// Save configuration to localStorage
export const saveConfig = (config: AzureConfig): void => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

// Clear stored configuration (revert to environment defaults)
export const clearConfig = (): void => {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
};

// Check if configuration is valid
export const isConfigValid = (config: AzureConfig): boolean => {
  return !!(
    config.openai.endpoint &&
    config.openai.apiKey &&
    config.openai.deploymentName
  );
};

// Check if using environment defaults or custom config
export const isUsingCustomConfig = (): boolean => {
  return localStorage.getItem(CONFIG_STORAGE_KEY) !== null;
};
