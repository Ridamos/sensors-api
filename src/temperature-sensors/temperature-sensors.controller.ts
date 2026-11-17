import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Sse,
  type MessageEvent,
} from '@nestjs/common';
import { Observable, map, merge } from 'rxjs';
import { TemperatureSensorsService } from './temperature-sensors.service.js';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto.js';
import { UpdateTemperatureSensorDto } from './dto/update-temperature-sensor.dto.js';
import { TemperatureAlertsService } from './temperature-alerts.service.js';
import { keepAlive } from '../common/sse-keep-alive.js';

// Дві адреси для одного контролера:
//   /temperature-sensors — так давач названо в методичках лаб. №3–6;
//   /sensors             — адреса з лаб. №1, щоб стара колекція Postman працювала далі.
// Контролер не знає, де лежать дані: він лише передає запит сервісу.
@Controller(['temperature-sensors', 'sensors'])
export class TemperatureSensorsController {
  constructor(
    private readonly temperatureSensorsService: TemperatureSensorsService,
    private readonly alertsService: TemperatureAlertsService,
  ) {}

  @Post()
  create(@Body() createTemperatureSensorDto: CreateTemperatureSensorDto) {
    return this.temperatureSensorsService.create(createTemperatureSensorDto);
  }

  @Get()
  findAll() {
    return this.temperatureSensorsService.findAll();
  }

  // Лаб. №6: SSE-ендпоінт GET /temperature-sensors/alerts.
  // Звичайний маршрут відповідає і закриває з'єднання. Цей тримає його
  // відкритим (Content-Type: text/event-stream) і дописує в нього кожну
  // подію з потоку — без повторних запитів від клієнта.
  // ВАЖЛИВО: оголошено ДО ':id', інакше 'alerts' сприйметься як id.
  @Sse('alerts')
  alerts(): Observable<MessageEvent> {
    return merge(
      // TemperatureAlert → формат SSE: корисні дані лежать у полі data.
      this.alertsService
        .getAlertStream()
        .pipe(map((alert) => ({ data: alert }))),
      keepAlive(),
    );
  }

  // ParseUUIDPipe: якщо id в адресі не UUID, сервер одразу відповідає 400
  // і не звертається до бази.
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.temperatureSensorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemperatureSensorDto: UpdateTemperatureSensorDto,
  ) {
    return this.temperatureSensorsService.update(
      id,
      updateTemperatureSensorDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.temperatureSensorsService.remove(id);
  }
}
