'use client'; // This marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from "../lib/supabaseClient"; // Correct path to your supabaseClient
import { IconArrowWaveRightUp, IconClipboardCopy, IconSignature, IconBoxAlignTopLeft } from '@tabler/icons-react'; // Assuming these icons are being used

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type PeopleData = {
    lastCount: number;
    timestamp: string;
};

type PaymentData = {
    cart: { name: string; quantity: number }[];
    price?: number;
};

type GenderData = {
    Date: string;
    "Total male": number;
    "Total Female": number;
};

type AssociationRule = {
    rule: string;
    support: number;
    confidence: number;
    lift: number;
};

const Dashboard: React.FC = () => {
    // Color Palette
    const colors = {
        navy: "#1C2E4A",
        burgundy: "#7E1F28",
        green: "#236C4B",
        orange: "#D97C29",
        cream: "#E4CFA1",
    };

    const [peopleData, setPeopleData] = useState<PeopleData[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, number>>({});
    const [genderData, setGenderData] = useState<{ date: string; totalMale: number; totalFemale: number }[]>([]);
    const [unitSales, setUnitSales] = useState<number>(0);
    const [revenue, setRevenue] = useState<number>(0);
    const [topProduct, setTopProduct] = useState<string>('');
    const [marketBasketData, setMarketBasketData] = useState<{ associationRules: AssociationRule[] }>({ associationRules: [] });
    const [timeDistributionData, setTimeDistributionData] = useState<Record<string, number>>({
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch people data
                const response = await supabase.from<PeopleData>("peopledata").select("lastCount, timestamp");
                const pay = await supabase.from<PaymentData>("payments").select();

                // Payment analysis
                const cache: Record<string, number> = {};
                pay.data?.forEach((x) => {
                    x.cart.forEach((y) => {
                        cache[y.name] = (cache[y.name] || 0) + y.quantity;
                    });
                });

                setPeopleData(response.data || []);
                setAttendanceData(cache);

                // Calculate unit sales
                const totalSales = pay.data?.reduce(
                    (total, x) => total + x.cart.reduce((sum, y) => sum + y.quantity, 0),
                    0
                ) || 0;
                setUnitSales(totalSales);

                // Calculate revenue
                const totalRevenueThisMonth = pay.data?.reduce((total, x) => total + (x.price || 0), 0) || 0;
                setRevenue(totalRevenueThisMonth);

                // Determine the top product
                const productCounts: Record<string, number> = {};
                pay.data?.forEach((x) => {
                    x.cart.forEach((y) => {
                        productCounts[y.name] = (productCounts[y.name] || 0) + y.quantity;
                    });
                });
                const topProductEntry = Object.entries(productCounts).reduce(
                    (max, entry) => (entry[1] > max[1] ? entry : max),
                    ['', 0]
                );
                setTopProduct(topProductEntry[0]);

                // Fetch gender data
                const genderResponse = await supabase.from<GenderData>("analysis").select("Date, \"Total male\", \"Total Female\"");
                const aggregatedGenderData: Record<string, { totalMale: number; totalFemale: number }> = {};

                // Aggregate data by date
                genderResponse.data?.forEach((item) => {
                    const date = item.Date;
                    if (!aggregatedGenderData[date]) {
                        aggregatedGenderData[date] = { totalMale: 0, totalFemale: 0 };
                    }
                    aggregatedGenderData[date].totalMale += item["Total male"] || 0;
                    aggregatedGenderData[date].totalFemale += item["Total Female"] || 0;
                });

                // Convert the aggregated data into arrays for the chart
                const aggregatedDataArray = Object.entries(aggregatedGenderData).map(([date, counts]) => ({
                    date,
                    totalMale: counts.totalMale,
                    totalFemale: counts.totalFemale,
                }));

                setGenderData(aggregatedDataArray);

                // Market Basket Analysis
                const associationRules = calculateAssociationRules(pay.data || [], 0.1, 0.5); // Minimum support: 0.1, Minimum confidence: 50%
                setMarketBasketData({ associationRules });

                // Calculate time distribution
                calculateTimeDistribution(response.data || []);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const aggregatePeopleCountByDate = (data: PeopleData[]) => {
        const aggregatedData: Record<string, number> = {};

        data.forEach((entry) => {
            const date = new Date(entry.timestamp).toLocaleDateString(); // Format the date
            aggregatedData[date] = (aggregatedData[date] || 0) + entry.lastCount;
        });

        return {
            labels: Object.keys(aggregatedData),
            data: Object.values(aggregatedData),
        };
    };

    const calculateAssociationRules = (
        transactions: PaymentData[],
        minSupport: number,
        minConfidence: number
    ): AssociationRule[] => {
        const itemCounts: Record<string, number> = {};
        const itemPairCounts: Record<string, number> = {};
        const totalTransactions = transactions.length;

        transactions.forEach((transaction) => {
            const itemsInCart = transaction.cart.map((item) => item.name);
            const uniqueItems = new Set(itemsInCart);

            uniqueItems.forEach((item) => {
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            });

            uniqueItems.forEach((itemA) => {
                uniqueItems.forEach((itemB) => {
                    if (itemA !== itemB) {
                        const pairKey = [itemA, itemB].sort().join(',');
                        itemPairCounts[pairKey] = (itemPairCounts[pairKey] || 0) + 1;
                    }
                });
            });
        });

        const rules: AssociationRule[] = [];
        Object.entries(itemPairCounts).forEach(([pair, count]) => {
            const [itemA, itemB] = pair.split(',');
            const support = count / totalTransactions;
            const confidence = count / itemCounts[itemA];
            const lift = confidence / (itemCounts[itemB] / totalTransactions);

            if (support >= minSupport && confidence >= minConfidence) {
                rules.push({ rule: `${itemA} => ${itemB}`, support, confidence, lift });
            }
        });

        return rules;
    };

    const calculateTimeDistribution = (data: PeopleData[]) => {
        const timeDistribution: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        data.forEach((entry) => {
            const hour = new Date(entry.timestamp).getHours();
            if (hour >= 5 && hour < 12) {
                timeDistribution.morning += entry.lastCount;
            } else if (hour >= 12 && hour < 17) {
                timeDistribution.afternoon += entry.lastCount;
            } else if (hour >= 17 && hour < 21) {
                timeDistribution.evening += entry.lastCount;
            } else {
                timeDistribution.night += entry.lastCount;
            }
        });

        setTimeDistributionData(timeDistribution);
    };

    const { labels, data } = aggregatePeopleCountByDate(peopleData);
    const peopleCountChartData = {
        labels,
        datasets: [
            {
                label: 'People Count',
                data,
                backgroundColor: colors.orange,
                borderColor: colors.orange,
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container
            fluid
            style={{
                minHeight: '100vh',
                backgroundColor: colors.navy,
                padding: '20px',
            }}
        >
            {/* BentoGrid Overview Cards */}
            <div className="max-w-6xl mx-auto gap-6 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Monthly Revenue",
                        description: `$${revenue.toLocaleString()} (15% Growth)`,
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
                    <div
                        key={idx}
                        className={`border p-6 rounded-lg shadow-md bg-white ${idx === 3 ? "md:col-span-2" : ""}`}
                    >
                        <div className="flex items-center">
                            {item.icon}
                            <div className="ml-4">
                                <h4 className="text-xl font-semibold">{item.title}</h4>
                                <p className="text-gray-500">{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Other Dashboard Components */}
        </Container>
    );
};

export default Dashboard;
