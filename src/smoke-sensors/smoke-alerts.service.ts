import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

// Лаб. №6: сповіщення про задимлення. Та сама схема, що й для температури,
// але в події свої поля: концентрація, поріг і місце встановлення давача.
export interface SmokeAlert {
  message: string;
  value: number;
  unit: string;
  threshold: number;
  sensorName: string;
  location: string;
  timestamp: Date;
  severity: 'critical' | 'warning';
}

@Injectable()
export class SmokeAlertsService {
  private alertSubject = new Subject<SmokeAlert>();

  // Потік лише для читання — на нього підписується SSE-ендпоінт контролера.
  getAlertStream() {
    return this.alertSubject.asObservable();
  }

  // Викликає сервіс давачів, коли показання досягло порога.
  emitAlert(alert: SmokeAlert) {
    this.alertSubject.next(alert);
  }
}
