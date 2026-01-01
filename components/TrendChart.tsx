
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SaleRecord } from '../types';

interface TrendChartProps {
  data: SaleRecord[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const chartData = data.map(s => ({
    name: s.date.split('-').slice(1).join('/'),
    amount: s.amount
  }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Sales Trend</h3>
          <p className="text-sm text-slate-500">Performance over the last 30 days</p>
        </div>
        <select className="text-sm border-slate-200 rounded-lg bg-slate-50 px-3 py-1 outline-none">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
        </select>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
            <Tooltip 
              contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              itemStyle={{color: '#6366f1', fontWeight: 'bold'}}
            />
            <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
