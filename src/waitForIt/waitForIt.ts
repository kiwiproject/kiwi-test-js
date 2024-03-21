import convert, { Time } from "convert";

/**
 * Creates a new wait condition with defaults.
 *
 * Impl Note: This will NOT do anything unless `.until()` is called.
 */
export function wait(): WaitFor {
  return new WaitFor();
}

class WaitFor {
  private timeoutMs: number;
  private pollIntervalMs: number;
  private pollDelayMs: number;
  private alias: string;
  private verbose: boolean;

  constructor() {
    this.timeoutMs = 4_000;
    this.pollIntervalMs = 100;
    this.pollDelayMs = 0;
    this.verbose = false;
  }

  /**
   * Sets the amount of time between condition checks to wait.
   * @param time The amount of time till the next poll
   * @param units The units that correspond to the time. Default is ms.
   */
  withPollInterval(time: number, units: Time = "ms"): this {
    this.pollIntervalMs = convert(time, units).to("ms");
    return this;
  }

  /**
   * Sets the amount of time to wait until the condition is first checked.
   * @param time The amount of time to wait
   * @param units The units corresponding to the time. Default is ms.
   */
  withPollDelay(time: number, units: Time = "ms"): this {
    this.pollDelayMs = convert(time, units).to("ms");
    return this;
  }

  /**
   * A unique name to give this wait check. Useful if more than one wait condition is used.
   *
   * @param alias The name to give this wait check.
   */
  withAlias(alias: string): this {
    this.alias = alias;
    return this;
  }

  /**
   * Enables debug logging during the wait check.
   */
  withVerbose(): this {
    this.verbose = true;
    return this;
  }

  /**
   * Sets the max time to wait for the condition to return true.
   * @param time The amount of total time to wait for the condition to return true.
   * @param units The units that correspond to the time. Default is ms.
   */
  atMost(time: number, units: Time = "ms"): this {
    this.timeoutMs = convert(time, units).to("ms");
    return this;
  }

  /**
   * Kicks off the wait check. The condition will be checked every pollInterval for a truthy response. If the max time
   * to wait is reached, then a rejected Promise will be returned. If the condition becomes true, then a resolved Promise
   * will be returned.
   * @param cb The function to check if the condition is true or false.
   */
  async until(cb: () => boolean | Promise<boolean>): Promise<string> {
    const totalTries = this.timeoutMs / this.pollIntervalMs;

    const aliasText = this.alias ? `with alias ${this.alias} ` : "";

    if (this.verbose) {
      console.log(
        `Waiting for condition ${aliasText}for up to ${totalTries} attempts checking every ${this.pollIntervalMs} ms`,
      );
    }

    return new Promise((resolve, reject) => {
      let tries = 1;

      const processResult = (result: boolean) => {
        if (result) {
          if (this.verbose) {
            console.log(
              `Condition ${aliasText}met after ${tries} of ${totalTries} tries`,
            );
          }
          resolve(
            `Condition ${aliasText}met after ${tries} of ${totalTries} tries`,
          );
        } else if (tries > totalTries) {
          if (this.verbose) {
            console.log(
              `Condition ${aliasText}was not met after ${totalTries} tries`,
            );
          }
          reject(
            new Error(
              `Condition ${aliasText}was not met after ${totalTries} tries`,
            ),
          );
        } else {
          tries += 1;
          setTimeout(loop, this.pollIntervalMs);
        }
      };

      const loop = async () => {
        const cbResult = cb.apply(this);

        if (typeof cbResult === "boolean") {
          processResult(cbResult);
        } else {
          const cbPromiseResult = await cbResult;
          processResult(cbPromiseResult);
        }
      };

      if (this.pollDelayMs > 0) {
        setTimeout(loop, this.pollDelayMs);
      } else {
        loop();
      }
    });
  }
}
