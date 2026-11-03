# sensors-api — серверний застосунок (NestJS)

REST API для давачів температури та диму. Дані зберігаються в масивах у пам'яті
сервера. Проєкт з лаб. №1, у лаб. №3 додано CORS і підготовку до розгортання на Render.

## Запуск локально

```
npm install
npm run start:dev
```

Сервер: http://localhost:3000

Якщо `npm install` падає з `Cannot read properties of null (reading 'edgesOut')`,
це баг npm 10. Файл `.npmrc` у проєкті вже містить `legacy-peer-deps=true`, що його обходить.

## Розгортання на Render

| Поле | Значення |
|---|---|
| Language | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` |
| Instance Type | Free |

Порт Render передає у змінній `PORT`, версія Node береться з файлу `.node-version`.
Необов'язкова змінна `FRONTEND_URL` обмежує CORS одним доменом; без неї дозволено всім.

## Ендпоінти

| Метод  | Шлях                        | Опис                                |
|--------|-----------------------------|-------------------------------------|
| GET    | /                           | Hello World (перевірка сервера)     |
| POST   | /temperature-sensors        | додати показання температури        |
| GET    | /temperature-sensors        | усі показання температури           |
| GET    | /temperature-sensors/:id    | показання за id                     |
| PATCH  | /temperature-sensors/:id    | оновити                             |
| DELETE | /temperature-sensors/:id    | видалити                            |
| POST   | /smoke-sensors              | додати показання диму               |
| GET    | /smoke-sensors              | усі показання диму                  |
| GET    | /smoke-sensors/alarms       | лише показання в стані тривоги      |
| GET    | /smoke-sensors/:id          | показання за id                     |
| PATCH  | /smoke-sensors/:id          | оновити (тривога перераховується)   |
| DELETE | /smoke-sensors/:id          | видалити                            |

Давач температури доступний також за старою адресою `/sensors` (як у лаб. №1).

## Давач диму

Поля: `sensorName`, `location`, `value` (≥ 0), `unit` (`ppm` або `%/m`), `threshold` (необов'язково).
Сервер сам ставить `id`, `timestamp` і `alarm = value >= threshold`.
Поріг за замовчуванням: 300 ppm / 4 %/m.

## CORS

`src/main.ts`:

```ts
app.enableCors({
  origin: process.env.FRONTEND_URL || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
});
```
