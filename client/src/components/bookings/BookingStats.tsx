import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import type { BookingStats as BookingStatsType } from "@/types/Booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingStatsProps {
  stats: BookingStatsType;
  totalSpent?: number;
}

export const BookingStats = ({ stats, totalSpent = 0 }: BookingStatsProps) => {
  const statCards = [
    {
      title: "Total Bookings",
      value: stats.total,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Total Spent Card */}
      {totalSpent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Spent
              </CardTitle>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Across all completed bookings
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};