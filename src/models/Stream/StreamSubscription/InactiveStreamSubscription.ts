import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'

export class InactiveSubscription implements ISubscription {
  public dispose(): void {
    return
  }

  public isActive(): boolean {
    return false
  }
}
