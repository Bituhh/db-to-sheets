const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');
const {DatabaseConfig} = require('../models/database-config.model');
const secretsManagerClient = new SecretsManagerClient({region: process.env.AWS_REGION ?? 'eu-west-2'});
const stage = process.env.stage ?? 'dev';

class SecretManager {
  /**
   * @param {string} secretId
   * @returns {DatabaseConfig}
   */
  static async getSecret(secretId) {
    if (!secretId.startsWith(`/db-to-sheets/${stage}/`)) {
      throw new Error('Secret ID doesn\'t match the expected format.');
    }
    const getParameter = new GetSecretValueCommand({SecretId: secretId});
    const response = await secretsManagerClient.send(getParameter);
    return new DatabaseConfig(JSON.parse(response.SecretString));
  }
}

module.exports = {SecretManager};
