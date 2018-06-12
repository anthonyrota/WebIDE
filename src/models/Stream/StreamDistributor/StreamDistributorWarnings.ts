import { warn } from 'src/utils/warn'

export const warnWhenOnNextValueCalledAfterStreamCompleted = warn(
  `[StreamDistributor] onNextValue was called after the distributor was marked as completed`
)

export const warnWhenOnErrorCalledAfterStreamCompleted = warn(
  `[StreamDistributor] onError was called after the distributor was marked as completed`
)

export const warnWhenOnCompleteCalledAfterStreamCompleted = warn(
  `[StreamDistributor] onComplete was called after the distributor was marked as completed`
)

export const warnWhenDisposeCalledAfterStreamCompleted = warn(
  '[StreamDistributor] dispose was called after the distributor was marked as completed'
)
