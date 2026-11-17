import { MigrationInterface, QueryRunner } from 'typeorm';

// Міграція — зміна схеми бази, записана кодом. TypeORM виконує її один раз і
// запам'ятовує це в службовій таблиці "migrations", тому повторний запуск
// сервера таблиці не чіпає. Число в назві — час створення міграції; за ним
// TypeORM визначає порядок, якщо міграцій кілька.
export class CreateSensorTables1791676800000 implements MigrationInterface {
  name = 'CreateSensorTables1791676800000';

  // up — що зробити з базою.
  public async up(queryRunner: QueryRunner): Promise<void> {
    // IF NOT EXISTS: якщо таблицю вже створив synchronize: true (як у методичці),
    // вона лишається разом із даними.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "temperature-sensors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "sensorName" character varying(200) NOT NULL,
        "value" double precision NOT NULL,
        "unit" character varying(20),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_temperature_sensors" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "smoke-sensors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "sensorName" character varying(200) NOT NULL,
        "location" character varying(200) NOT NULL,
        "value" double precision NOT NULL,
        "unit" character varying(20) NOT NULL,
        "threshold" double precision NOT NULL,
        "alarm" boolean NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_smoke_sensors" PRIMARY KEY ("id")
      )
    `);
    // Запит «останні 50 показань» сортує за createdAt — індекс робить його швидким.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_temperature_sensors_createdAt" ON "temperature-sensors" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_smoke_sensors_createdAt" ON "smoke-sensors" ("createdAt")`,
    );
  }

  // down — як скасувати міграцію (npx typeorm migration:revert).
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "smoke-sensors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "temperature-sensors"`);
  }
}
