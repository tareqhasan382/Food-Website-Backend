export type DailySalesPoint = {
  date: string
  revenue: number
  orders: number
}

export type MonthlySalesPoint = {
  month: string
  revenue: number
  orders: number
}

export type RevenuePoint = {
  date: string
  revenue: number
}

export type OrdersPoint = {
  date: string
  orders: number
}

export type UsersPoint = {
  date: string
  users: number
}

export type BestSellingFood = {
  foodId: string
  name: string
  image?: string
  quantity: number
  revenue: number
}

export type DashboardOverview = {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  pendingOrders: number
  todayRevenue: number
  todayOrders: number
}

export type CategorySalesPoint = {
  category: string
  revenue: number
  quantity: number
}

export type CouponUsagePoint = {
  code: string
  uses: number
  discount: number
  subtotal: number
}
