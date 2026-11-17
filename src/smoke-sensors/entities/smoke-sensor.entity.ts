import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** Давач диму (напр. газовий MQ-2). Таблиця "smoke-sensors" у PostgreSQL. */
@Entity('smoke-sensors')
export class SmokeSensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Час вимірювання; якщо не задано — база ставить поточний.
  @Column({ type: 'timestamptz', nullable: true, default: () => 'NOW()' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 200 })
  sensorName: string;

  // Де встановлений: "Серверна", "Кухня"...
  @Column({ type: 'varchar', length: 200 })
  location: string;

  // Концентрація диму.
  @Column({ type: 'double precision' })
  value: number;

  // 'ppm' або '%/m' (оптична щільність).
  @Column({ type: 'varchar', length: 20 })
  unit: string;

  // Поріг спрацювання тривоги.
  @Column({ type: 'double precision' })
  threshold: number;

  // Обчислює сервер перед записом: value >= threshold.
  @Column({ type: 'boolean' })
  alarm: boolean;

  // Час запису рядка в базу; ставиться автоматично.
  @Index('IDX_smoke_sensors_createdAt')
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
