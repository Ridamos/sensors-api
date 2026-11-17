import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemperatureSensor } from './entities/temperature-sensor.entity.js';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto.js';
import { UpdateTemperatureSensorDto } from './dto/update-temperature-sensor.dto.js';

// Скільки останніх показань віддавати клієнту.
const LAST_RECORDS = 50;

@Injectable()
export class TemperatureSensorsService {
  // У лаб. №1–4 тут був масив `private sensors: TemperatureSensor[] = []`.
  // Тепер дані лежать у PostgreSQL, а сервіс працює з ними через репозиторій.
  constructor(
    @InjectRepository(TemperatureSensor)
    private readonly temperatureSensorRepository: Repository<TemperatureSensor>,
  ) {}

  // Запит до бази йде мережею, тому методи асинхронні (async / await).
  async create(
    createDto: CreateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const record = this.temperatureSensorRepository.create(createDto);
    // INSERT; id, timestamp і createdAt ставить база.
    return await this.temperatureSensorRepository.save(record);
  }

  async findAll(): Promise<TemperatureSensor[]> {
    // SELECT … ORDER BY "createdAt" DESC LIMIT 50 — останні 50 показань.
    const records = await this.temperatureSensorRepository.find({
      order: { createdAt: 'DESC' },
      take: LAST_RECORDS,
    });
    // Клієнт будує графік зліва направо, тому віддаємо від старих до нових,
    // як це було з масивом.
    return records.reverse();
  }

  async findOne(id: string): Promise<TemperatureSensor> {
    const sensor = await this.temperatureSensorRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException(`sensor with id ${id} not found`);
    return sensor;
  }

  async update(
    id: string,
    updateDto: UpdateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const sensor = await this.findOne(id);
    Object.assign(sensor, updateDto);
    return await this.temperatureSensorRepository.save(sensor); // UPDATE
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.temperatureSensorRepository.remove(sensor); // DELETE
  }
}
