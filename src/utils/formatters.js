export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  const num = Math.round(Number(val))
  const isNegative = num < 0
  const absNum = Math.abs(num)
  const numStr = absNum.toString()

  if (numStr.length <= 3) {
    return `${isNegative ? '-' : ''}₹${numStr}`
  }

  const lastThree = numStr.substring(numStr.length - 3)
  const otherNumbers = numStr.substring(0, numStr.length - 3)
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return `${isNegative ? '-' : ''}₹${formattedOther},${lastThree}`
}

export function formatCrores(valInCrores) {
  return `₹${Number(valInCrores).toFixed(2)} Cr`
}
