import ky from "kyouka";
import { Time } from "kyouka/types/types";

class Timer {
  beginDate: Date | number;
  endDate: Date | number;
  timer: number;
  duration: Time;
  totalMs: number;
  isPadZero: boolean;
  constructor(
    beginDate: Date | number,
    endDate: Date | number,
    isPadZero = false
  ) {
    this.beginDate = beginDate;
    this.endDate = endDate;
    this.isPadZero = isPadZero;
    this.timer = 0;
    this.duration = {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    };
    this.padDuration(this.duration);
    const totalMs = ky.getTimeDeltaAsSeconds(beginDate, endDate);
    this.totalMs = totalMs >= 0 ? totalMs : 0;
  }
  start() {
    const timer = setInterval(() => {
      let { totalMs } = this;
      const duration = ky.formatDuration(totalMs);
      this.padDuration(duration);
      this.duration = duration;
      totalMs -= 10;
      this.totalMs = totalMs;
      if (totalMs < 0) {
        this.totalMs = 0;
        clearInterval(this.timer);
      }
    }, 10);
    this.timer = timer;
  }
  padDuration(duration: any) {
    if (this.isPadZero) {
      Object.entries(duration).forEach(([key, value]) => {
        (duration as any)[key] = ky.padNumber(value as any, 2);
      });
    }
  }
}

export { Timer };
