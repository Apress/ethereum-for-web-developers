export function getLogId(log) {
  return `${log.transactionHash}.${log.logIndex}`;
}