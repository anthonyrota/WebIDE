import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Subscription } from 'src/models/Disposable/Subscription'
import { AsyncScheduler } from 'src/models/Scheduler/AsyncScheduler'

export abstract class AsyncAction extends Subscription {
  private __scheduler: AsyncScheduler
  private __scheduleDelayedDisposable: IDisposable | null | void = null
  private __isScheduled: boolean = false

  constructor(scheduler: AsyncScheduler) {
    super()
    this.__scheduler = scheduler
  }

  public executeAndRemoveFromScheduler(): void {
    if (!this.isActive()) {
      return
    }
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
      this.__scheduleDelayedDisposable = null
    }
    this.__isScheduled = false
    try {
      this.tryExecute()
    } catch (error) {
      this.dispose()
      throw error
    } finally {
      if (this.isActive() && !this.__isScheduled) {
        this.__scheduler.removeAction(this)
      }
    }
  }

  public execute(): { error: unknown } | void {
    if (!this.isActive()) {
      return
    }
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
      this.__scheduleDelayedDisposable = null
    }
    this.__isScheduled = false
    try {
      this.tryExecute()
    } catch (error) {
      return { error }
    }
  }

  public dispose(): void {
    if (this.isActive()) {
      super.dispose()
      if (this.__scheduleDelayedDisposable) {
        this.__scheduleDelayedDisposable.dispose()
        this.__scheduleDelayedDisposable = null
      }
      this.__isScheduled = false
      this.__scheduler.removeAction(this)
    }
  }

  /**
   * So that scheduler.actions.indexOf() doesn't need to be called a thousand times
   * when all the actions need to be disposed after an error
   */
  public disposeWithoutRemovingFromScheduler(): void {
    if (this.isActive()) {
      super.dispose()
      if (this.__scheduleDelayedDisposable) {
        this.__scheduleDelayedDisposable.dispose()
        this.__scheduleDelayedDisposable = null
      }
      this.__isScheduled = false
    }
  }

  public isScheduled(): boolean {
    return this.__isScheduled
  }

  protected requestExecution(): void {
    if (!this.isActive()) {
      return
    }
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
      this.__scheduleDelayedDisposable = null
    }
    if (!this.__isScheduled) {
      this.__isScheduled = true
      this.__scheduler.scheduleAction(this)
    }
  }

  protected requestExecutionDelayed(delay: number): void {
    if (!this.isActive()) {
      return
    }
    if (delay === 0) {
      this.requestExecution()
    }
    if (this.__scheduleDelayedDisposable) {
      this.__scheduleDelayedDisposable.dispose()
    }
    this.__isScheduled = true
    this.__scheduleDelayedDisposable = this.__scheduler.scheduleActionDelayed(
      this,
      delay
    )
  }

  protected abstract tryExecute(): void
}
