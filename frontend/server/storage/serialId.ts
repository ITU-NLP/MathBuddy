export class SerialId {
  private originalStart: number;
  private currentId: number;
  private step: number;
  private returned: Set<number>;

  public constructor(start: number = 1, step: number = 1) {
    this.originalStart = start;
    this.currentId = start;
    this.step = step;
    this.returned = new Set<number>();
  }

  public next(): number {
    if (this.returned.size > 0) {
      const id = this.returned.values().next().value!;
      this.returned.delete(id);
      return id;
    }

    const id = this.currentId;
    this.currentId += this.step;
    return id;
  }

  public peek(): number {
    return this.returned.size > 0 ? this.returned.values().next().value! : this.currentId;
  }

  public reset(to?: number, step?: number, keepReturned: boolean = false): void {
    if (!to) {
      to = this.originalStart;
    } else {
      this.originalStart = to;
    }

    this.currentId = to;

    if (step) {
      this.step = step;
    }

    if (!keepReturned) {
      this.returned.clear();
    }
  }

  public recycle(value: number): void {
    this.returned.add(value);
  }
}
