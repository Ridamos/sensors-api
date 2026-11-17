import type { Repository } from 'typeorm';
import { SmokeSensorsService } from './smoke-sensors.service.js';
import { SmokeAlertsService, type SmokeAlert } from './smoke-alerts.service.js';
import type { SmokeSensor } from './entities/smoke-sensor.entity.js';

// Лаб. №6: перевірка правила «дим на порозі або вище → сповіщення».
describe('SmokeSensorsService: smoke alerts', () => {
  let service: SmokeSensorsService;
  let received: SmokeAlert[];

  beforeEach(() => {
    const repository = {
      create: (dto: object) => ({ ...dto }),
      save: async (record: object) => ({
        id: 'test-id',
        timestamp: new Date('2026-10-11T10:00:00Z'),
        ...record,
      }),
    } as unknown as Repository<SmokeSensor>;

    const alertsService = new SmokeAlertsService();
    received = [];
    alertsService.getAlertStream().subscribe((alert) => received.push(alert));

    service = new SmokeSensorsService(repository, alertsService);
  });

  const reading = (value: number, extra: object = {}) => ({
    sensorName: 'MQ-2',
    location: 'Wokwi',
    value,
    unit: 'ppm',
    ...extra,
  });

  it('does not alert below the default threshold (300 ppm)', async () => {
    await service.create(reading(299));
    expect(received).toHaveLength(0);
  });

  it('alerts exactly at the threshold', async () => {
    await service.create(reading(300));
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      value: 300,
      threshold: 300,
      unit: 'ppm',
      sensorName: 'MQ-2',
      location: 'Wokwi',
      severity: 'critical',
    });
  });

  it('alerts above the threshold and fills in the message', async () => {
    await service.create(reading(420));
    expect(received[0].message).toBe(
      'Smoke alarm! Value 420 ppm (threshold 300 ppm)',
    );
  });

  it("uses the reading's own threshold when it is given", async () => {
    await service.create(reading(420, { threshold: 500 }));
    expect(received).toHaveLength(0);

    await service.create(reading(120, { threshold: 100 }));
    expect(received).toHaveLength(1);
    expect(received[0].threshold).toBe(100);
  });
});
