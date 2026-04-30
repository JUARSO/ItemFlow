/**
 * Lee .env y genera src/environments/environment*.ts
 * Se ejecuta automáticamente antes de `ng serve` y `ng build`
 */
const dotenv = require('dotenv');
const fs     = require('fs');
const path   = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n❌  Variable de entorno faltante: ${key}`);
    console.error('    Copia .env.example → .env y agrega tus valores.\n');
    process.exit(1);
  }
}

const shared = `
  supabaseUrl:     '${process.env.SUPABASE_URL}',
  supabaseAnonKey: '${process.env.SUPABASE_ANON_KEY}'`;

const devContent = `// Generado por scripts/set-env.js — no editar manualmente
export const environment = {
  production: false,${shared}
};
`;

const prodContent = `// Generado por scripts/set-env.js — no editar manualmente
export const environment = {
  production: true,${shared}
};
`;

const envDir = path.resolve(__dirname, '../src/environments');

fs.writeFileSync(path.join(envDir, 'environment.ts'),      devContent);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodContent);

console.log('✅  environment.ts generado desde .env');
