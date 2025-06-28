"use client";
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { supabase } from "../lib/supabaseClient";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [peopleData, setPeopleData] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [genderData, setGenderData] = useState([]);
    const [unitSales, setUnitSales] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [topProduct, setTopProduct] = useState('');
    const [marketBasketData, setMarketBasketData] = useState({ associationRules: [] });
    const [timeDistributionData, setTimeDistributionData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const peopleRes = await supabase.from("peopledata").select("lastcount, timestamp");
                const pay = await supabase.from("payments").select();

                const cache = {};
                pay.data?.forEach(x => {
                    const cart = typeof x.cart === 'string' ? JSON.parse(x.cart) : x.cart || [];
                    cart.forEach(y => {
                        if (y?.name && typeof y.quantity === 'number') {
                            cache[y.name] = (cache[y.name] || 0) + y.quantity;
                        }
                    });
                });

                setPeopleData(peopleRes.data || []);
                setAttendanceData(cache);

                const totalSales = pay.data?.reduce((total, x) => {
                    const cart = typeof x.cart === 'string' ? JSON.parse(x.cart) : x.cart || [];
                    return total + cart.reduce((sum, y) => sum + (y.quantity || 0), 0);
                }, 0) || 0;
                setUnitSales(totalSales);

                const totalRevenueThisMonth = pay.data?.reduce((total, x) => total + (x.price || 0), 0) || 0;
                setRevenue(totalRevenueThisMonth.toFixed(2));

                const productCounts = {};
                pay.data?.forEach(x => {
                    const cart = typeof x.cart === 'string' ? JSON.parse(x.cart) : x.cart || [];
                    cart.forEach(y => {
                        if (y?.name && typeof y.quantity === 'number') {
                            productCounts[y.name] = (productCounts[y.name] || 0) + y.quantity;
                        }
                    });
                });
                const topProductEntry = Object.entries(productCounts).reduce((max, entry) =>
                    entry[1] > max[1] ? entry : max, ['', 0]);
                setTopProduct(topProductEntry[0]);

                // GENDER DATA
                // GENDER DATA from demographics table
                const genderRes = await supabase
                    .from("demographics")
                    .select("gender, count, date");

                const genderByDate = {};
                genderRes.data?.forEach(row => {
                    const date = new Date(row.date).toLocaleDateString();
                    if (!genderByDate[date]) {
                        genderByDate[date] = { Male: 0, Female: 0 };
                    }
                    if (row.gender.toLowerCase() === 'male') {
                        genderByDate[date].Male += row.count;
                    } else if (row.gender.toLowerCase() === 'female') {
                        genderByDate[date].Female += row.count;
                    }
                });

                const aggregatedDataArray = Object.entries(genderByDate).map(([date, counts]) => ({
                    date,
                    totalMale: counts.Male,
                    totalFemale: counts.Female,
                }));
                setGenderData(aggregatedDataArray);

                const rules = calculateAssociationRules(pay.data || [], 0.1, 0.5);
                setMarketBasketData({ associationRules: rules });

                calculateTimeDistribution(peopleRes.data || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const aggregatePeopleCountByDate = (data) => {
        const aggregatedData = {};
        if (!Array.isArray(data)) return { labels: [], data: [] };

        data.forEach(entry => {
            const dateObj = new Date(entry.timestamp);
            if (!isNaN(dateObj)) {
                const date = dateObj.toLocaleDateString();
                aggregatedData[date] = (aggregatedData[date] || 0) + entry.lastcount;
            }
        });

        return {
            labels: Object.keys(aggregatedData),
            data: Object.values(aggregatedData),
        };
    };

    const calculateTimeDistribution = (data) => {
        const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        data.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            if (hour >= 5 && hour < 12) {
                timeDistribution.morning += entry.lastcount;
            } else if (hour >= 12 && hour < 17) {
                timeDistribution.afternoon += entry.lastcount;
            } else if (hour >= 17 && hour < 21) {
                timeDistribution.evening += entry.lastcount;
            } else {
                timeDistribution.night += entry.lastcount;
            }
        });

        setTimeDistributionData(timeDistribution);
    };

    const calculateAssociationRules = (transactions, minSupport, minConfidence) => {
        const itemCounts = {};
        const itemPairCounts = {};
        const totalTransactions = transactions.length;

        transactions.forEach(transaction => {
            const cart = typeof transaction.cart === 'string' ? JSON.parse(transaction.cart) : transaction.cart || [];
            const items = new Set(cart.map(item => item.name));

            items.forEach(item => {
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            });

            items.forEach(itemA => {
                items.forEach(itemB => {
                    if (itemA !== itemB) {
                        const pairKey = [itemA, itemB].sort().join(',');
                        itemPairCounts[pairKey] = (itemPairCounts[pairKey] || 0) + 1;
                    }
                });
            });
        });

        const rules = [];
        for (const [pair, count] of Object.entries(itemPairCounts)) {
            const [itemA, itemB] = pair.split(',');
            const support = count / totalTransactions;
            const confidence = count / itemCounts[itemA];
            const lift = confidence / (itemCounts[itemB] / totalTransactions);

            if (support >= minSupport && confidence <= 1) {
                rules.push({ rule: `${itemA} => ${itemB}`, support, confidence, lift });
            }
        }
        return rules;
    };

    const { labels, data } = aggregatePeopleCountByDate(peopleData);

    const peopleCountChartData = {
        labels,
        datasets: [{
            label: 'People Count',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    };

    const attendanceChartData = {
        labels: Object.keys(attendanceData),
        datasets: [{
            label: 'Product Count',
            data: Object.values(attendanceData),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
        }],
    };

    const genderChartData = {
        labels: genderData.map(d => d.date),
        datasets: [
            {
                label: 'Total Male',
                data: genderData.map(d => d.totalMale),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Female',
                data: genderData.map(d => d.totalFemale),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const timeChartData = {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [{
            label: 'People Distribution by Time of Day',
            data: [
                timeDistributionData.morning,
                timeDistributionData.afternoon,
                timeDistributionData.evening,
                timeDistributionData.night,
            ],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }],
    };

    return (
        <div id="Dashboard">
            <Container fluid className="dashboard-container d-flex flex-column" style={{ minHeight: '100vh' }}>
                <h1 className="text-center my-4" style={{ fontSize: '4rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <Card.Title>Unit Sales This Month</Card.Title>
                                <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>{unitSales}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <Card.Title>Revenue This Month</Card.Title>
                                <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold' }}>${revenue}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <Card.Title>Top Selling Product</Card.Title>
                                <Card.Text style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{topProduct}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Card className="p-3 shadow-sm">
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>People Count</h1>
                            <Bar data={peopleCountChartData} />
                        </Card>
                    </Col>
                   
                </Row>
                <Row className="mt-4">
                    <Col md={6}>
                        <Card className="p-3 shadow-sm">
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>Gender Distribution</h1>
                            <Bar data={genderChartData} />
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="p-3 shadow-sm">
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>People Distribution Over Time</h1>
                            <Pie data={timeChartData} />
                        </Card>
                    </Col>
                </Row>
                <Card className="mt-4 shadow-sm">
                    <Card.Body>
                        <ul>
                            {marketBasketData.associationRules.map((rule, index) => (
                                <li key={index}>
                                    <strong>{rule.rule}</strong> - Support: {(rule.support * 100).toFixed(2)}%, Confidence: {(rule.confidence * 100).toFixed(2)}%, Lift: {rule.lift.toFixed(2)}
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Dashboard;
