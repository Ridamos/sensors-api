import type { Repository } from 'typeorm';
import { TemperatureSensorsService } from './temperature-sensors.service.js';
import {
  TemperatureAlertsService,
  type TemperatureAlert,
} from './temperature-alerts.service.js';
import type { TemperatureSensor } from './entities/temperature-sensor.entity.js';

// Лаб. №6: перевірка правила «температура <= -10 °C → сповіщення».
// Бази тут немає: замість репозиторію підставлено об'єкт-заглушку (mock),
// який «зберігає» запис і одразу повертає його з id та часом.
describe('TemperatureSensorsService: critical temperature alerts', () => {
  let service: TemperatureSensorsService;
  let received: TemperatureAlert[];

  beforeEach(() => {
    const repository = {
      create: (dto: object) => ({ ...dto }),
      save: async (record: object) => ({
        id: 'test-id',
        timestamp: new Date('2026-10-11T10:00:00Z'),
        ...record,
      }),
    } as unknown as Repository<TemperatureSensor>;

    const alertsService = new TemperatureAlertsService();
    received = [];
    // Підписуємося на потік так само, як це робить SSE-ендпоінт.
    alertsService.getAlertStream().subscribe((alert) => received.push(alert));

    service = new TemperatureSensorsService(repository, alertsService);
  });

  it('does not alert on a normal temperature', async () => {
    await service.create({ sensorName: 'DHT22', value: 22.5, unit: 'C' });
    expect(received).toHaveLength(0);
  });

  it('does not alert just above the critical value', async () => {
    await service.create({ sensorName: 'DHT22', value: -9.9, unit: 'C' });
    expect(received).toHaveLength(0);
  });

  it('alerts exactly at the critical value (-10)', async () => {
    await service.create({ sensorName: 'DHT22', value: -10, unit: 'C' });
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      temperature: -10,
      sensorName: 'DHT22',
      severity: 'critical',
    });
  });

  it('alerts below the critical value and fills in the message', async () => {
    await service.create({ sensorName: 'DHT22', value: -15.5, unit: 'C' });
    expect(received).toHaveLength(1);
    expect(received[0].message).toBe('Critical temperature! Value -15.5 C');
    expect(received[0].timestamp).toEqual(new Date('2026-10-11T10:00:00Z'));
  });

  it('delivers the same alert to every subscriber', async () => {
    const alertsService = new TemperatureAlertsService();
    const first: TemperatureAlert[] = [];
    const second: TemperatureAlert[] = [];
    alertsService.getAlertStream().subscribe((alert) => first.push(alert));
    alertsService.getAlertStream().subscribe((alert) => second.push(alert));

    alertsService.emitAlert({
      message: 'test',
      temperature: -12,
      sensorName: 'DHT22',
      timestamp: new Date(),
      severity: 'critical',
    });

    expect(first).toHaveLength(1);
    expect(second).toEqual(first);
  });
});
