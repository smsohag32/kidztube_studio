"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

import {
   useGetDashboardDataQuery,
   useGetRmPerformanceQuery,
} from "@/redux-store/apis_action/dashboard";
import { Users, TrendingUp } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
   Bar,
   BarChart,
   ResponsiveContainer,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   LineChart,
   Line,
} from "recharts";

type ShortMonth = (typeof months)[number];
const months = [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec",
] as const;
const monthMap: Record<ShortMonth, string> = {
   Jan: "JANUARY",
   Feb: "FEBRUARY",
   Mar: "MARCH",
   Apr: "APRIL",
   May: "MAY",
   Jun: "JUNE",
   Jul: "JULY",
   Aug: "AUGUST",
   Sep: "SEPTEMBER",
   Oct: "OCTOBER",
   Nov: "NOVEMBER",
   Dec: "DECEMBER",
};

const monthNumberMap: Record<(typeof months)[number], number> = {
   Jan: 1,
   Feb: 2,
   Mar: 3,
   Apr: 4,
   May: 5,
   Jun: 6,
   Jul: 7,
   Aug: 8,
   Sep: 9,
   Oct: 10,
   Nov: 11,
   Dec: 12,
};

const dummyDashboardData = {
   customers: 5,
   outStandingAmount: 750000,
   recoveredAmount: 180000,

   chartData: months.map((month, index) => {
      const base = (index + 1) * 5000;
      return {
         monthName: month,
         target: 40000 + base, // unique target per month
         collection: 25000 + base / 2, // unique collection per month
      };
   }),

   noOfOverdueAccounts: months.map((month, index) => ({
      month,
      noOfOverdueAccounts: 3 + index, // 3, 4, 5, ... unique
      totalOverdueAmount: 10000 + index * 1500, // grows monthly
   })),
};

const dummyRmPerformanceData = [
   { id: 1, rmName: "Sohag", percentage: "78%" },
   { id: 2, rmName: "Hamid", percentage: "62%" },
   { id: 3, rmName: "Asif", percentage: "85%" },
   { id: 4, rmName: "Kibria", percentage: "57%" },
   { id: 5, rmName: "Hamidul", percentage: "73%" },
];

export const Overview = () => {
   const [filterDuration, setFilterDuration] = useState<{ from: string; to: string } | null>({
      from: moment().startOf("year").format("YYYY-MM-DD"),
      to: moment().endOf("year").format("YYYY-MM-DD"),
   });

   const { data, isLoading, isError } = useGetDashboardDataQuery(
      { startDate: filterDuration?.from, endDate: filterDuration?.to },
      { skip: !filterDuration?.from || !filterDuration?.to }
   );

   const { data: rmPerformanceData, isLoading: performanceLoading } = useGetRmPerformanceQuery(
      { startDate: filterDuration?.from, endDate: filterDuration?.to },
      { skip: !filterDuration?.from || !filterDuration?.to }
   );

   // Use API data if available, otherwise dummy fallback
   const dashboardData = data?.data || dummyDashboardData;
   const rmData = rmPerformanceData?.data?.length ? rmPerformanceData.data : dummyRmPerformanceData;
   const overdueAccountsData = months.map((shortName) => {
      const monthNumber = monthNumberMap[shortName];
      const monthData = dashboardData.noOfOverdueAccounts.find(
         (item: any) => item.month === monthNumber
      );

      return {
         month: shortName,
         Accounts: monthData?.noOfOverdueAccounts ?? 0,
         Amounts: monthData?.totalOverdueAmount ?? 0,
      };
   });

   const chartData = data?.data?.chartData ?? [];
   const recoveryTrendData = months.map((shortName) => {
      const fullName = monthMap[shortName];

      const monthData = chartData.find(
         (item: any) =>
            String(item?.monthName ?? "")
               .trim()
               .toUpperCase() === fullName
      );

      return {
         month: shortName,
         Recovery: Number(monthData?.collection ?? 0),
         Target: Number(monthData?.target ?? 0),
      };
   });

   console.log();

   if (isError)
      return (
         <div className="text-red-500 font-semibold">
            Failed to load dashboard data. Please try again later.
         </div>
      );

   return (
      <div className="space-y-4 min-h-screen">
         {/* Header */}
         <div className="flex items-center justify-between">
            {isLoading ? (
               <Skeleton className="h-8 w-48" />
            ) : (
               <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            )}
            <div className="flex items-center gap-2">
               {isLoading ? (
                  <Skeleton className="h-10 w-40" />
               ) : (
                  <DateRangePicker
                     onUpdate={(values) => {
                        const from = values.range.from.toISOString().split("T")[0];
                        const to = values.range.to?.toISOString().split("T")[0] ?? from;
                        setFilterDuration({ from, to });
                     }}
                     initialDateFrom={moment().startOf("year").toDate()}
                     initialDateTo={moment().endOf("year").toDate()}
                     align="center"
                     locale="en-GB"
                     showCompare={false}
                  />
               )}
            </div>
         </div>

         {/* Key Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
               [...Array(3)].map((_, i) => (
                  <Card
                     key={i}
                     className="bg-white  p-4">
                     <Skeleton className="h-4 w-32 mb-4" />
                     <Skeleton className="h-8 w-20" />
                  </Card>
               ))
            ) : (
               <>
                  <Card className="bg-white ">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                           Total Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                           {dashboardData.customers}
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-white ">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                           Total Outstanding Amount
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                           {formatCurrency(dashboardData.outStandingAmount)}
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="bg-white ">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                           Recovered Amount
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                           {formatCurrency(dashboardData.recoveredAmount)}
                        </div>
                     </CardContent>
                  </Card>
               </>
            )}
         </div>

         {/* Recovery Trend + Top RMs */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recovery Trend Chart */}
            <Card className="lg:col-span-2 bg-white">
               {isLoading ? (
                  <div className="px-4">
                     <Skeleton className="h-6 w-40 mb-4" />
                     <Skeleton className="h-[280px] w-full" />
                  </div>
               ) : (
                  <>
                     <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                           Recovery Trend - Target Vs Recovery
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="mt-4">
                        <ResponsiveContainer
                           width="100%"
                           height={280}>
                           <BarChart data={recoveryTrendData}>
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 stroke="#f0f0f0"
                              />
                              <XAxis
                                 dataKey="month"
                                 tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                 tick={{ fontSize: 10 }}
                                 tickFormatter={(value) => value.toLocaleString()}
                              />
                              <Tooltip />
                              <Bar
                                 dataKey="Target"
                                 fill="rgba(251, 191, 36, 0.6)"
                                 radius={[2, 2, 0, 0]}
                              />
                              <Bar
                                 dataKey="Recovery"
                                 fill="rgba(16, 185, 129, 0.6)"
                                 radius={[2, 2, 0, 0]}
                              />
                           </BarChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </>
               )}
            </Card>

            {/* Top RMs */}
            <Card className="bg-white">
               {isLoading || performanceLoading ? (
                  <div className="p-4">
                     <Skeleton className="h-6  w-56 mb-4" />
                     {[...Array(5)].map((_, i) => (
                        <Skeleton
                           key={i}
                           className="h-6 w-full mb-2"
                        />
                     ))}
                  </div>
               ) : (
                  <>
                     <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                           Top Recovery Managers
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        {rmData.map((manager: any, index: number) => (
                           <div
                              key={index}
                              className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <span className="text-sm font-medium text-gray-600 w-6">
                                    {String(index + 1).padStart(2, "0")}
                                 </span>
                                 <Link
                                    to={`/dashboard/recovery-manager/details?id=${
                                       manager?.id
                                    }&name=${encodeURIComponent(manager.rmName)}`}
                                    className="text-sm text-blue-600 hover:underline cursor-pointer">
                                    {manager.rmName}
                                 </Link>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                       className="h-full bg-gray-400 transition-all duration-300"
                                       style={{ width: manager.percentage }}></div>
                                 </div>
                                 <span className="text-sm font-medium text-gray-900 w-12">
                                    {manager.percentage}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </CardContent>
                  </>
               )}
            </Card>
         </div>

         {/* Overdue Accounts Chart */}
         <div className="grid grid-cols-1 gap-4">
            <Card className="bg-white">
               {isLoading ? (
                  <div className="px-4">
                     <Skeleton className="h-6 w-56 mb-4" />
                     <Skeleton className="h-[280px] w-full" />
                  </div>
               ) : (
                  <>
                     <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                           Number of Accounts Overdue
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ResponsiveContainer
                           width="100%"
                           height={300}>
                           <LineChart
                              data={overdueAccountsData}
                              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                              <CartesianGrid
                                 strokeDasharray="3 3"
                                 stroke="#e5e7eb"
                              />

                              <XAxis
                                 dataKey="month"
                                 tick={{ fontSize: 12 }}
                              />

                              <YAxis
                                 tick={{ fontSize: 10 }}
                                 tickFormatter={(value) => value.toLocaleString()}
                              />

                              <Tooltip formatter={(value: number) => value.toLocaleString()} />

                              {/* Line 1: Overdue Accounts */}
                              <Line
                                 type="monotone"
                                 dataKey="Accounts"
                                 name="Overdue Accounts"
                                 stroke="#3b82f6"
                                 strokeWidth={2}
                                 dot={{ r: 4 }}
                                 activeDot={{ r: 6 }}
                              />

                              {/* Line 2: Amounts */}
                              <Line
                                 type="monotone"
                                 dataKey="Amounts"
                                 name="Overdue Amount (BDT)"
                                 stroke="#f59e0b"
                                 strokeWidth={2}
                                 dot={{ r: 4 }}
                                 activeDot={{ r: 6 }}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </>
               )}
            </Card>
         </div>
      </div>
   );
};
