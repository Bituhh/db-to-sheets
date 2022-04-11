const {SecretManager} = require('./index');
const {
  SecretsManagerClient,
  ListSecretsCommand,
} = require('@aws-sdk/client-secrets-manager');
const secretsManagerClient = new SecretsManagerClient({});
const stage = process.env.stage ?? 'dev';

describe('SecretManager', () => {
  const getRandomValidSecretName = async () => {
    const response = await secretsManagerClient.send(new ListSecretsCommand({
      Filters: [{Key: 'name', Values: [`/db-to-sheets/${stage}/testing`]}],
    }));
    const index = Math.floor(response.SecretList.length * Math.random());
    if (response.SecretList[index]) {
      return response.SecretList[index].Name;
    } else {
      throw new Error('No test secret was added to AWS.');
    }
  };

  const getRandomAlphanumericValue = () => Math.random()
    .toString(36)
    .slice(2);

  it('should exist', () => {
    expect(SecretManager).toBeDefined();
  });

  describe('getSecret', () => {
    it('should exist', () => {
      expect(SecretManager.getSecret).toBeDefined();
    });

    it('should only accept secret id with format /db-to-sheets/{stage}/*', async () => {
      await expect(SecretManager.getSecret('/wrong/format/'))
        .rejects
        .toThrow('Secret ID doesn\'t match the expected format.');

      await expect(SecretManager.getSecret('/db-to-sheets/format'))
        .rejects
        .toThrow('Secret ID doesn\'t match the expected format.');

      await expect(SecretManager.getSecret(`/db-to-sheets/${stage}`))
        .rejects
        .toThrow('Secret ID doesn\'t match the expected format.');
    });

    it('should return object if a valid parameter is passed', async () => {
      const validParameter = await getRandomValidSecretName();
      const result = await SecretManager.getSecret(validParameter);
      expect(result).toBeInstanceOf(Object);
    });

    it('should return object with correct structure', async () => {
      const validParameter = await getRandomValidSecretName();
      const result = await SecretManager.getSecret(validParameter);
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('engine');
      expect(result).toHaveProperty('host');
      expect(result).toHaveProperty('port');
      expect(result).toHaveProperty('dbname');
      expect(result).toHaveProperty('password');
    });

    it('throw error for any random invalid parameter', async () => {
      const randomValue = getRandomAlphanumericValue();
      await expect(SecretManager.getSecret(randomValue)).rejects.toThrow();
    });
  });
});
