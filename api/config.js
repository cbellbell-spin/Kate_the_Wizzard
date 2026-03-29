// Shared configuration for all serverless functions
// Update the model name here to change it across all functions

const MODEL_NAME = 'claude-sonnet-4-7-latest';

const API_CONFIG = {
  model: MODEL_NAME,
  anthropicVersion: '2023-06-01',
};

module.exports = { API_CONFIG, MODEL_NAME };
