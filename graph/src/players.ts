import { BigInt, Value } from "@graphprotocol/graph-ts"
import {
  Players,
  StepsAdded
} from "../generated/Players/Players"
import { StepTrackingEntity } from "../generated/schema"

export function handleStepsAdded(event: StepsAdded): void {
  let entity = StepTrackingEntity.load(event.transaction.from.toHex())

  if (!entity) {
    entity = new StepTrackingEntity(event.transaction.from.toHex())
    entity.numSyncs = BigInt.fromI32(0)
    entity.totalSteps = BigInt.fromI32(0)
  }

  // Get the week number of this version of the game
  let startTimeUnix = "1655210217"
  let startingTimestamp = BigInt.fromString(startTimeUnix) // unix time when contract deployed - to update
  let stepsAddedTimestamp = BigInt.fromString(event.params.timestamp.toString())
  let delta_in_seconds = stepsAddedTimestamp.minus(startingTimestamp)
  let delta_in_weeks = delta_in_seconds.div(BigInt.fromI32(60*60*24*7))
  // TODO: check whether appropriately rounds up / down once more than 1 week has passed
  // It appears to give floor (ie. round down), which is desired behaviour
  let weekNum = delta_in_weeks +  BigInt.fromI32(1);

  entity.set(`week${weekNum}Steps`, Value.fromBigInt(event.params.stepsTaken))
  entity.numSyncs = entity.numSyncs + BigInt.fromI32(1)
  entity.totalSteps = entity.totalSteps + event.params.stepsTaken

  entity.save()

  // TODO: consider not using event outputs, but rather calls to the contract
  // as below.
  

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.NFTPRICE(...)
  // - contract.checkContractBalance(...)s
  // - contract.determineStartingPosition(...)
  // - contract.indexStartingPosition(...)
  // - contract.owner(...)
  // - contract.players(...)
}
