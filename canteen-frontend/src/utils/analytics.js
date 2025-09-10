// src/utils/analytics.js
import { parseISO, format } from 'date-fns';

/**
 * Time complexities:
 * - groupByDate: O(n)
 * - totalSales: O(n)
 * - topItems: O(n + m log m) where n = txns, m = number unique items
 * - employeeCounts: O(n)
 */

/**
 * Group transactions by date string (YYYY-MM-DD)
 * returns { '2025-08-10': [txn, ...], ... }
 */
export function groupByDate(transactions) {
  const map = {};
  for (const t of transactions) {
    const d = format(parseISO(t.timestamp), 'yyyy-MM-dd');
    if (!map[d]) map[d] = [];
    map[d].push(t);
  }
  return map;
}

/** Total sales per day (array sorted by date) -> [{ date, total }, ...] */
export function salesOverTime(transactions) {
  const map = {};
  for (const t of transactions) {
    const d = format(parseISO(t.timestamp), 'yyyy-MM-dd');
    map[d] = (map[d] || 0) + Number(t.totalAmount || (t.price * t.quantity || 0));
  }
  // convert to sorted array
  return Object.keys(map)
    .sort()
    .map(date => ({ date, total: map[date] }));
}

/** Top selling items -> [{ name, qtySold, revenue }, ...] */
export function topItems(transactions, topN = 5) {
  const stats = {};
  for (const t of transactions) {
    const name = t.itemName || 'Unknown';
    stats[name] = stats[name] || { qty: 0, revenue: 0 };
    const qty = Number(t.quantity || 0);
    const amt = Number(t.totalAmount || (t.price * qty || 0));
    stats[name].qty += qty;
    stats[name].revenue += amt;
  }
  const arr = Object.entries(stats).map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }));
  arr.sort((a,b) => b.qty - a.qty); // by quantity sold
  return arr.slice(0, topN);
}

/** Employee purchase counts -> [{ employeeName, count, totalSpent }] */
export function employeePurchases(transactions) {
  const map = {};
  for (const t of transactions) {
    const name = t.employeeName || t.employeeId || 'Unknown';
    map[name] = map[name] || { count: 0, total: 0 };
    map[name].count += 1;
    map[name].total += Number(t.totalAmount || 0);
  }
  return Object.keys(map).map(name => ({ employeeName: name, ...map[name] }))
    .sort((a,b) => b.count - a.count);
}

/** Payment methods breakdown (source) -> [{ name, value }] */
export function paymentBreakdown(transactions) {
  const map = {};
  for (const t of transactions) {
    const s = t.source || 'Unknown';
    map[s] = (map[s] || 0) + Number(t.totalAmount || 0);
  }
  return Object.keys(map).map(k => ({ name: k, value: map[k] }));
}

/** Total revenue & transactions summary */
export function summaryMetrics(transactions) {
  let totalRevenue = 0, totalTx = 0, avgOrder = 0;
  for (const t of transactions) {
    totalRevenue += Number(t.totalAmount || 0);
    totalTx += 1;
  }
  avgOrder = totalTx ? totalRevenue / totalTx : 0;
  return { totalRevenue, totalTx, avgOrder };
}
