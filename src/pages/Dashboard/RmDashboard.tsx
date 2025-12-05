"use client";

import Loading from "@/components/loading/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range";
import { useGetRmDashboardDataQuery } from "@/redux-store/apis_action/dashboard";
import { Users, TrendingUp, PieChart as PieChartIcon, BarChart3, Download } from "lucide-react";

import { useState } from "react";
import {
   Bar,
   BarChart,
   ResponsiveContainer,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   Line,
   LineChart,
   PieChart,
   Pie,
   Cell,
} from "recharts";
import RmCustomerListSection from "../rm_customer_list/RmCustomerListSection";
import moment from "moment";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { generateRMDashboardReport } from "@/utils/generateRmReport";
import { Button } from "@/components/ui/button";

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

const monthNumberMap: Record<number, string> = {
   1: "Jan",
   2: "Feb",
   3: "Mar",
   4: "Apr",
   5: "May",
   6: "Jun",
   7: "Jul",
   8: "Aug",
   9: "Sep",
   10: "Oct",
   11: "Nov",
   12: "Dec",
};

type ShortMonth = (typeof months)[number];

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

export const RmDashboard = () => {
   const navigate = useNavigate();
   const [filterDuration, setFilterDuration] = useState<{
      from: string;
      to: string;
   } | null>({
      from: moment().startOf("year").format("YYYY-MM-DD"),
      to: moment().endOf("year").format("YYYY-MM-DD"),
   });

   const { data, isLoading, isError } = useGetRmDashboardDataQuery(
      { startDate: filterDuration?.from, endDate: filterDuration?.to },
      { skip: !filterDuration?.from || !filterDuration?.to }
   );

   const overdueAccountsData =
      data?.data?.noOfOverdueAccounts?.map((item: any) => ({
         month: monthNumberMap[item.month],
         accounts: item.noOfOverdueAccounts ?? 0,
         totalAmount: item.totalOverdueAmount ?? 0,
      })) ?? [];

   const recoveryTrendData = months.map((shortName) => {
      const fullName = monthMap[shortName];
      const monthData = data?.data?.chartData?.find((item: any) => item.monthName === fullName);

      return {
         month: shortName,
         target: monthData?.target ?? 0,
         Recovery: monthData?.collection ?? 0,
      };
   });

   // Collection Status Data for Pie Chart
   const collectionStatusData = [
      {
         name: "Recovered",
         value: data?.data?.rmRecoveredAmount || 0,
         fill: "#10b981",
      },
      {
         name: "Outstanding",
         value: data?.data?.rmOutStandingAmount || 0,
         fill: "#f59e0b",
      },
      {
         name: "Overdue",
         value: data?.data?.rmOverdueAmount || 0,
         fill: "#ef4444",
      },
   ];

   // Recovery Performance Data
   const recoveryPerformanceData = [
      {
         category: "Annual Target",
         value: data?.data?.rmTarget || 0,
         fill: "#3b82f6",
      },
      {
         category: "Amount Recovered",
         value: data?.data?.rmRecoveredAmount || 0,
         fill: "#10b981",
      },
   ];

   // Format currency in BDT (Bangladeshi Taka)
   const formatBDT = (value: number) => {
      if (value >= 10000000) {
         return `৳${(value / 10000000).toFixed(1)}Cr`;
      } else if (value >= 100000) {
         return `৳${(value / 100000).toFixed(1)}L`;
      } else if (value >= 1000) {
         return `৳${(value / 1000).toFixed(1)}K`;
      }
      return `৳${value.toFixed(0)}`;
   };

   const handleGenerateReport = () => {
      generateRMDashboardReport(data?.data, {
         title: "RM Dashboard Report - 2025",
         companyName: "P2M Bank Ltd.",
         reportDate: moment().format("DD MMMM YYYY"),
         generatedBy: "System Admin",
      });
   };

   if (isLoading) return <Loading />;
   if (isError)
      return (
         <div className="text-red-500 font-semibold">
            Failed to load dashboard data. Please try again later.
         </div>
      );

   return (
      <div className="space-y-4 min-h-screen page-load-ani">
         <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="flex items-center gap-2">
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
               <div>
                  <Button
                     onClick={handleGenerateReport}
                     className="">
                     <Download /> Download Report{" "}
                  </Button>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Customers */}
            <Card
               onClick={() => navigate("/dashboard/customers")}
               className="bg-blue-50 gap-4 hover:bg-blue-100 transition-all duration-300 border border-blue-200 shadow-sm cursor-pointer">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-sm font-medium text-blue-800">
                     Total Customers
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl font-bold text-blue-900">
                     {data?.data?.customerCount || 0}
                  </div>
                  <p className="text-xs text-blue-700">Assigned customer accounts</p>
               </CardContent>
            </Card>

            {/* Target */}
            <Card className="bg-green-50 gap-4 hover:bg-green-100 transition-all duration-300 border border-green-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-sm font-medium text-green-800">Target</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl font-bold text-green-900">
                     {formatCurrency(data?.data?.rmTarget || 0)}
                  </div>
                  <p className="text-xs text-green-700">Annual performance target</p>
               </CardContent>
            </Card>

            {/* Recovered Amount */}
            <Card className="bg-purple-50 gap-4 hover:bg-purple-100 transition-all duration-300 border border-purple-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-sm font-medium text-purple-800">
                     Recovered Amount
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl font-bold text-purple-900">
                     {formatCurrency(data?.data?.rmRecoveredAmount || 0)}
                  </div>
                  <p className="text-xs text-purple-700">Recovered this year</p>
               </CardContent>
            </Card>

            {/* Total Outstanding */}
            <Card className="bg-yellow-50 gap-4 hover:bg-yellow-100 transition-all duration-300 border border-yellow-200 shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                  <CardTitle className="text-sm font-medium text-yellow-800">
                     Total Overdue
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
               </CardHeader>
               <CardContent>
                  <div className="text-xl font-bold text-yellow-900">
                     {formatCurrency(data?.data?.rmOverdueAmount || 0)}
                  </div>
                  <p className="text-xs text-yellow-700">Current total overdue amount</p>
               </CardContent>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recovery Trend Chart */}
            <Card className=" bg-white shadow-sm">
               <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                     Target Vs Recovery
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span className="text-gray-600">Target</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Recovery</span>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="mt-4">
                  <ResponsiveContainer
                     width="100%"
                     className=""
                     height={280}>
                     <BarChart
                        data={recoveryTrendData}
                        className="select-none !outline-none">
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
                        <Tooltip
                           formatter={(value: number, name: string) => {
                              if (name === "target") return [`${value.toLocaleString()}`, "Target"];
                              if (name === "Recovery")
                                 return [`${value.toLocaleString()}`, "Recovery"];
                              return [value, name];
                           }}
                        />
                        <Bar
                           dataKey="target"
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
            </Card>

            <Card className="bg-white shadow-sm gap-4 overflow-hidden">
               <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                     Number of Accounts Overdue
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer
                     width="100%"
                     height={290}>
                     <LineChart data={overdueAccountsData}>
                        <Legend
                           verticalAlign="top"
                           height={36}
                        />
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
                        <Tooltip
                           formatter={(value: number, name: string) => {
                              if (name === "accounts") return [`${value}`, "Overdue Accounts"];
                              if (name === "totalAmount")
                                 return [`BDT ${value.toLocaleString()}`, "Total Overdue Amount"];
                              return [value, name];
                           }}
                        />
                        <Line
                           type="monotone"
                           dataKey="totalAmount"
                           stroke="#f59e0b"
                           strokeWidth={2}
                           dot={{ r: 3 }}
                           activeDot={{ r: 5 }}
                           name="Total Overdue Amount"
                        />
                        <Line
                           type="monotone"
                           dataKey="accounts"
                           stroke="#2563eb"
                           strokeWidth={2}
                           dot={{ r: 3 }}
                           activeDot={{ r: 5 }}
                           name="Overdue Accounts"
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </CardContent>
            </Card>
         </div>

         {/* NEW SECTION 1: Collection Status Distribution */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                     <PieChartIcon className="h-5 w-5 text-indigo-500" />
                     Collection Status Distribution
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer
                     width="100%"
                     height={300}>
                     <PieChart>
                        <Legend
                           verticalAlign="top"
                           height={36}
                        />
                        <Pie
                           data={collectionStatusData}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, value }) => `${name}: ${formatBDT(Number(value))}`}
                           outerRadius={100}
                           fill="#8884d8"
                           dataKey="value">
                           {collectionStatusData.map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={entry.fill}
                              />
                           ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatBDT(value)} />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                     <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-gray-600">Recovered</p>
                        <p className="text-sm font-bold text-green-700">
                           {formatBDT(data?.data?.rmRecoveredAmount || 0)}
                        </p>
                     </div>
                     <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-gray-600">Outstanding</p>
                        <p className="text-sm font-bold text-yellow-700">
                           {formatBDT(data?.data?.rmOutStandingAmount || 0)}
                        </p>
                     </div>
                     <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-gray-600">Overdue</p>
                        <p className="text-sm font-bold text-red-700">
                           {formatBDT(data?.data?.rmOverdueAmount || 0)}
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* NEW SECTION 2: Recovery Performance Analysis */}
            <Card className="bg-white shadow-sm">
               <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                     <BarChart3 className="h-5 w-5 text-cyan-500" />
                     Recovery Performance Analysis
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <ResponsiveContainer
                     width="100%"
                     height={300}>
                     <BarChart
                        data={recoveryPerformanceData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                        <CartesianGrid
                           strokeDasharray="3 3"
                           stroke="#f0f0f0"
                        />
                        <XAxis
                           type="number"
                           tick={{ fontSize: 10 }}
                           tickFormatter={(value) => formatBDT(value)}
                        />
                        <YAxis
                           dataKey="category"
                           type="category"
                           tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(value: number) => formatBDT(value)} />
                        <Bar
                           dataKey="value"
                           radius={[0, 8, 8, 0]}>
                           {recoveryPerformanceData.map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={entry.fill}
                              />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                     <p className="text-xs text-gray-600 mb-1">Performance Achievement</p>
                     <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                           className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                           style={{
                              width: `${Math.min(
                                 ((data?.data?.rmRecoveredAmount || 0) /
                                    (data?.data?.rmTarget || 1)) *
                                    100,
                                 100
                              )}%`,
                           }}></div>
                     </div>
                     <p className="text-xs font-semibold text-blue-700 mt-2">
                        {(
                           ((data?.data?.rmRecoveredAmount || 0) / (data?.data?.rmTarget || 1)) *
                           100
                        ).toFixed(1)}
                        % of Target
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>

         <RmCustomerListSection />
      </div>
   );
};
