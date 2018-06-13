export interface IMessage<TMessageType, TMessagePayload> {
  type: TMessageType
  payload: TMessagePayload
}
