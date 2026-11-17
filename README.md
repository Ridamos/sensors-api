# sensors-api — серверний застосунок (NestJS + PostgreSQL)

REST API для давачів температури та диму. З лаб. №5 показання зберігаються в
базі даних PostgreSQL на Render через TypeORM, а не в масивах у пам'яті.

## Запуск локально

```
npm install
node scripts/make-env.mjs "postgresql://user:password@host/database"
npm run db:check
npm run start:dev
```

Сервер: http://localhost:3000. Без файлу `.env` він не запускається і пише,
яких змінних бракує.

Потрібен Node.js 22.13+ або 24.11+.

## Змінні середовища

| Змінна | Значення |
|---|---|
| `DB_HOST` | хост бази; зі свого комп'ютера — зовнішній, закінчується на `.render.com` |
| `DB_PORT` | `5432` |
| `DB_USERNAME` | користувач бази |
| `DB_PASSWORD` | пароль |
| `DB_NAME` | назва бази (поле Database на Render) |
| `PORT` | порт сервера; Render задає сам, локально 3000 |
| `FRONTEND_URL` | необов'язково: обмежує CORS одним доменом; без неї дозволено всім |
| `DB_SSL` | необов'язково: `false` лише для локального PostgreSQL без шифрування |

Локально змінні лежать у `.env` (не потрапляє в Git), на Render — у розділі
**Environment** веб-сервісу.

## Розгортання на Render

| Поле | Значення |
|---|---|
| Language | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` |
| Instance Type | Free |
| Environment Variables | п'ять змінних `DB_…` |

Версія Node береться з файлу `.node-version`.

## Ендпоінти

| Метод  | Шлях                        | Опис                                   |
|--------|-----------------------------|----------------------------------------|
| GET    | /                           | Hello World (перевірка сервера)        |
| POST   | /temperature-sensors        | додати показання температури           |
| GET    | /temperature-sensors        | останні 50 показань, від старих до нових |
| GET    | /temperature-sensors/:id    | показання за id                        |
| PATCH  | /temperature-sensors/:id    | оновити                                |
| DELETE | /temperature-sensors/:id    | видалити                               |
| POST   | /smoke-sensors              | додати показання диму                  |
| GET    | /smoke-sensors              | останні 50 показань диму               |
| GET    | /smoke-sensors/alarms       | останні 50 показань у стані тривоги    |
| GET    | /smoke-sensors/:id          | показання за id                        |
| PATCH  | /smoke-sensors/:id          | оновити (тривога перераховується)      |
| DELETE | /smoke-sensors/:id          | видалити                               |

Давач температури доступний також за старою адресою `/sensors` (як у лаб. №1).
`:id` має бути UUID, інакше відповідь `400`.

## Таблиці

`temperature-sensors`: `id` uuid, `timestamp` timestamptz, `sensorName`
varchar(200), `value` double precision, `unit` varchar(20), `createdAt` timestamptz.

`smoke-sensors`: ті самі колонки плюс `location` varchar(200), `threshold`
double precision, `alarm` boolean.

Таблиці створює міграція `src/migrations/1791676800000-CreateSensorTables.ts`
під час першого запуску сервера (`migrationsRun: true`). `synchronize`
вимкнено: сам TypeORM схему не змінює.

## Давач диму

Поля запиту: `sensorName`, `location`, `value` (≥ 0), `unit` (`ppm` або `%/m`),
`threshold` (необов'язково). Сервер рахує `alarm = value >= threshold` і
записує результат у базу. Поріг за замовчуванням: 300 ppm / 4 %/m.

## Команди

| Команда | Дія |
|---|---|
| `npm run start:dev` | сервер із перезапуском після зміни файлів |
| `npm run build` | збірка в `dist/` |
| `npm run start:prod` | запуск зібраного сервера (так його запускає Render) |
| `npm run db:check` | перевірка підключення і вміст таблиць |
| `node scripts/make-env.mjs "…"` | створити `.env` з External Database URL |
| `npm run lint` | перевірка коду |
