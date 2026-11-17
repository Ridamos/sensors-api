import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

// Лаб. №5: був інтерфейс TypeScript, став клас-сутність.
// Декоратори TypeORM описують таблицю "temperature-sensors" у PostgreSQL:
// кожна властивість класу — це колонка.
@Entity('temperature-sensors')
export class TemperatureSensor {
  // Первинний ключ; UUID генерує сама база.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Час вимірювання. Якщо клієнт його не передав — база ставить поточний.
  @Column({
    type: 'timestamptz',
    nullable: true,
    default: () => 'NOW()',
  })
  timestamp: Date;

  @Column({
    type: 'varchar',
    length: 200,
  })
  sensorName: string;

  @Column({
    type: 'double precision',
  })
  value: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  unit: string;

  // Час запису рядка в базу; ставиться автоматично.
  @Index('IDX_temperature_sensors_createdAt')
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
