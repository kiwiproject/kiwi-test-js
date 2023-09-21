import convert, { Time } from "convert";

export function wait(): WaitFor {
  return new WaitFor();
}

class WaitFor {
  private timeoutMs: number;
  private checkIntervalMs: number;

  constructor() {
    this.timeoutMs = 500;
    this.checkIntervalMs = 100;
  }

  atMost(time: number, units: Time): this {
    this.timeoutMs = convert(time, units).to("ms");
    return this;
  }

  checkEvery(time: number, units: Time): this {
    this.checkIntervalMs = convert(time, units).to("ms");
    return this;
  }

  until(cb: () => boolean): Promise<string> {
    const totalTries = this.timeoutMs / this.checkIntervalMs;

    return new Promise((resolve, reject) => {
      let tries = 1;

      const loop = () => {
        if (cb.apply(this)) {
          resolve(`Condition met after ${tries} of ${totalTries} tries`);
        } else if (tries > totalTries) {
          reject(new Error(`Condition was not met after ${totalTries} tries`));
        } else {
          tries += 1;
          setTimeout(loop, this.checkIntervalMs);
        }
      };

      loop();
    });
  }
}
