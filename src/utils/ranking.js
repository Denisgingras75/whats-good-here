/**
 * Calculate "% Worth It" rating
 * @param {number} yesVotes - Number of "Worth It" votes
 * @param {number} totalVotes - Total number of votes
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentWorthIt(yesVotes, totalVotes) {
  if (totalVotes === 0) return 0
  return Math.round((yesVotes / totalVotes) * 100)
}

/**
 * Get confidence level based on vote count
 * @param {number} totalVotes - Total number of votes
 * @returns {'low' | 'medium' | 'high'}
 */
export function getConfidenceLevel(totalVotes) {
  if (totalVotes < 5) return 'low'
  if (totalVotes < 20) return 'medium'
  return 'high'
}

/**
 * Get confidence indicator text and styling
 * @param {number} totalVotes - Total number of votes
 * @returns {Object} Confidence info object
 */
export function getConfidenceIndicator(totalVotes) {
  const level = getConfidenceLevel(totalVotes)

  const indicators = {
    low: {
      level: 'low',
      text: `Low confidence (${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'})`,
      icon: '⚠️',
      color: 'yellow',
      className: 'text-yellow-600 border-yellow-300 bg-yellow-50',
    },
    medium: {
      level: 'medium',
      text: `${totalVotes} votes`,
      icon: null,
      color: 'gray',
      className: 'text-gray-600',
    },
    high: {
      level: 'high',
      text: `High confidence (${totalVotes} votes)`,
      icon: '✓',
      color: 'green',
      className: 'text-green-600 border-green-300 bg-green-50',
    },
  }

  return indicators[level]
}
