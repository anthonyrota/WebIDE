import {
  DoubleInputValueTransmitterWithData,
  DoubleInputValueTransmitterWithDataSubscriptionTarget
} from 'src/models/Stream/DoubleInputValueTransmitterWithData'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import {
  operateThroughValueTransmitter,
  Operation
} from 'src/models/Stream/Operation'
import { Stream } from 'src/models/Stream/Stream'
import { removeOnce } from 'src/utils/removeOnce'

export function bufferToggle<T, TOuterValue>(
  openNewBufferStream: Stream<TOuterValue>,
  getShouldCloseBufferStream: (value: TOuterValue) => Stream<unknown>
): Operation<T, T[]> {
  return operateThroughValueTransmitter(
    target =>
      new BufferToggleValueTransmitter(
        target,
        openNewBufferStream,
        getShouldCloseBufferStream
      )
  )
}

type BufferToggleMessage<T> =
  | { type: 'OpenNewBuffer' }
  | { type: 'CloseBuffer'; buffer: T[] }

class BufferToggleValueTransmitter<
  T,
  TOuterValue
> extends DoubleInputValueTransmitterWithData<
  T,
  T[],
  TOuterValue,
  BufferToggleMessage<T>
> {
  private buffers: T[][] = []

  constructor(
    target: ISubscriptionTarget<T[]>,
    openNewBufferStream: Stream<TOuterValue>,
    private getShouldCloseBufferStream: (value: TOuterValue) => Stream<unknown>
  ) {
    super(target)
    this.subscribeStreamToSelf(openNewBufferStream, {
      type: 'OpenNewBuffer'
    })
  }

  protected onNextValue(value: T): void {
    for (let i = 0; i < this.buffers.length; i++) {
      this.buffers[i].push(value)
    }
  }

  protected onOuterNextValue(
    outerValue: TOuterValue,
    target: DoubleInputValueTransmitterWithDataSubscriptionTarget<
      TOuterValue,
      BufferToggleMessage<T>
    >
  ) {
    const message = target.getData()

    if (message.type === 'OpenNewBuffer') {
      this.openNewBuffer(outerValue)
    } else {
      target.dispose()
      this.closeBuffer(message.buffer)
    }
  }

  private openNewBuffer(outerValue: TOuterValue): void {
    const { getShouldCloseBufferStream } = this
    let shouldCloseBufferStream: Stream<unknown>

    try {
      shouldCloseBufferStream = getShouldCloseBufferStream(outerValue)
    } catch (error) {
      this.destination.error(error)
      return
    }

    const buffer: T[] = []

    this.buffers.push(buffer)
    this.subscribeStreamToSelf(shouldCloseBufferStream, {
      type: 'CloseBuffer',
      buffer
    })
  }

  private closeBuffer(buffer: T[]): void {
    this.destination.next(buffer)

    removeOnce(this.buffers, buffer)
  }
}
