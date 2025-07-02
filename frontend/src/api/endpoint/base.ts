// ============================================================================
// BASE URL CONFIGURATION
// ============================================================================

/**
 * Base URL configuration for different microservices
 *
 * These functions return the base URLs for various services from environment variables.
 * Each service can have its own base URL to support microservice architecture.
 */

// ============================================================================
// CORE SERVICES
// ============================================================================

/**
 * Authentication service base URL
 * @returns Authentication service base URL
 */
export const BaseAuth = (): string => import.meta.env.VITE_API_SERVICE_AUTH || '/api/v1/auth'

/**
 * File management service base URL
 * @returns File service base URL
 */
export const BaseFile = (): string => import.meta.env.VITE_API_SERVICE_FILE || '/api/v1/files'

// ============================================================================
// BUSINESS SERVICES
// ============================================================================

/**
 * Provider management service base URL
 * @returns Provider service base URL
 */
export const BaseProvider = (): string => import.meta.env.VITE_API_SERVICE_PROVIDER || '/api/v1/providers'

/**
 * General management service base URL
 * @returns Management service base URL
 */
export const BaseManagement = (): string => import.meta.env.VITE_API_SERVICE_MANAGEMENT || '/api/v1/management'

/**
 * Master data service base URL
 * @returns Master service base URL
 */
export const BaseMaster = (): string => import.meta.env.VITE_API_SERVICE_MASTER || '/api/v1/master'

/**
 * Clinic management service base URL
 * @returns Clinic service base URL
 */
export const BaseClinic = (): string => import.meta.env.VITE_API_SERVICE_CLINIC || '/api/v1/clinics'

// ============================================================================
// TRANSACTION SERVICES
// ============================================================================

/**
 * Purchase management service base URL
 * @returns Purchase service base URL
 */
export const BasePurchase = (): string => import.meta.env.VITE_API_SERVICE_PURCHASE || '/api/purchases'

/**
 * Sales management service base URL
 * @returns Sales service base URL
 */
export const BaseSales = (): string => import.meta.env.VITE_API_SERVICE_SALES || '/api/sales'

/**
 * Warehouse management service base URL
 * @returns Warehouse service base URL
 */
export const BaseWarehouse = (): string => import.meta.env.VITE_API_SERVICE_WAREHOUSE || '/api/warehouse'

/**
 * Finance management service base URL
 * @returns Finance service base URL
 */
export const BaseFinance = (): string => import.meta.env.VITE_API_SERVICE_FINANCE || '/api/finance'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all service base URLs as an object
 * @returns Object containing all service base URLs
 */
export const getAllServiceUrls = () => ({
  auth: BaseAuth(),
  file: BaseFile(),
  provider: BaseProvider(),
  management: BaseManagement(),
  master: BaseMaster(),
  clinic: BaseClinic(),
  purchase: BasePurchase(),
  sales: BaseSales(),
  warehouse: BaseWarehouse(),
  finance: BaseFinance(),
})

/**
 * Validate that all required service URLs are configured
 * @returns Array of missing service URLs
 */
export const validateServiceUrls = (): string[] => {
  const services = getAllServiceUrls()
  const missing: string[] = []

  Object.entries(services).forEach(([name, url]) => {
    if (!url || url === 'undefined') {
      missing.push(name)
    }
  })

  return missing
}
