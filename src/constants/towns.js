/**
 * Martha's Vineyard towns for filtering
 * Used by TownPicker component and LocationContext
 */
export const MV_TOWNS = [
  { value: null, label: 'All Island' },
  { value: 'Oak Bluffs', label: 'Oak Bluffs' },
  { value: 'Edgartown', label: 'Edgartown' },
  { value: 'Vineyard Haven', label: 'Vineyard Haven' },
  { value: 'West Tisbury', label: 'West Tisbury' },
  { value: 'Chilmark', label: 'Chilmark' },
  { value: 'Aquinnah', label: 'Aquinnah' },
]

/**
 * Nantucket towns for filtering
 */
export const NANTUCKET_TOWNS = [
  { value: null, label: 'All Nantucket' },
  { value: 'Nantucket', label: 'Nantucket' },
  { value: 'Siasconset', label: 'Sconset' },
  { value: 'Madaket', label: 'Madaket' },
  { value: 'Wauwinet', label: 'Wauwinet' },
]

/**
 * All towns across both islands
 */
export const ALL_TOWNS = [
  { value: null, label: 'All Islands' },
  ...MV_TOWNS.slice(1),
  ...NANTUCKET_TOWNS.slice(1),
]
