import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Subscription } from 'src/models/Disposable/Subscription'
import { canUseDOM } from 'src/utils/canUseDOM'
import { createUniqueKey } from 'src/utils/createUniqueKey'
import { getTime } from 'src/utils/getTime'

// Taken from react-scheduler because the package is not stable.
// This is a built-in polyfill for requestIdleCallback. It works by scheduling
// a requestAnimationFrame, storing the time for the start of the frame, then
// scheduling a postMessage which gets scheduled after paint. Within the
// postMessage handler do as much work as possible until time + frame rate.
// By separating the idle call into a separate event tick we ensure that
// layout, paint and other browser work is counted against the available time.
// The frame rate is dynamically adjusted.

export interface IDeadline {
  didTimeout: boolean
  getTimeRemaining(): number
}

type FrameCallback = (deadline: IDeadline) => void

type CancelScheduledWork = (callbackId: ICallbackConfig) => void
type ScheduleWork = (
  callback: FrameCallback,
  options?: { timeout: number }
) => ICallbackConfig

interface ICallbackConfig {
  scheduledCallback: FrameCallback
  timeoutTime: number
  next: ICallbackConfig | null
  prev: ICallbackConfig | null
}

let scheduleWork: ScheduleWork
let cancelScheduledWork: CancelScheduledWork

if (!canUseDOM) {
  const timeoutIds = new Map()
  const infiniteDeadline: IDeadline = {
    didTimeout: false,
    getTimeRemaining(): number {
      return Infinity
    }
  }

  scheduleWork = (
    callback: FrameCallback,
    options?: { timeout: number }
  ): ICallbackConfig => {
    // keeping return type consistent
    const callbackConfig = {
      next: null,
      prev: null,
      scheduledCallback: callback,
      timeoutTime: 0
    }
    const timeoutId = setTimeout(() => {
      callback(infiniteDeadline)
    })
    timeoutIds.set(callback, timeoutId)
    return callbackConfig
  }
  cancelScheduledWork = (callbackId: ICallbackConfig) => {
    const callback = callbackId.scheduledCallback
    const timeoutId = timeoutIds.get(callback)
    timeoutIds.delete(callbackId)
    clearTimeout(timeoutId)
  }
} else {
  let headOfPendingCallbacksLinkedList: ICallbackConfig | null = null
  let tailOfPendingCallbacksLinkedList: ICallbackConfig | null = null

  // We track what the next soonest timeoutTime is, to be able to quickly tell
  // if none of the scheduled callbacks have timed out.
  let nextSoonestTimeoutTime = -1

  let isIdleScheduled = false
  let isAnimationFrameScheduled = false

  let frameDeadline = 0
  // We start out assuming that we run at 30fps but then the heuristic tracking
  // will adjust this value to a faster fps if we get more frequent animation
  // frames.
  let previousFrameTime = 33
  let activeFrameTime = 33

  const frameDeadlineObject: IDeadline = {
    didTimeout: false,
    getTimeRemaining() {
      const remaining = frameDeadline - getTime()
      return remaining > 0 ? remaining : 0
    }
  }

  /**
   * Handles the case where a callback errors:
   * - don't catch the error, because this changes debugging behavior
   * - do start a new postMessage callback, to call any remaining callbacks,
   * - but only if there is an error, so there is not extra overhead.
   */
  const callUnsafely = (callbackConfig: ICallbackConfig, arg: IDeadline) => {
    const callback = callbackConfig.scheduledCallback
    let finishedCalling = false
    try {
      callback(arg)
      finishedCalling = true
    } finally {
      // always remove it from linked list
      cancelScheduledWork(callbackConfig)

      if (!finishedCalling) {
        // an error must have been thrown
        isIdleScheduled = true
        window.postMessage(messageKey, '*')
      }
    }
  }

  /**
   * Checks for timed out callbacks, runs them, and then checks again to see if
   * any more have timed out.
   * Keeps doing this until there are none which have currently timed out.
   */
  const callTimedOutCallbacks = () => {
    if (headOfPendingCallbacksLinkedList === null) {
      return
    }

    const currentTime = getTime()
    // TODO: this would be more efficient if deferred callbacks are stored in
    // min heap.
    // Or in a linked list with links for both timeoutTime order and insertion
    // order.
    // For now an easy compromise is the current approach:
    // Keep a pointer to the soonest timeoutTime, and check that first.
    // If it has not expired, we can skip traversing the whole list.
    // If it has expired, then we step through all the callbacks.
    if (nextSoonestTimeoutTime === -1 || nextSoonestTimeoutTime > currentTime) {
      // We know that none of them have timed out yet.
      return
    }
    // NOTE: we intentionally wait to update the nextSoonestTimeoutTime until
    // after successfully calling any timed out callbacks.
    // If a timed out callback throws an error, we could get stuck in a state
    // where the nextSoonestTimeoutTime was set wrong.
    let updatedNextSoonestTimeoutTime = -1 // we will update nextSoonestTimeoutTime below
    const timedOutCallbacks = []

    // iterate once to find timed out callbacks and find nextSoonestTimeoutTime
    let currentCallbackConfig: ICallbackConfig | null = headOfPendingCallbacksLinkedList
    while (currentCallbackConfig !== null) {
      const timeoutTime = currentCallbackConfig.timeoutTime
      if (timeoutTime !== -1 && timeoutTime <= currentTime) {
        // it has timed out!
        timedOutCallbacks.push(currentCallbackConfig)
      } else {
        if (
          timeoutTime !== -1 &&
          (updatedNextSoonestTimeoutTime === -1 ||
            timeoutTime < updatedNextSoonestTimeoutTime)
        ) {
          updatedNextSoonestTimeoutTime = timeoutTime
        }
      }
      currentCallbackConfig = currentCallbackConfig.next
    }

    if (timedOutCallbacks.length > 0) {
      frameDeadlineObject.didTimeout = true

      const len = timedOutCallbacks.length

      for (let i = 0; i < len; i++) {
        callUnsafely(timedOutCallbacks[i], frameDeadlineObject)
      }
    }

    // NOTE: we intentionally wait to update the nextSoonestTimeoutTime until
    // after successfully calling any timed out callbacks.
    nextSoonestTimeoutTime = updatedNextSoonestTimeoutTime
  }

  // We use the postMessage trick to defer idle work until after the repaint.
  const messageKey = createUniqueKey('idleTickCallback')

  const idleTick = (event: MessageEvent) => {
    if (event.source !== window || event.data !== messageKey) {
      return
    }
    isIdleScheduled = false

    if (headOfPendingCallbacksLinkedList === null) {
      return
    }

    // First call anything which has timed out, until we have caught up.
    callTimedOutCallbacks()

    let currentTime = getTime()
    // Next, as long as we have idle time, try calling more callbacks.
    while (
      frameDeadline - currentTime > 0 &&
      headOfPendingCallbacksLinkedList !== null
    ) {
      const latestCallbackConfig = headOfPendingCallbacksLinkedList
      frameDeadlineObject.didTimeout = false
      // callUnsafely will remove it from the head of the linked list
      callUnsafely(latestCallbackConfig, frameDeadlineObject)
      currentTime = getTime()
    }
    if (headOfPendingCallbacksLinkedList !== null) {
      if (!isAnimationFrameScheduled) {
        // Schedule another animation callback so we retry later.
        isAnimationFrameScheduled = true
        requestAnimationFrame(animationTick)
      }
    }
  }
  // Assumes that we have addEventListener in this environment. Might need
  // something better for old IE.
  window.addEventListener('message', idleTick, false)

  const animationTick = (rafTime: number) => {
    isAnimationFrameScheduled = false
    let nextFrameTime = rafTime - frameDeadline + activeFrameTime
    if (
      nextFrameTime < activeFrameTime &&
      previousFrameTime < activeFrameTime
    ) {
      if (nextFrameTime < 8) {
        // Defensive coding. We don't support higher frame rates than 120hz.
        // If we get lower than that, it is probably a bug.
        nextFrameTime = 8
      }
      // If one frame goes long, then the next one can be short to catch up.
      // If two frames are short in a row, then that's an indication that we
      // actually have a higher frame rate than what we're currently optimizing.
      // We adjust our heuristic dynamically accordingly. For example, if we're
      // running on 120hz display or 90hz VR display.
      // Take the max of the two in case one of them was an anomaly due to
      // missed frame deadlines.
      activeFrameTime =
        nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime
    } else {
      previousFrameTime = nextFrameTime
    }
    frameDeadline = rafTime + activeFrameTime
    if (!isIdleScheduled) {
      isIdleScheduled = true
      window.postMessage(messageKey, '*')
    }
  }

  scheduleWork = (
    callback: FrameCallback,
    options?: { timeout: number }
  ): ICallbackConfig => {
    let timeoutTime = -1
    if (options != null && typeof options.timeout === 'number') {
      timeoutTime = getTime() + options.timeout
    }
    if (
      nextSoonestTimeoutTime === -1 ||
      (timeoutTime !== -1 && timeoutTime < nextSoonestTimeoutTime)
    ) {
      nextSoonestTimeoutTime = timeoutTime
    }

    const scheduledCallbackConfig: ICallbackConfig = {
      next: null,
      prev: null,
      scheduledCallback: callback,
      timeoutTime
    }
    if (headOfPendingCallbacksLinkedList === null) {
      // Make this callback the head and tail of our list
      headOfPendingCallbacksLinkedList = scheduledCallbackConfig
      tailOfPendingCallbacksLinkedList = scheduledCallbackConfig
    } else {
      // Add latest callback as the new tail of the list
      scheduledCallbackConfig.prev = tailOfPendingCallbacksLinkedList
      // renaming for clarity
      const oldTailOfPendingCallbacksLinkedList = tailOfPendingCallbacksLinkedList
      if (oldTailOfPendingCallbacksLinkedList !== null) {
        oldTailOfPendingCallbacksLinkedList.next = scheduledCallbackConfig
      }
      tailOfPendingCallbacksLinkedList = scheduledCallbackConfig
    }

    if (!isAnimationFrameScheduled) {
      // If rAF didn't already schedule one, we need to schedule a frame.
      // TODO: If this rAF doesn't materialize because the browser throttles, we
      // might want to still have setTimeout trigger scheduleWork as a backup to ensure
      // that we keep performing work.
      isAnimationFrameScheduled = true
      requestAnimationFrame(animationTick)
    }
    return scheduledCallbackConfig
  }

  cancelScheduledWork = (callbackConfig: ICallbackConfig) => {
    if (
      callbackConfig.prev === null &&
      headOfPendingCallbacksLinkedList !== callbackConfig
    ) {
      // this callbackConfig has already been cancelled.
      // cancelScheduledWork should be idempotent, a no-op after first call.
      return
    }

    /**
     * There are four possible cases:
     * - Head/nodeToRemove/Tail -> null
     *   In this case we set Head and Tail to null.
     * - Head -> ... middle nodes... -> Tail/nodeToRemove
     *   In this case we point the middle.next to null and put middle as the new
     *   Tail.
     * - Head/nodeToRemove -> ...middle nodes... -> Tail
     *   In this case we point the middle.prev at null and move the Head to
     *   middle.
     * - Head -> ... ?some nodes ... -> nodeToRemove -> ... ?some nodes ... -> Tail
     *   In this case we point the Head.next to the Tail and the Tail.prev to
     *   the Head.
     */
    const next = callbackConfig.next
    const prev = callbackConfig.prev
    callbackConfig.next = null
    callbackConfig.prev = null
    if (next !== null) {
      // we have a next

      if (prev !== null) {
        // we have a prev

        // callbackConfig is somewhere in the middle of a list of 3 or more nodes.
        prev.next = next
        next.prev = prev
        return
      } else {
        // there is a next but not a previous one;
        // callbackConfig is the head of a list of 2 or more other nodes.
        next.prev = null
        headOfPendingCallbacksLinkedList = next
        return
      }
    } else {
      // there is no next callback config; this must the tail of the list

      if (prev !== null) {
        // we have a prev

        // callbackConfig is the tail of a list of 2 or more other nodes.
        prev.next = null
        tailOfPendingCallbacksLinkedList = prev
        return
      } else {
        // there is no previous callback config;
        // callbackConfig is the only thing in the linked list,
        // so both head and tail point to it.
        headOfPendingCallbacksLinkedList = null
        tailOfPendingCallbacksLinkedList = null
        return
      }
    }
  }
}

class RICDisposable implements IDisposable {
  constructor(private config: ICallbackConfig) {}

  public dispose(): void {
    cancelScheduledWork(this.config)
  }
}

export function requestIdleCallback(
  callback: FrameCallback,
  options?: { timeout: number }
): IConsciousDisposable {
  const config = scheduleWork(callback, options)
  return Subscription.fromDisposable(new RICDisposable(config))
}
