/**
 * Generic Observer Class for subscribing observers to an event stream.
 *
 * Inspired by the ObserverPattern and the following link:
 * <https://medium.com/javascript-in-plain-english/react-hooks-and-the-observer-pattern-1e4274f0e5f5>
 */
export class ObserverSubject<T> {
  private observers: ((val: T) => void)[] = [];

  public attach(observer: (val: T) => void) {
    this.observers.push(observer);
  }

  public detach(observerToRemove: (val: T) => void) {
    this.observers = this.observers.filter((observer) => observerToRemove !== observer);
  }

  public notify(val: T) {
    this.observers.forEach((observer) => observer(val));
  }
}
