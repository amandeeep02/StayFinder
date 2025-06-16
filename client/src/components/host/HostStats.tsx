import { motion } from "framer-motion";
import { 
  Home, 
  Calendar, 
  DollarSign, 
  Star, 
  BarChart3
} from "lucide-react";
import type{ HostStats as HostStatsType } from "@/types/Host";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/dateHelpers";

interface HostStatsProps {
  stats: HostStatsType;
}

export const HostStats = ({ stats }: HostStatsProps) => {
  const statCards = [
    {
      title: "Total Properties",
      value: stats.totalProperties || 0,
      icon: Home,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      description: `${stats.activeProperties || 0} active`
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings || 0,
      icon: Calendar,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      description: `${stats.pendingBookings || 0} pending`
    },
    {
      title: "Total Earnings",
      value: formatPrice(stats.totalEarnings || 0),
      icon: DollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      description: `${formatPrice(stats.monthlyEarnings || 0)} this month`
    },
    {
      title: "Occupancy Rate",
      value: `${stats.occupancyRate || 0}%`,
      icon: BarChart3,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      description: "Average across properties"
    },
    {
      title: "Average Rating",
      value: (stats.averageRating || 0).toFixed(1),
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      description: "From guest reviews"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};