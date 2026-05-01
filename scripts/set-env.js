// Genera src/environments/environment*.ts a partir de .env
// Ejecutar antes de build/serve: node scripts/set-env.js

const { writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '../.env') });

const required = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\n❌  Variables faltantes en .env:\n  ' + missing.join('\n  '));
  console.error('\nCopia .env.example → .env y completa los valores.\n');
  process.exit(1);
}

const firebase = {
  apiKey:            process.env.FIREBASE_API_KEY,
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.FIREBASE_PROJECT_ID,
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.FIREBASE_APP_ID,
  ...(process.env.FIREBASE_MEASUREMENT_ID && { measurementId: process.env.FIREBASE_MEASUREMENT_ID }),
};

const dev = `// AUTO-GENERADO por scripts/set-env.js — no editar a mano
export const environment = {
  production: false,
  firebase: ${JSON.stringify(firebase, null, 2).replace(/^/gm, '')}
};
`;

const prod = `// AUTO-GENERADO por scripts/set-env.js — no editar a mano
export const environment = {
  production: true,
  firebase: ${JSON.stringify(firebase, null, 2).replace(/^/gm, '')}
};
`;

const envDir = resolve(__dirname, '../src/environments');
writeFileSync(`${envDir}/environment.ts`, dev);
writeFileSync(`${envDir}/environment.prod.ts`, prod);

console.log('✅  Environments generados desde .env');
