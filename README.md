# sensors-api — серверний застосунок (NestJS + PostgreSQL + SSE)

REST API для давачів температури та диму. Показання зберігаються в базі даних
PostgreSQL через TypeORM (лаб. №5). З лаб. №6 сервер ще й сповіщає клієнтів про
критичні показання в реальному часі — через Server-Sent Events.

## Запуск у Docker

З папки на рівень вище (там лежить `docker-compose.yml`):

```
docker compose up --build
```

Сервер: http://localhost:3000. База даних запускається в сусідньому
контейнері, файл `.env` не потрібен.

## Запуск локально без Docker

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
| `DB_SSL` | необов'язково: `false` лише для локального PostgreSQL без шифрування (так задано в `docker-compose.yml`) |

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

Версія Node береться з файлу `.node-version`. У полі **Language** лишайте
**Node**, як у лаб. №5. Варіант **Docker** там теж є — тоді Render сам збирає
образ із `Dockerfile`, — але для лабораторної він не потрібен.

## Ендпоінти

| Метод  | Шлях                        | Опис                                   |
|--------|-----------------------------|----------------------------------------|
| GET    | /                           | Hello World (перевірка сервера)        |
| POST   | /temperature-sensors        | додати показання температури           |
| GET    | /temperature-sensors        | останні 50 показань, від старих до нових |
| GET    | /temperature-sensors/alerts | **SSE:** потік сповіщень про температуру ≤ −10 °C |
| GET    | /temperature-sensors/:id    | показання за id                        |
| PATCH  | /temperature-sensors/:id    | оновити                                |
| DELETE | /temperature-sensors/:id    | видалити                               |
| POST   | /smoke-sensors              | додати показання диму                  |
| GET    | /smoke-sensors              | останні 50 показань диму               |
| GET    | /smoke-sensors/alarms       | останні 50 показань у стані тривоги    |
| GET    | /smoke-sensors/alerts       | **SSE:** потік сповіщень про дим на порозі або вище |
| GET    | /smoke-sensors/:id          | показання за id                        |
| PATCH  | /smoke-sensors/:id          | оновити (тривога перераховується)      |
| DELETE | /smoke-sensors/:id          | видалити                               |

Давач температури доступний також за старою адресою `/sensors` (як у лаб. №1).
`:id` має бути UUID, інакше відповідь `400`.

## Сповіщення SSE (лаб. №6)

| Файл | Роль |
|---|---|
| `src/temperature-sensors/temperature-alerts.service.ts` | потік подій про температуру (RxJS `Subject`) |
| `src/smoke-sensors/smoke-alerts.service.ts` | потік подій про дим |
| `src/*/…sensors.service.ts` | після `save()` перевіряє показання і викликає `emitAlert()` |
| `src/*/…sensors.controller.ts` | метод з `@Sse('alerts')` віддає потік клієнтам |
| `src/common/sse-keep-alive.ts` | рядок-коментар кожні 15 с, щоб проксі-сервери не рвали з'єднання |

Перевірка в терміналі (у PowerShell саме `curl.exe`):

```
curl.exe -N http://localhost:3000/temperature-sensors/alerts
```

Команда «зависає» — це відкрите з'єднання. Надішліть в іншому вікні POST із
температурою −10 або нижче, і в першому з'явиться рядок `data: {…}`.

Подія про температуру:

```json
{"message":"Critical temperature! Value -15.5 C","temperature":-15.5,"sensorName":"DHT22","timestamp":"2026-10-11T10:31:06.722Z","severity":"critical"}
```

Подія про дим:

```json
{"message":"Smoke alarm! Value 420 ppm (threshold 300 ppm)","value":420,"unit":"ppm","threshold":300,"sensorName":"MQ-2","location":"Wokwi","timestamp":"2026-10-11T10:31:06.757Z","severity":"critical"}
```

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
| `npm test` | модульні тести правил сповіщення (без бази даних) |
