/**
 * Security utilities for input sanitization
 */

/**
 * Sanitize a search query to prevent SQL injection via LIKE/ILIKE patterns
 * Escapes special characters: %, _, \
 * @param {string} query - Raw user input
 * @param {number} maxLength - Maximum allowed length (default 100)
 * @returns {string} Sanitized query safe for use in LIKE patterns
 */
export function sanitizeSearchQuery(query, maxLength = 100) {
  if (!query || typeof query !== 'string') return ''

  return query
    .trim()
    .slice(0, maxLength)
    // Escape LIKE/ILIKE special characters
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')    // Escape percent signs
    .replace(/_/g, '\\_')    // Escape underscores
}

/**
 * Validate and extract a safe filename from a storage URL
 * Prevents path traversal attacks
 * @param {string} url - Full URL to the file
 * @param {string} expectedUserId - Expected user ID in the path
 * @returns {string|null} Safe filename or null if invalid
 */
export function extractSafeFilename(url, expectedUserId) {
  if (!url || typeof url !== 'string') return null

  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname

    // Extract filename from path (last segment)
    const segments = pathname.split('/').filter(Boolean)
    const filename = segments[segments.length - 1]

    if (!filename) return null

    // Validate filename format: should be alphanumeric with dots/hyphens only
    // Typical format: {dishId}.{extension} or {uuid}.{extension}
    const safeFilenamePattern = /^[a-zA-Z0-9\-_.]+$/
    if (!safeFilenamePattern.test(filename)) {
      console.warn('Invalid filename format detected:', filename)
      return null
    }

    // Check for path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.warn('Path traversal attempt detected in filename:', filename)
      return null
    }

    // Decode and re-validate (in case of URL encoding tricks)
    const decodedFilename = decodeURIComponent(filename)
    if (!safeFilenamePattern.test(decodedFilename)) {
      console.warn('Invalid decoded filename:', decodedFilename)
      return null
    }

    return decodedFilename
  } catch (error) {
    console.error('Error parsing URL for filename extraction:', error)
    return null
  }
}

/**
 * Validate a UUID format
 * @param {string} id - String to validate
 * @returns {boolean} True if valid UUID format
 */
export function isValidUUID(id) {
  if (!id || typeof id !== 'string') return false
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}
