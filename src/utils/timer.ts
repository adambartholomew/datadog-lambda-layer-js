/**
 * Timer is used to get a promise that completes at a regular interval.
 * ```typescript
 * const intervalMS = 100;
 * const timer = new Timer(intervalMS);
 * timer.start();
 * await timer.nextTimeout(); // Called in 100 ms
 * await timer.nextTimeout(); // Called in another 100 ms
 * timer.complete(); // Complete all pending timeout and cancels the timer.
 * ```
 */
export class Timer {
  private timer?: NodeJS.Timeout;
  private currentPromise?: Promise<boolean>;
  private currentResolver?: (done: boolean) => void;
  private isCompleted = false;

  public get completed() {
    return this.isCompleted;
  }

  constructor(private intervalMS: number) {}

  /**
   * Begins the timer. None of the promises will complete until start is called.
   */
  public start() {
    if (this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      if (this.currentResolver !== undefined) {
        this.currentResolver(false);
        this.currentResolver = undefined;
        this.currentPromise = undefined;
      }
    }, this.intervalMS);
  }

  /**
   * Gets a promise which will complete when the next interval times out.
   * @returns A promise, which will return true if the timer is complete, or false otherwise.
   */
  public nextTimeout(): Promise<boolean> {
    if (this.isCompleted) {
      return new Promise((resolve) => resolve(true));
    }
    if (this.currentPromise === undefined) {
      this.currentPromise = new Promise((resolver) => {
        this.currentResolver = resolver;
      });
    }
    return this.currentPromise;
  }

  /**
   * Completes the timer. This will immediately stop the timer, and complete any pending promises.
   */
  public complete() {
    this.isCompleted = true;
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    const { currentResolver } = this;
    this.currentResolver = undefined;
    this.currentPromise = undefined;
    if (currentResolver !== undefined) {
      currentResolver(true);
    }
  }
}
