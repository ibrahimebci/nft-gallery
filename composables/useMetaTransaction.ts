import exec, {
  ExecResult,
  Extrinsic,
  TxCbOnSuccessParams,
  execResultValue,
  txCb,
} from '@/utils/transactionExecutor'
import useTransactionStatus from './useTransactionStatus'
import useAPI from './useApi'
import { notificationTypes, showNotification } from '@/utils/notification'
import { DispatchError } from '@polkadot/types/interfaces'

export type HowAboutToExecuteOnSuccessParam = {
  txHash: string
  blockNumber: string
}

function useMetaTransaction() {
  const { $i18n } = useNuxtApp()
  const {
    isLoading,
    resolveStatus,
    initTransactionLoader,
    status,
    stopLoader,
  } = useTransactionStatus()
  const { apiInstance } = useAPI()
  const tx = ref<ExecResult>()
  const isError = ref(false)

  const howAboutToExecute = async (
    account: string,
    cb: (...params: any[]) => Extrinsic,
    args: any[],
    onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void,
    onError?: () => void,
  ): Promise<void> => {
    try {
      tx.value = await exec(
        account,
        '',
        cb,
        args,
        txCb(successCb(onSuccess), errorCb(onError), onResult),
      )
    } catch (e) {
      onCatchError(e)
    }
  }

  const successCb =
    (onSuccess?: (param: HowAboutToExecuteOnSuccessParam) => void) =>
    async ({ blockHash, txHash }: TxCbOnSuccessParams) => {
      const api = await apiInstance.value

      tx.value && execResultValue(tx.value)
      const header = await api.rpc.chain.getHeader(blockHash)
      const blockNumber = header.number.toString()

      if (onSuccess) {
        onSuccess({ txHash: txHash.toString(), blockNumber })
      }

      isLoading.value = false
      tx.value = undefined
    }

  const errorCb = (onError) => (dispatchError) => {
    tx.value && execResultValue(tx.value)
    onTxError(dispatchError)
    isLoading.value = false
    isError.value = true
    if (onError) {
      onError()
    }
  }

  const onResult = (res) => resolveStatus(res.status)

  const onCatchError = (e) => {
    if (e instanceof Error) {
      const isCancelled = e.message === 'Cancelled'
      if (isCancelled) {
        showNotification(
          $i18n.t('general.tx.cancelled'),
          notificationTypes.warn,
        )
      } else {
        showNotification(e.toString(), notificationTypes.warn)
      }
      isLoading.value = false
      tx.value = undefined
    }
  }
  const onTxError = async (dispatchError: DispatchError): Promise<void> => {
    const api = await apiInstance.value

    if (dispatchError.isModule) {
      const decoded = api.registry.findMetaError(dispatchError.asModule)
      const { docs, name, section } = decoded
      showNotification(
        `[ERR] ${section}.${name}: ${docs.join(' ')}`,
        notificationTypes.warn,
      )
    } else {
      showNotification(
        `[ERR] ${dispatchError.toString()}`,
        notificationTypes.warn,
      )
    }

    isLoading.value = false
    tx.value = undefined
  }
  return {
    howAboutToExecute,
    onTxError,
    initTransactionLoader,
    status,
    isLoading,
    stopLoader,
    isError,
  }
}

export default useMetaTransaction
