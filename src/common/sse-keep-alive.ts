import type { MessageEvent } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';

// Раз на 15 секунд у відкрите SSE-з'єднання йде рядок-коментар ": keep-alive".
// Браузер коментарі ігнорує (подія onmessage не спрацьовує), але з'єднанням
// щось передається. Навіщо: проксі-сервери між клієнтом і сервером можуть
// розірвати з'єднання, яким довго нічого не йде. Стандарт HTML радить
// надсилати такий коментар приблизно кожні 15 секунд.
export const SSE_KEEP_ALIVE_MS = 15_000;

export function keepAlive(): Observable<MessageEvent> {
  return interval(SSE_KEEP_ALIVE_MS).pipe(
    map(() => ({ comment: 'keep-alive' })),
  );
}
