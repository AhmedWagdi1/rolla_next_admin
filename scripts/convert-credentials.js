const fs = require('fs');
const path = require('path');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

const credentials = {
  type: 'service_account',
  project_id: projectId,
  private_key_id: '',
  private_key: privateKey,
  client_email: clientEmail,
  client_id: '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: '',
};

const outputPath = path.join(__dirname, '..', 'firebase-credentials.json');
fs.writeFileSync(outputPath, JSON.stringify(credentials, null, 2));

console.log(`Firebase credentials file created at: ${outputPath}`);