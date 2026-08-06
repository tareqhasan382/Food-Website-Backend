import OrderModel from '../order/order.model'
import FoodModel from '../food/food.model'
import { PAID_ORDER_STATUSES } from '../order/order.interface'
import AuthModel from '../auth/auth.model'
import {
  BestSellingFood,
  CategorySalesPoint,
  CouponUsagePoint,
  DailySalesPoint,
  DashboardOverview,
  MonthlySalesPoint,
  OrdersPoint,
  RevenuePoint,
  UsersPoint,
} from './dashboard.interface'

const localTzOffset = (): string => {
  const offset = -new Date().getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const h = String(Math.floor(abs / 60)).padStart(2, '0')
  const m = String(abs % 60).padStart(2, '0')
  return `${sign}${h}:${m}`
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatMonth = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const startOfToday = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const startOfLastNDays = (days: number): Date => {
  const start = startOfToday()
  start.setDate(start.getDate() - (days - 1))
  return start
}

type FacetDailyRow = { _id: string; revenue?: number; orders?: number }

// Single pass over orders for the whole range; $facet splits the revenue
// (paid statuses only) and order-count branches from one $match scan.
const getDailySalesSeries = async (
  days: number
): Promise<DailySalesPoint[]> => {
  const start = startOfLastNDays(days)
  const [facet] = await OrderModel.aggregate<{
    revenue: FacetDailyRow[]
    orders: FacetDailyRow[]
  }>([
    { $match: { createdAt: { $gte: start } } },
    {
      $facet: {
        revenue: [
          { $match: { status: { $in: PAID_ORDER_STATUSES } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: localTzOffset(),
                },
              },
              revenue: { $sum: '$total' },
            },
          },
        ],
        orders: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: localTzOffset(),
                },
              },
              orders: { $sum: 1 },
            },
          },
        ],
      },
    },
  ])

  const map = new Map<string, DailySalesPoint>()
  ;(facet?.revenue ?? []).forEach(row => {
    const entry = map.get(row._id) ?? { date: row._id, revenue: 0, orders: 0 }
    entry.revenue = row.revenue ?? 0
    map.set(row._id, entry)
  })
  ;(facet?.orders ?? []).forEach(row => {
    const entry = map.get(row._id) ?? { date: row._id, revenue: 0, orders: 0 }
    entry.orders = row.orders ?? 0
    map.set(row._id, entry)
  })

  const series: DailySalesPoint[] = []
  const first = startOfLastNDays(days)
  for (let i = 0; i < days; i++) {
    const date = new Date(first)
    date.setDate(first.getDate() + i)
    const key = formatDate(date)
    series.push(map.get(key) ?? { date: key, revenue: 0, orders: 0 })
  }
  return series
}

const getMonthlySalesSeries = async (
  months: number
): Promise<MonthlySalesPoint[]> => {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
  const [facet] = await OrderModel.aggregate<{
    revenue: FacetDailyRow[]
    orders: FacetDailyRow[]
  }>([
    { $match: { createdAt: { $gte: first } } },
    {
      $facet: {
        revenue: [
          { $match: { status: { $in: PAID_ORDER_STATUSES } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m',
                  date: '$createdAt',
                  timezone: localTzOffset(),
                },
              },
              revenue: { $sum: '$total' },
            },
          },
        ],
        orders: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m',
                  date: '$createdAt',
                  timezone: localTzOffset(),
                },
              },
              orders: { $sum: 1 },
            },
          },
        ],
      },
    },
  ])

  const map = new Map<string, MonthlySalesPoint>()
  ;(facet?.revenue ?? []).forEach(row => {
    const entry =
      map.get(row._id) ?? { month: row._id, revenue: 0, orders: 0 }
    entry.revenue = row.revenue ?? 0
    map.set(row._id, entry)
  })
  ;(facet?.orders ?? []).forEach(row => {
    const entry =
      map.get(row._id) ?? { month: row._id, revenue: 0, orders: 0 }
    entry.orders = row.orders ?? 0
    map.set(row._id, entry)
  })

  const series: MonthlySalesPoint[] = []
  for (let i = 0; i < months; i++) {
    const date = new Date(
      first.getFullYear(),
      first.getMonth() + i,
      1
    )
    const key = formatMonth(date)
    series.push(map.get(key) ?? { month: key, revenue: 0, orders: 0 })
  }
  return series
}

const getUsersSeries = async (days: number): Promise<UsersPoint[]> => {
  const start = startOfLastNDays(days)
  const rows = await AuthModel.aggregate<{ _id: string; users: number }>([
    { $match: { role: 'user', createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: localTzOffset(),
          },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])
  const map = new Map(rows.map(row => [row._id, row.users]))

  const series: UsersPoint[] = []
  const first = startOfLastNDays(days)
  for (let i = 0; i < days; i++) {
    const date = new Date(first)
    date.setDate(first.getDate() + i)
    const key = formatDate(date)
    series.push({ date: key, users: map.get(key) ?? 0 })
  }
  return series
}

const getBestSellingFoods = async (
  limit: number
): Promise<BestSellingFood[]> => {
  const rows = await OrderModel.aggregate<{
    _id: string
    name: string
    image?: string
    quantity: number
    revenue: number
  }>([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.foodId',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { quantity: -1, revenue: -1 } },
    { $limit: limit },
  ])
  return rows.map(row => ({
    foodId: String(row._id),
    name: row.name,
    image: row.image,
    quantity: row.quantity,
    revenue: row.revenue,
  }))
}

// One $facet pipeline computes revenue, order counts, pending count and
// today's figures in a single pass over the orders collection.
const getOverview = async (): Promise<DashboardOverview> => {
  const todayStart = startOfToday()
  const [facet] = await OrderModel.aggregate<{
    paidTotal: { revenue: number; orders: number }[]
    todayPaid: { revenue: number; orders: number }[]
    pendingOrders: { count: number }[]
    allOrders: { count: number }[]
  }>([
    {
      $facet: {
        paidTotal: [
          { $match: { status: { $in: PAID_ORDER_STATUSES } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
            },
          },
        ],
        todayPaid: [
          {
            $match: {
              status: { $in: PAID_ORDER_STATUSES },
              createdAt: { $gte: todayStart },
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
            },
          },
        ],
        pendingOrders: [
          { $match: { status: 'pending' } },
          { $count: 'count' },
        ],
        allOrders: [{ $count: 'count' }],
      },
    },
  ])

  const paidTotal = facet?.paidTotal?.[0]
  const todayPaid = facet?.todayPaid?.[0]

  const totalUsers = await AuthModel.countDocuments({ role: 'user' })

  return {
    totalRevenue: paidTotal?.revenue ?? 0,
    totalOrders: facet?.allOrders?.[0]?.count ?? 0,
    totalUsers,
    pendingOrders: facet?.pendingOrders?.[0]?.count ?? 0,
    todayRevenue: todayPaid?.revenue ?? 0,
    todayOrders: todayPaid?.orders ?? 0,
  }
}

const getRevenueChart = async (days: number): Promise<RevenuePoint[]> => {
  const series = await getDailySalesSeries(days)
  return series.map(point => ({
    date: point.date,
    revenue: point.revenue,
  }))
}

const getOrdersChart = async (days: number): Promise<OrdersPoint[]> => {
  const series = await getDailySalesSeries(days)
  return series.map(point => ({
    date: point.date,
    orders: point.orders,
  }))
}

const getCategorySales = async (
  days: number | null,
  limit: number
): Promise<CategorySalesPoint[]> => {
  const match: Record<string, unknown> = {
    status: { $in: PAID_ORDER_STATUSES },
  }
  if (days && days > 0) {
    match.createdAt = { $gte: startOfLastNDays(days) }
  }

  const rows = await OrderModel.aggregate<{
    _id: unknown
    category: string
    foodId: string
    revenue: number
    quantity: number
  }>([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.foodId',
        revenue: { $sum: '$items.lineTotal' },
        quantity: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: FoodModel.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'food',
      },
    },
    { $unwind: { path: '$food', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        foodId: { $toString: '$_id' },
        category: { $ifNull: ['$food.category', 'Uncategorized'] },
        revenue: 1,
        quantity: 1,
      },
    },
    {
      $group: {
        _id: '$category',
        revenue: { $sum: '$revenue' },
        quantity: { $sum: '$quantity' },
      },
    },
    { $sort: { revenue: -1, quantity: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        category: { $toString: '$_id' },
        revenue: 1,
        quantity: 1,
      },
    },
  ])
  return rows as CategorySalesPoint[]
}

const getCouponUsage = async (
  days: number | null,
  limit: number
): Promise<CouponUsagePoint[]> => {
  const match: Record<string, unknown> = {
    couponCode: { $exists: true, $ne: null, $type: 'string' },
    status: { $in: PAID_ORDER_STATUSES },
  }
  if (days && days > 0) {
    match.createdAt = { $gte: startOfLastNDays(days) }
  }

  const rows = await OrderModel.aggregate<CouponUsagePoint>([
    { $match: match },
    {
      $group: {
        _id: '$couponCode',
        uses: { $sum: 1 },
        discount: { $sum: { $ifNull: ['$couponDiscount', 0] } },
        subtotal: { $sum: '$subtotal' },
      },
    },
    { $sort: { discount: -1, uses: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        code: { $toString: '$_id' },
        uses: 1,
        discount: 1,
        subtotal: 1,
      },
    },
  ])
  return rows
}

export const DashboardService = {
  getOverview,
  getRevenueChart,
  getOrdersChart,
  getUsersSeries,
  getDailySalesSeries,
  getMonthlySalesSeries,
  getBestSellingFoods,
  getCategorySales,
  getCouponUsage,
}
