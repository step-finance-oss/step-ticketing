export class TransactionFetchError extends Error {
  constructor(txId: string) {
    super(`Can not fetch transaction ${txId} from the network.`)
    this.name = "TransactionFetchError"
  }
}
