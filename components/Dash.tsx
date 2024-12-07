"use client";

import React, { useEffect, useState } from "react";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { IconArrowWaveRightUp, IconClipboardCopy, IconSignature, IconBoxAlignTopLeft } from "@tabler/icons-react";
import { Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { supabase } from "../lib/supabaseClient"; // Correct path to your supabaseClient

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type DemographicItem = {
  time_of_day: string;
  gender: string;
  count: number;
};

type SalesItem = {
  cart: string;
  PaymentDate: string;
};

const Dash: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [distributionType, setDistributionType] = useState<'people' | 'gender'>('people'); // Toggle between people and gender
  const [demographicData, setDemographicData] = useState<DemographicItem[]>([]);
  const [genderData, setGenderData] = useState<DemographicItem[]>([]);

  const [topProductCategory, setTopProductCategory] = useState<string>('');

  // Fetch demographic data based on selected date
  useEffect(() => {
    const fetchData = async () => {
        if (!selectedDate) return;
      
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
      
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
      
        // Fetch demographic data from Supabase based on selected date
        const { data: demographics, error: demographicsError } = await supabase
          .from("demographics")
          .select("*")
          .gte("date", startOfDay.toISOString()) // Filter by start of day
          .lte("date", endOfDay.toISOString()); // Filter by end of day
      
        if (demographicsError) {
          console.error("Error fetching demographics:", demographicsError);
        } else {
          // Filter data by time_of_day and gender
          const timeOfDayData = demographics.filter((item) => item.time_of_day);
          const genderData = demographics.filter((item) => item.gender);
      
          setDemographicData(timeOfDayData);
          setGenderData(genderData);
        }
      
        // Fetch sales data to calculate the top-selling product category
        const { data: salesData, error: salesError } = await supabase
          .from("payments")
          .select("*")
          .gte("PaymentDate", startOfDay.toISOString())
      
        console.log(salesData)
        if (salesError) {
          console.error("Error fetching sales data:", salesError);
        } else {
          const categorySales = salesData.reduce((acc, curr) => {
            // Check if cart is an object (not an array)
            if (curr.cart && typeof curr.cart === 'object') {
              const item = curr.cart;
              const totalItemPrice = item.price_per_item * item.quantity;
      
              if (acc[item.item]) {
                acc[item.item].total += totalItemPrice;
              } else {
                acc[item.item] = {
                  total: totalItemPrice,
                  name: item.item
                };
              }
            } else {
              // Log unexpected cart structure for debugging
              console.warn("Unexpected cart structure:", curr.cart);
            }
            return acc;
          }, {});
      
          // Find the top-selling category based on total sales
          const topCategory = Object.values(categorySales).reduce((max, category) => {
            return category.total > max.total ? category : max;
          }, {});
      
          setTopProductCategory(topCategory.name || "N/A");
        }
      };
      

    fetchData();
  }, [selectedDate]);

  // Prepare Pie chart data for Time-of-Day Distribution
  const timeOfDayData = {
    labels: ["Morning", "Afternoon", "Evening", "Night"],
    datasets: [
      {
        label: "Time of Day Distribution",
        data: [
          demographicData.filter((item: DemographicItem) => item.time_of_day === "Morning").reduce((acc: number, curr: any) => acc + curr.count, 0),
          demographicData.filter((item: DemographicItem) => item.time_of_day === "Afternoon").reduce((acc: number, curr: any) => acc + curr.count, 0),
          demographicData.filter((item: DemographicItem) => item.time_of_day === "Evening").reduce((acc: number, curr: any) => acc + curr.count, 0),
          demographicData.filter((item: DemographicItem) => item.time_of_day === "Night").reduce((acc: number, curr: any) => acc + curr.count, 0),
        ],
        backgroundColor: ["#1C2E4A", "#7E1F28", "#236C4B", "#D97C29"],
        borderColor: "#E4CFA1",
        borderWidth: 1,
      },
    ],
  };

  // Prepare Pie chart data for Gender Distribution
  const genderDistributionData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Gender Distribution",
        data: [
          genderData.filter((item: DemographicItem) => item.gender === "Male").reduce((acc: number, curr: any) => acc + curr.count, 0),
          genderData.filter((item: DemographicItem) => item.gender === "Female").reduce((acc: number, curr: any) => acc + curr.count, 0),
        ],
        backgroundColor: ["#1C2E4A", "#F3A300"],
        borderColor: "#E4CFA1",
        borderWidth: 1,
      },
    ],
  };

  return (
    <section id="analytics_overview" className="p-6 lg:p-8 bg-transparent min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Smart Space Analytics</h2>
        <p className="text-gray-400">Real-time insights and demographic analysis</p>
      </div>

      {/* BentoGrid Overview Cards */}
      <BentoGrid className="max-w-6xl mx-auto gap-6 mb-8">
        {[
          {
            title: "Monthly Revenue",
            description: "$500,000 (15% Growth)", // Set static value for example
            header: "Revenue",
            icon: <IconArrowWaveRightUp size={24} className="text-green-400" />,
          },
          {
            title: "Total Transactions",
            description: "1,892 (8% Growth)",
            header: "Transactions",
            icon: <IconClipboardCopy size={24} className="text-blue-400" />,
          },
          {
            title: "Employee Attendance",
            description: "95% (Today)",
            header: "Attendance",
            icon: <IconSignature size={24} className="text-yellow-400" />,
          },
          {
            title: "Customer Satisfaction",
            description: "4.8/5.0",
            header: "Satisfaction",
            icon: <IconBoxAlignTopLeft size={24} className="text-pink-400" />,
          },
        ].map((item, idx) => (
          <BentoGridItem
            key={idx}
            title={<h4 className="text-xl font-semibold text-white">{item.title}</h4>}
            description={item.description}
            header={item.header}
            icon={item.icon}
            className={idx === 3 ? "md:col-span-2" : ""}
          />
        ))}
      </BentoGrid>

      {/* Demographics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <div className="bg-[#1e2633] rounded-lg p-6 border border-neutral-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Demographics Analysis</h3>
            <div className="flex items-center space-x-4">
              <select
                onChange={(e) => setDistributionType(e.target.value as 'people' | 'gender')}
                value={distributionType}
                className="bg-neutral-700 text-white px-4 py-2 rounded"
              >
                <option value="people">People Distribution</option>
                <option value="gender">Gender Distribution</option>
              </select>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                className="bg-neutral-700 text-white px-4 py-2 rounded"
              />
            </div>
          </div>
          <div>
            <Pie data={distributionType === "people" ? timeOfDayData : genderDistributionData} />
          </div>
        </div>

        {/* Top Product Category */}
        <div className="bg-[#1e2633] rounded-lg p-6 border border-neutral-700">
          <h3 className="text-white font-semibold mb-4">Top-Selling Product Category</h3>
          <p className="text-white">{topProductCategory}</p>
        </div>
      </div>
    </section>
  );
};

export default Dash;
