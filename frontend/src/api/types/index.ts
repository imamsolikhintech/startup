// Common API Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors?: string[]
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ErrorResponse {
  success: false
  message: string
  errors: string[]
  code?: string
  details?: Record<string, any>
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  captcha?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
  newsletter?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: Address
  preferences: UserPreferences
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

// File Management Types
export interface FileUploadResponse {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folder: string
  checksum: string
  metadata: FileMetadata
  uploadedAt: string
  uploadedBy: string
}

export interface FileMetadata {
  width?: number
  height?: number
  duration?: number
  pages?: number
  encoding?: string
  [key: string]: any
}

export interface Folder {
  id: string
  name: string
  path: string
  parentId?: string
  fileCount: number
  size: number
  createdAt: string
  createdBy: string
}

export interface ShareLink {
  id: string
  fileId: string
  url: string
  password?: boolean
  expiresAt?: string
  downloadLimit?: number
  downloadCount: number
  createdAt: string
  createdBy: string
}

// Business Entity Types
export interface Provider {
  id: string
  name: string
  code: string
  type: 'supplier' | 'vendor' | 'partner'
  status: 'active' | 'inactive' | 'suspended'
  contact: ContactInfo
  address: Address
  taxInfo: TaxInfo
  paymentTerms: PaymentTerms
  createdAt: string
  updatedAt: string
}

export interface ContactInfo {
  primaryContact: string
  email: string
  phone: string
  website?: string
  socialMedia?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

export interface TaxInfo {
  taxId: string
  vatNumber?: string
  taxExempt: boolean
}

export interface PaymentTerms {
  method: 'cash' | 'credit' | 'bank_transfer' | 'check'
  creditDays: number
  discountPercent?: number
  discountDays?: number
}

// Clinic Types
export interface Clinic {
  id: string
  name: string
  code: string
  type: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory'
  status: 'active' | 'inactive'
  address: Address
  contact: ContactInfo
  services: ClinicService[]
  operatingHours: OperatingHours[]
  capacity: {
    beds?: number
    rooms?: number
    staff?: number
  }
  createdAt: string
  updatedAt: string
}

export interface ClinicService {
  id: string
  name: string
  description: string
  category: string
  price: number
  duration: number // in minutes
  available: boolean
}

export interface OperatingHours {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  openTime: string // HH:mm format
  closeTime: string // HH:mm format
  closed: boolean
}

// Purchase Types
export interface PurchaseOrder {
  id: string
  orderNumber: string
  providerId: string
  provider: Provider
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  notes?: string
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity?: number
  notes?: string
}

// Sales Types
export interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  customer: Customer
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  items: SalesOrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  currency: string
  orderDate: string
  shippingDate?: string
  deliveryDate?: string
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded'
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SalesOrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discountPercent: number
  totalPrice: number
  notes?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  type: 'individual' | 'business'
  status: 'active' | 'inactive'
  address: Address
  billingAddress?: Address
  taxInfo?: TaxInfo
  creditLimit?: number
  paymentTerms: PaymentTerms
  createdAt: string
  updatedAt: string
}

// Product & Inventory Types
export interface Product {
  id: string
  name: string
  code: string
  barcode?: string
  description: string
  category: ProductCategory
  brand?: string
  unit: string
  status: 'active' | 'inactive' | 'discontinued'
  pricing: ProductPricing
  inventory: ProductInventory
  specifications: Record<string, any>
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  code: string
  parentId?: string
  level: number
}

export interface ProductPricing {
  costPrice: number
  sellingPrice: number
  msrp?: number // Manufacturer's Suggested Retail Price
  currency: string
  taxable: boolean
  taxRate?: number
}

export interface ProductInventory {
  currentStock: number
  reservedStock: number
  availableStock: number
  reorderLevel: number
  maxStock: number
  locations: StockLocation[]
}

export interface StockLocation {
  warehouseId: string
  warehouse: Warehouse
  quantity: number
  reservedQuantity: number
  location: string // e.g., "A1-B2-C3"
}

// Warehouse Types
export interface Warehouse {
  id: string
  name: string
  code: string
  type: 'main' | 'branch' | 'transit' | 'virtual'
  status: 'active' | 'inactive'
  address: Address
  contact: ContactInfo
  capacity: {
    totalArea: number
    usedArea: number
    zones: WarehouseZone[]
  }
  createdAt: string
  updatedAt: string
}

export interface WarehouseZone {
  id: string
  name: string
  type: 'storage' | 'receiving' | 'shipping' | 'quarantine'
  area: number
  capacity: number
  currentUtilization: number
}

// Finance Types
export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  category: TransactionCategory
  amount: number
  currency: string
  description: string
  reference?: string
  accountId: string
  account: Account
  counterpartyId?: string
  counterparty?: string
  date: string
  dueDate?: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  attachments: string[]
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TransactionCategory {
  id: string
  name: string
  code: string
  type: 'income' | 'expense'
  parentId?: string
  level: number
}

export interface Account {
  id: string
  name: string
  code: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  subtype: string
  currency: string
  balance: number
  status: 'active' | 'inactive' | 'closed'
  description?: string
  parentId?: string
  level: number
  createdAt: string
  updatedAt: string
}

// Dashboard & Analytics Types
export interface DashboardStats {
  sales: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
    growth: {
      daily: number
      weekly: number
      monthly: number
      yearly: number
    }
  }
  orders: {
    pending: number
    processing: number
    completed: number
    cancelled: number
  }
  inventory: {
    totalProducts: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  customers: {
    total: number
    new: number
    active: number
    inactive: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

// Notification Types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  userId: string
  createdAt: string
  readAt?: string
}

// System Types
export interface SystemSettings {
  id: string
  category: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  updatedBy: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'email'>
  changes?: {
    before: Record<string, any>
    after: Record<string, any>
  }
  ipAddress: string
  userAgent: string
  timestamp: string
}