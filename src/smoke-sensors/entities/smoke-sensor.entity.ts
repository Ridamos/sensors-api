/** Давач диму (напр. оптичний/іонізаційний або газовий MQ-2) */
export interface SmokeSensor {
  id: string;
  timestamp: Date;
  sensorName: string;
  location: string; // де встановлений: "Серверна", "Кухня"...
  value: number; // концентрація диму
  unit: string; // 'ppm' або '%/m' (оптична щільність)
  threshold: number; // поріг спрацювання тривоги
  alarm: boolean; // обчислюється сервером: value >= threshold
}
