import React, { useState, useEffect } from 'react';
import { getConfig, getDefaultConfig, saveConfig, clearConfig, isUsingCustomConfig, type AzureConfig } from '../utils/config';

interface Props {
  onClose: () => void;
}

export const ConfigPage: React.FC<Props> = ({ onClose }) => {
  const [config, setConfig] = useState<AzureConfig>(getConfig());
  const [showKeys, setShowKeys] = useState(false);
  const [isCustom, setIsCustom] = useState(isUsingCustomConfig());
  const [isSaved, setIsSaved] = useState(false);
  const defaultConfig = getDefaultConfig();

  useEffect(() => {
    setIsCustom(isUsingCustomConfig());
  }, []);

  const handleSave = () => {
    saveConfig(config);
    setIsCustom(true);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    clearConfig();
    setConfig(getDefaultConfig());
    setIsCustom(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setConfig({
      ...config,
      openai: {
        ...config.openai,
        [field]: value,
      },
    });
  };

  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Azure Configuration</h1>
                <p className="text-blue-100">Configure Azure OpenAI settings for the Migration Coach</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Status Banner */}
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              isCustom ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isCustom ? 'bg-blue-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-semibold text-gray-800">
                    {isCustom ? 'Using Custom Configuration' : 'Using Environment Defaults'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isCustom 
                      ? 'Configuration is saved in browser storage' 
                      : 'Configuration loaded from .env file'}
                  </p>
                </div>
              </div>
              {isCustom && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
              )}
            </div>

            {/* Save Confirmation */}
            {isSaved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">Configuration saved successfully!</p>
              </div>
            )}

            {/* Show/Hide Keys Toggle */}
            <div className="mb-6 flex items-center justify-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showKeys}
                  onChange={(e) => setShowKeys(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Show API Keys</span>
              </label>
            </div>

            {/* Azure OpenAI Configuration */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Azure OpenAI
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endpoint
                    {defaultConfig.openai.endpoint && (
                      <span className="ml-2 text-xs text-gray-500">(Default: {defaultConfig.openai.endpoint})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={config.openai.endpoint}
                    onChange={(e) => handleChange('endpoint', e.target.value)}
                    placeholder="https://your-resource.openai.azure.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                    {defaultConfig.openai.apiKey && (
                      <span className="ml-2 text-xs text-gray-500">(Default: {maskValue(defaultConfig.openai.apiKey)})</span>
                    )}
                  </label>
                  <input
                    type={showKeys ? 'text' : 'password'}
                    value={config.openai.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    placeholder="Your Azure OpenAI API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Name
                    {defaultConfig.openai.deploymentName && (
                      <span className="ml-2 text-xs text-gray-500">(Default: {defaultConfig.openai.deploymentName})</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={config.openai.deploymentName}
                    onChange={(e) => handleChange('deploymentName', e.target.value)}
                    placeholder="gpt-4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Configuration
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Configuration Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Environment variables are loaded from your <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
                <li>• Custom configuration is stored in browser localStorage</li>
                <li>• You can override environment defaults by saving custom values</li>
                <li>• Click "Reset to Defaults" to clear custom config and use environment values</li>
                <li>• Changes take effect immediately after saving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
