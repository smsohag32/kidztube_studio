"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
   ResponsiveContainer,
   BarChart,
   CartesianGrid,
   XAxis,
   YAxis,
   Tooltip,
   Bar,
   Legend,
} from "recharts";

const recoveryTrendData = [
   { month: "Jan", target: 80, collection: 65 },
   { month: "Feb", target: 90, collection: 75 },
   { month: "Mar", target: 85, collection: 95 },
   { month: "Apr", target: 100, collection: 85 },
   { month: "May", target: 95, collection: 110 },
   { month: "Jun", target: 110, collection: 90 },
   { month: "Jul", target: 105, collection: 100 },
   { month: "Aug", target: 120, collection: 115 },
   { month: "Sep", target: 115, collection: 105 },
   { month: "Oct", target: 130, collection: 125 },
   { month: "Nov", target: 125, collection: 120 },
   { month: "Dec", target: 140, collection: 135 },
];

const TrendChart = () => {
   return (
      <Card className="bg-white shadow-md rounded-lg">
         <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Recovery Trend</CardTitle>

            <DateRangePicker
               initialDateFrom={new Date()}
               initialDateTo={new Date(new Date().setDate(new Date().getDate() + 30))}
               align="end"
               locale="en-GB"
               showCompare={false}
            />

            <div className="flex items-center gap-4 text-sm">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-600">Target</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Collection</span>
               </div>
            </div>
         </CardHeader>

         <CardContent className="mt-4">
            <ResponsiveContainer
               width="100%"
               height={300}>
               <BarChart
                  data={recoveryTrendData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  className="select-none">
                  <CartesianGrid
                     strokeDasharray="3 3"
                     stroke="#e5e7eb"
                  />
                  <XAxis
                     dataKey="month"
                     tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Tooltip
                     formatter={(value: number, name: string) => {
                        return [value, name === "target" ? "Target" : "Collection"];
                     }}
                  />
                  <Legend
                     verticalAlign="top"
                     height={36}
                     wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar
                     dataKey="target"
                     name="Target"
                     fill="rgba(251, 191, 36, 0.6)" // amber-400, 60% opacity
                     radius={[4, 4, 0, 0]}
                     barSize={16}
                  />
                  <Bar
                     dataKey="collection"
                     name="Collection"
                     fill="rgba(16, 185, 129, 0.6)" // emerald-500, 60% opacity
                     radius={[4, 4, 0, 0]}
                     barSize={16}
                  />
               </BarChart>
            </ResponsiveContainer>
         </CardContent>
      </Card>
   );
};

export default TrendChart;
