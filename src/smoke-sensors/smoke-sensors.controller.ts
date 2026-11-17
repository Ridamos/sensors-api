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
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { CreateSmokeSensorDto } from './dto/create-smoke-sensor.dto.js';
import { UpdateSmokeSensorDto } from './dto/update-smoke-sensor.dto.js';

@Controller('smoke-sensors')
export class SmokeSensorsController {
  constructor(private readonly smokeSensorsService: SmokeSensorsService) {}

  @Post()
  create(@Body() dto: CreateSmokeSensorDto) {
    return this.smokeSensorsService.create(dto);
  }

  @Get()
  findAll() {
    return this.smokeSensorsService.findAll();
  }

  // ВАЖЛИВО: оголошено ДО ':id', інакше 'alarms' сприйметься як id
  @Get('alarms')
  findAlarms() {
    return this.smokeSensorsService.findAlarms();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.smokeSensorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSmokeSensorDto,
  ) {
    return this.smokeSensorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.smokeSensorsService.remove(id);
  }
}
