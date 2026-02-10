import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function PerformanceCharts({ metrics }) {
  const { counselorPerformance, destinationStats, popularCourses } = metrics;

  const destinationData = Object.entries(destinationStats || {}).map(([country, stats]) => ({
    country,
    total: stats.total,
    enrolled: stats.enrolled,
    pending: stats.pending,
    conversion: stats.total > 0 ? ((stats.enrolled / stats.total) * 100).toFixed(1) : 0
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Counselor Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Counselors by Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={counselorPerformance?.slice(0, 5) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrolled" fill="#10b981" name="Enrolled" />
              <Bar dataKey="total_applications" fill="#3b82f6" name="Total Applications" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Destination Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applications by Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={destinationData}
                dataKey="total"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.country}: ${entry.total}`}
              >
                {destinationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Courses Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Popular Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularCourses || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Total Applications" />
              <Bar dataKey="enrolled" fill="#10b981" name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Destination Conversion Rate */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Conversion Rates by Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={destinationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="conversion" stroke="#f59e0b" strokeWidth={2} name="Conversion Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}