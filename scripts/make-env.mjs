// Створює файл .env із параметрами підключення до бази даних.
//
//   node scripts/make-env.mjs "postgresql://user:password@host/database"
//
// Адресу беруть на Render: ваша база → Connect → External → External Database URL.
// Скрипт розбирає її на п'ять змінних, які читає сервер (src/app.module.ts).
import { existsSync, renameSync, writeFileSync } from 'node:fs';

const input = (process.argv[2] ?? '').trim();

function fail(message) {
  console.error(`\n  ${message}\n`);
  console.error('  Приклад:');
  console.error(
    '  node scripts/make-env.mjs "postgresql://sensors_user:PASSWORD@dpg-xxxx-a.frankfurt-postgres.render.com/sensors_db"\n',
  );
  process.exit(1);
}

if (!input) fail('Не передано адресу бази даних (External Database URL).');

let url;
try {
  url = new URL(input);
} catch {
  fail('Це не схоже на адресу бази даних. Скопіюйте External Database URL повністю, у лапках.');
}

if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
  fail(`Адреса має починатися з postgresql://, а не з ${url.protocol}//`);
}

const settings = {
  DB_HOST: url.hostname,
  DB_PORT: url.port || '5432',
  DB_USERNAME: decodeURIComponent(url.username),
  DB_PASSWORD: decodeURIComponent(url.password),
  DB_NAME: decodeURIComponent(url.pathname.replace(/^\//, '')),
};

const empty = Object.keys(settings).filter((key) => !settings[key]);
if (empty.length > 0) {
  fail(`В адресі бракує частини: ${empty.join(', ')}. Скопіюйте External Database URL повністю.`);
}

// Внутрішня адреса Render (dpg-…-a без домену) працює лише між сервісами Render.
if (!settings.DB_HOST.includes('.') && settings.DB_HOST !== 'localhost') {
  fail(
    `Хост "${settings.DB_HOST}" — це внутрішня адреса (Internal Database URL). ` +
      'Зі свого комп\'ютера потрібна зовнішня: Connect → External, хост закінчується на .render.com',
  );
}

// Значення з пробілами, # або лапками беремо в лапки, щоб .env прочитався правильно.
const quote = (value) =>
  /[\s#'"`$\\]/.test(value) ? `'${value.replaceAll("'", "\\'")}'` : value;

const lines = Object.entries(settings).map(([key, value]) => `${key}=${quote(value)}`);

if (existsSync('.env')) {
  renameSync('.env', '.env.bak');
  console.log('Попередній файл .env збережено як .env.bak');
}
writeFileSync('.env', lines.join('\n') + '\n');

console.log('Створено файл .env:\n');
for (const [key, value] of Object.entries(settings)) {
  console.log(`  ${key}=${key === 'DB_PASSWORD' ? '*'.repeat(8) : value}`);
}
console.log('\nДалі: npm run db:check — перевірка підключення.');
