import PdfLogo from "@/assets/logo/PdfLogo";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import type React from "react";

const BorrowerTemplate: React.FC<any> = ({
   data,
   title = "Borrower Report",
   date = moment().format("lll"),
   pageNumber = "1",
   startIndex,
   totalPages = "1",
   isDefaulter,
   footerNote = "Confidential - For Internal Use Only",
}) => {
   return (
      <div className="w-[210mm] h-[297mm] !text-[#1a1a1a] text-[12px] !bg-white p-12 flex flex-col">
         <header className="">
            <div className="flex items-center mb-4 justify-center">
               <PdfLogo className="max-w-[120px]" />
            </div>
            <div className="flex items-end justify-between mb-4">
               <div className="flex-1">
                  <h1 className="text-xl font-bold text-black mt-3">{title}</h1>
               </div>
               <div className="text-right">
                  <p className="text-xs font-semibold">Generated on: {date}</p>
               </div>
            </div>
         </header>

         <table className="w-full text-xs mt-4 border  flex-1">
            <thead>
               <tr className="">
                  <th className="border border-gray-200 px-4 py-3 text-left font-bold text-black">
                     S/N
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-bold text-black">
                     Name
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-bold text-black">
                     Phone
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-bold text-black">
                     Branch
                  </th>
                  {isDefaulter ? (
                     <th className="border border-gray-200 px-4 py-3 text-right font-bold text-black">
                        Overdue Amount
                     </th>
                  ) : (
                     <th className="border border-gray-200 px-4 py-3 text-right font-bold text-black">
                        Loan Amount
                     </th>
                  )}
                  <th className="border border-gray-200 px-4 py-3 text-left font-bold text-black">
                     Recovery Manager
                  </th>
               </tr>
            </thead>
            <tbody>
               {data.map((b: any, i: any) => (
                  <tr key={i}>
                     <td className="border border-gray-200 px-4 py-3 text-black font-medium">
                        {startIndex + i + 1}
                     </td>
                     <td className="border border-gray-200 px-4 py-3 text-black">
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-gray-500 text-[10px]"> ({b.customerId})</div>
                     </td>
                     <td className="border border-gray-200 px-4 py-3 text-black">
                        {b.phone || "-"}
                     </td>
                     <td className="border border-gray-200 px-4 py-3 ">{b.branch || "-"}</td>
                     {isDefaulter ? (
                        <td className="border border-gray-200 px-4 py-3 text-right text-black font-semibold">
                           {formatCurrency(b.totalOverdueAmount) || "-"}
                        </td>
                     ) : (
                        <td className="border border-gray-200 px-4 py-3 text-right text-black font-semibold">
                           {formatCurrency(b.loanAmount) || "-"}
                        </td>
                     )}
                     <td className="border border-gray-200 px-4 py-3 ">
                        {b?.rmDto?.rmName || "-"}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         <footer className="mt-8 pt-6 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-8 text-xs ">
               <div className="flex items-center justify-between text-xs text-gray-600">
                  <p>Confidential & Proprietary</p>
               </div>
               <div className="text-right">
                  <p className="text-gray-500 font-semibold uppercase tracking-wide">Document</p>
                  <p className="text-black mt-1">
                     Page {pageNumber} of {totalPages}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">{footerNote}</p>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default BorrowerTemplate;
