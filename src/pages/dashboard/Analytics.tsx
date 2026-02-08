import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Calendar,
  ArrowUpRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12000, target: 15000 },
  { month: 'Feb', revenue: 15000, target: 15000 },
  { month: 'Mar', revenue: 18000, target: 16000 },
  { month: 'Apr', revenue: 16000, target: 17000 },
  { month: 'May', revenue: 21000, target: 18000 },
  { month: 'Jun', revenue: 24000, target: 20000 },
  { month: 'Jul', revenue: 28000, target: 22000 },
  { month: 'Aug', revenue: 32000, target: 25000 },
  { month: 'Sep', revenue: 29000, target: 27000 },
  { month: 'Oct', revenue: 35000, target: 30000 },
  { month: 'Nov', revenue: 38000, target: 32000 },
  { month: 'Dec', revenue: 42000, target: 35000 },
];

const impactData = [
  { name: 'Jobs Created', value: 45, color: '#22c55e' },
  { name: 'Contracts Won', value: 12, color: '#3b82f6' },
  { name: 'Training Hours', value: 120, color: '#f59e0b' },
  { name: 'Community Events', value: 8, color: '#8b5cf6' },
];

const communityMetrics = [
  { month: 'Jan', jobs: 2, contracts: 1 },
  { month: 'Feb', jobs: 3, contracts: 1 },
  { month: 'Mar', jobs: 5, contracts: 2 },
  { month: 'Apr', jobs: 4, contracts: 1 },
  { month: 'May', jobs: 6, contracts: 2 },
  { month: 'Jun', jobs: 8, contracts: 3 },
];

const categoryBreakdown = [
  { name: 'Products', value: 45 },
  { name: 'Services', value: 30 },
  { name: 'Consulting', value: 15 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { subscribed, loading: subLoading } = useSubscription();
  const [timeRange, setTimeRange] = useState('12m');

  if (subLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subscribed) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Impact Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your business growth and community impact
            </p>
          </div>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Unlock Advanced Analytics</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get detailed insights into your revenue, community impact, job creation, and business growth metrics.
              </p>
              <Button asChild size="lg">
                <Link to="/pricing">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Upgrade to Pro
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
            <Card className="blur-sm">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <LineChart className="h-24 w-24 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="blur-sm">
              <CardHeader>
                <CardTitle>Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <PieChart className="h-24 w-24 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Impact Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your business growth and community impact
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value="$310,000"
            change={23}
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Jobs Created"
            value="45"
            change={12}
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Contracts Won"
            value="12"
            change={8}
            icon={Target}
            trend="up"
          />
          <MetricCard
            title="Community Impact Score"
            value="87/100"
            change={5}
            icon={TrendingUp}
            trend="up"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Target</CardTitle>
              <CardDescription>Monthly revenue compared to targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Impact Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Community Impact Breakdown</CardTitle>
              <CardDescription>Key impact metrics this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={impactData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {impactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs & Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs & Contracts Trend</CardTitle>
              <CardDescription>Monthly job creation and contracts won</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={communityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="jobs" fill="#22c55e" name="Jobs Created" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="contracts" fill="#3b82f6" name="Contracts Won" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Breakdown of revenue sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Revenue Milestone', description: 'Reached $300K annual revenue', date: 'This month', icon: DollarSign, color: 'bg-green-500/10 text-green-500' },
                { title: 'Job Creation', description: 'Created 10+ new community jobs', date: 'Last quarter', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
                { title: 'Contract Win', description: 'Won government procurement contract', date: '2 weeks ago', icon: Target, color: 'bg-amber-500/10 text-amber-500' },
              ].map((achievement, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-10 w-10 rounded-lg ${achievement.color} flex items-center justify-center`}>
                      <achievement.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      <p className="font-medium">{achievement.title}</p>
                    </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
