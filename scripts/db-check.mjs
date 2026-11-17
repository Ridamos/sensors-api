// Перевіряє підключення до бази даних і показує, що в ній лежить.
//
//   npm run db:check
//
// Читає ті самі змінні з .env, що й сервер. Нічого в базі не змінює.
import pg from 'pg';

try {
  process.loadEnvFile('.env');
} catch {
  // Файла .env немає — можливо, змінні задано в середовищі (як на Render).
}

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SSL } = process.env;

const missing = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'].filter(
  (key) => !process.env[key],
);
if (missing.length > 0) {
  console.error(`\n  У файлі .env бракує: ${missing.join(', ')}`);
  console.error('  Запускайте команду в папці sensors-api. Створити .env:');
  console.error('  node scripts/make-env.mjs "postgresql://user:password@host/database"\n');
  process.exit(1);
}
if (/[:/@]/.test(DB_HOST)) {
  console.error('\n  DB_HOST має містити лише назву хоста, а не всю адресу postgresql://…');
  console.error('  Потрібна частина між @ і наступною косою рискою.\n');
  process.exit(1);
}

const client = new pg.Client({
  host: DB_HOST,
  port: Number(DB_PORT || 5432),
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

// Підказка за кодом помилки: який рядок .env неправильний.
function hint(error) {
  const text = `${error.code ?? ''} ${error.message ?? ''}`;
  if (/ENOTFOUND|EAI_AGAIN/.test(text)) {
    return DB_HOST.includes('.')
      ? 'Хост не знайдено: помилка в DB_HOST або немає інтернету.'
      : 'У DB_HOST внутрішня адреса Render. Потрібна зовнішня (Connect → External), вона закінчується на .render.com';
  }
  if (/28P01|password authentication/.test(text)) {
    return 'Неправильний DB_USERNAME або DB_PASSWORD. Скопіюйте їх із Render ще раз.';
  }
  if (/3D000|does not exist/.test(text)) {
    return 'Неправильний DB_NAME. Це поле Database на сторінці бази, а не назва сервісу (Name).';
  }
  if (/ETIMEDOUT|timeout|ECONNREFUSED/i.test(text)) {
    return 'Сервер бази не відповідає: база ще створюється, неправильний DB_PORT або мережа блокує порт 5432.';
  }
  if (/SSL|no encryption|no pg_hba/i.test(text)) {
    return 'База вимагає шифрування. Видаліть рядок DB_SSL=false з файлу .env.';
  }
  return 'Перевірте всі п\'ять рядків .env за сторінкою бази на Render.';
}

const TABLES = ['temperature-sensors', 'smoke-sensors'];

try {
  await client.connect();
  const info = await client.query(
    `SELECT current_database() AS db, current_user AS usr, version() AS version,
            (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()) AS ssl`,
  );
  const { db, usr, version, ssl } = info.rows[0];
  console.log(`\nConnected to ${DB_HOST}`);
  console.log(`  database:   ${db}`);
  console.log(`  user:       ${usr}`);
  console.log(`  encryption: ${ssl ? 'on (SSL/TLS)' : 'off'}`);
  console.log(`  server:     ${version.split(' on ')[0]}`);

  const existing = await client.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name`,
  );
  const names = existing.rows.map((row) => row.table_name);
  console.log(`\nТаблиці: ${names.length > 0 ? names.join(', ') : '(жодної)'}`);

  if (!TABLES.some((table) => names.includes(table))) {
    console.log(
      '\nТаблиць давачів ще немає — сервер створить їх під час першого запуску (npm run start:dev).',
    );
  }

  for (const table of TABLES) {
    if (!names.includes(table)) continue;
    const count = await client.query(`SELECT count(*)::int AS n FROM "${table}"`);
    console.log(`\n"${table}": рядків — ${count.rows[0].n}`);
    const last = await client.query(
      `SELECT * FROM "${table}" ORDER BY "createdAt" DESC LIMIT 5`,
    );
    if (last.rows.length > 0) {
      console.table(
        last.rows.map((row) => ({
          createdAt: row.createdAt.toISOString().replace('T', ' ').slice(0, 19),
          sensorName: row.sensorName,
          value: row.value,
          unit: row.unit,
          ...(table === 'smoke-sensors'
            ? { threshold: row.threshold, alarm: row.alarm }
            : {}),
          id: row.id.slice(0, 8) + '…',
        })),
      );
    }
  }

  if (names.includes('migrations')) {
    const done = await client.query(`SELECT name FROM "migrations" ORDER BY id`);
    console.log(`\nВиконані міграції: ${done.rows.map((row) => row.name).join(', ') || '(жодної)'}`);
  }
  console.log('');
} catch (error) {
  console.error(`\n  Не вдалося підключитися до ${DB_HOST}: ${error.message}`);
  console.error(`  ${hint(error)}\n`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
