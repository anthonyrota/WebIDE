import { createUniqueKey } from 'src/utils/createUniqueKey'
import { root } from 'src/utils/root'

const callbacksById: { [id: number]: () => void } = {}
let currentId: number = 0
let isCurrentlyRunningTask: boolean = false
let registerImmediate: (callbackId: number) => void

function setCallback(callbackId: number, callback: () => void): void {
  callbacksById[callbackId] = callback
}

function getCallback(callbackId: number): () => void {
  return callbacksById[callbackId]
}

function removeCallback(callbackId: number): void {
  delete callbacksById[callbackId]
}

function setImmediatePolyfill(callback: () => void): number {
  const id = ++currentId
  setCallback(id, callback)
  registerImmediate(id)
  return id
}

function clearImmediatePolyfill(callbackId: number): void {
  removeCallback(callbackId)
}

function tryRunCallback(callbackId: number): void {
  if (isCurrentlyRunningTask) {
    setTimeout(tryRunCallback, 0, callbackId)
  }

  const callback = getCallback(callbackId)

  if (callback) {
    isCurrentlyRunningTask = true

    try {
      callback()
    } finally {
      clearImmediatePolyfill(callbackId)
      isCurrentlyRunningTask = false
    }
  }
}

function installNextTickImplementation(): void {
  registerImmediate = callbackId => {
    process.nextTick(() => tryRunCallback(callbackId))
  }
}

function installPromiseResolveImplementation(): void {
  const resolved = Promise.resolve()

  registerImmediate = callbackId => {
    resolved.then(() => tryRunCallback(callbackId))
  }
}

function shouldUsePostMessageImplementation(): boolean {
  if (!root.postMessage || root.importScripts) {
    return false
  }

  const oldOnMessage = root.onmessage
  let isPostMessageAsynchronous: boolean = true

  root.onmessage = () => {
    isPostMessageAsynchronous = false
  }

  root.postMessage('', '*')
  root.onmessage = oldOnMessage

  return isPostMessageAsynchronous
}

function installPostMessageImplementation(): void {
  const messagePrefix = createUniqueKey('onMessageCallback')

  function onMessageCallback(event: MessageEvent): void {
    if (
      event.source === root &&
      typeof event.data === 'string' &&
      event.data.indexOf(messagePrefix) === 0
    ) {
      tryRunCallback(+event.data.slice(messagePrefix.length))
    }
  }

  if (root.addEventListener) {
    root.addEventListener('message', onMessageCallback, false)
  } else {
    root.attachEvent('onmessage', onMessageCallback)
  }

  registerImmediate = callbackId => {
    root.postMessage(messagePrefix + callbackId, '*')
  }
}

function installMessageChannelImplementation(): void {
  const channel = new MessageChannel()

  channel.port1.onmessage = event => {
    const callbackId = event.data

    tryRunCallback(callbackId)
  }

  registerImmediate = callbackId => {
    channel.port2.postMessage(callbackId)
  }
}

function installSetTimeoutImplementation(): void {
  registerImmediate = callbackId => {
    setTimeout(tryRunCallback, 0, callbackId)
  }
}

if (Object.prototype.toString.call(root.process) === '[object process]') {
  installNextTickImplementation()
} else if (typeof Promise !== 'undefined') {
  installPromiseResolveImplementation()
} else if (shouldUsePostMessageImplementation()) {
  installPostMessageImplementation()
} else if (typeof MessageChannel !== 'undefined') {
  installMessageChannelImplementation()
} else {
  installSetTimeoutImplementation()
}

export { setImmediatePolyfill, clearImmediatePolyfill }
