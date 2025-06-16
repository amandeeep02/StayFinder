import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type{ EarningsData } from "@/types/Host";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/dateHelpers";

interface EarningsChartProps {
  earnings: EarningsData[] | null | undefined;
  totalEarnings: number;
  monthlyEarnings: number;
}

export const EarningsChart = ({ earnings, totalEarnings, monthlyEarnings }: EarningsChartProps) => {
  // Ensure earnings is an array and provide fallback data
  const earningsData = Array.isArray(earnings) ? earnings : [];
  
  // If no earnings data, create default empty state
  if (earningsData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Summary */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Total Earnings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {formatPrice(totalEarnings || 0)}
              </div>
              <div className="text-sm text-gray-500">
                No earnings data available yet
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {formatPrice(monthlyEarnings || 0)}
              </div>
              <div className="text-sm text-gray-500">
                0 bookings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart - Empty State */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No earnings data yet</p>
                  <p className="text-sm">Start hosting to see your earnings here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...earningsData.map(e => e.earnings));
  const previousMonthEarnings = earningsData[earningsData.length - 2]?.earnings || 0;
  const currentMonthEarnings = earningsData[earningsData.length - 1]?.earnings || 0;
  const growthPercentage = previousMonthEarnings > 0 
    ? ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100
    : 0;
  const isPositiveGrowth = growthPercentage >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Earnings Summary */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Total Earnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {formatPrice(totalEarnings || 0)}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growthPercentage).toFixed(1)}%
              </span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {formatPrice(monthlyEarnings || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {earningsData[earningsData.length - 1]?.bookings || 0} bookings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsData.map((data, index) => (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {data.month}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPrice(data.earnings)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {data.bookings} bookings
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};