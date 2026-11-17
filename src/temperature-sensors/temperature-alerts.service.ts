import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

// Лаб. №6: сповіщення про критичну температуру.
// Структура однієї події, яку сервер надсилає клієнтам через SSE.
export interface TemperatureAlert {
  message: string;
  temperature: number;
  sensorName: string;
  timestamp: Date;
  severity: 'critical' | 'warning';
}

// Патерн «Спостерігач» (Observer): цей сервіс — єдине місце, через яке
// проходять сповіщення. Сервіс давачів лише кладе сюди подію (emitAlert),
// контролер лише читає потік (getAlertStream). Один про одного вони не знають.
@Injectable()
export class TemperatureAlertsService {
  // Subject із RxJS — потік подій, у який можна і писати, і на який можна
  // підписатися. Він private: ззовні доступні тільки два методи нижче.
  private alertSubject = new Subject<TemperatureAlert>();

  // Лише читання: Observable не має методу next(), тому підписник
  // не може сам вкинути подію в потік.
  getAlertStream() {
    return this.alertSubject.asObservable();
  }

  // Надіслати подію всім, хто зараз підписаний.
  emitAlert(alert: TemperatureAlert) {
    this.alertSubject.next(alert);
  }
}
