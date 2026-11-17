import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemperatureSensor } from './entities/temperature-sensor.entity.js';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto.js';
import { UpdateTemperatureSensorDto } from './dto/update-temperature-sensor.dto.js';
import { TemperatureAlertsService } from './temperature-alerts.service.js';

// Скільки останніх показань віддавати клієнту.
const LAST_RECORDS = 50;

@Injectable()
export class TemperatureSensorsService {
  // Лаб. №6: критична температура, °C. Показання на цій позначці або нижче
  // викликає сповіщення. У робочій системі таке значення виносять у налаштування.
  private readonly CRITICAL_TEMP = -10;

  // У лаб. №1–4 тут був масив `private sensors: TemperatureSensor[] = []`.
  // Тепер дані лежать у PostgreSQL, а сервіс працює з ними через репозиторій.
  constructor(
    @InjectRepository(TemperatureSensor)
    private readonly temperatureSensorRepository: Repository<TemperatureSensor>,
    // Лаб. №6: той самий екземпляр сервісу сповіщень, що й у контролера.
    private readonly alertsService: TemperatureAlertsService,
  ) {}

  // Запит до бази йде мережею, тому методи асинхронні (async / await).
  async create(
    createDto: CreateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const record = this.temperatureSensorRepository.create(createDto);
    // INSERT; id, timestamp і createdAt ставить база.
    const saved = await this.temperatureSensorRepository.save(record);
    // Перевірка стоїть ПІСЛЯ save(): якщо база відхилила запис, сюди
    // виконання не дійде і хибного сповіщення не буде.
    this.checkCriticalTemperature(saved);
    return saved;
  }

  // Лаб. №6: якщо збережене показання критичне — подія йде в потік RxJS,
  // а звідти через SSE всім підключеним клієнтам.
  private checkCriticalTemperature(saved: TemperatureSensor): void {
    if (saved.value <= this.CRITICAL_TEMP) {
      this.alertsService.emitAlert({
        message: `Critical temperature! Value ${saved.value} ${saved.unit}`,
        temperature: saved.value,
        sensorName: saved.sensorName,
        timestamp: saved.timestamp,
        severity: 'critical',
      });
    }
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
    const saved = await this.temperatureSensorRepository.save(sensor); // UPDATE
    // Змінене показання теж може стати критичним.
    this.checkCriticalTemperature(saved);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.temperatureSensorRepository.remove(sensor); // DELETE
  }
}
