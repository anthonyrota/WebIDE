import { InactiveSubscription } from 'src/models/Stream/StreamSubscription/InactiveStreamSubscription'

export function createInactiveSubscription() {
  return new InactiveSubscription()
}
