import axios from 'axios';

async function getClientCredentialsToken() {
  const keycloakUrl = process.env.EXPO_PUBLIC_KEYCLOAK_URL || '';
  const clientId = process.env.EXPO_PUBLIC_KEYCLOAK_ID || '';
  const clientSecret = process.env.EXPO_PUBLIC_KEYCLOAK_SECRET || '';

  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', clientId);
  body.append('client_secret', clientSecret);

  const response = await axios.post(keycloakUrl, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export { getClientCredentialsToken };
