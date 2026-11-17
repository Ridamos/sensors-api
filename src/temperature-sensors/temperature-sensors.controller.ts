import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TemperatureSensorsService } from './temperature-sensors.service.js';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto.js';
import { UpdateTemperatureSensorDto } from './dto/update-temperature-sensor.dto.js';

// Дві адреси для одного контролера:
//   /temperature-sensors — так давач названо в методичках лаб. №3–6;
//   /sensors             — адреса з лаб. №1, щоб стара колекція Postman працювала далі.
// Контролер не знає, де лежать дані: він лише передає запит сервісу.
@Controller(['temperature-sensors', 'sensors'])
export class TemperatureSensorsController {
  constructor(
    private readonly temperatureSensorsService: TemperatureSensorsService,
  ) {}

  @Post()
  create(@Body() createTemperatureSensorDto: CreateTemperatureSensorDto) {
    return this.temperatureSensorsService.create(createTemperatureSensorDto);
  }

  @Get()
  findAll() {
    return this.temperatureSensorsService.findAll();
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
