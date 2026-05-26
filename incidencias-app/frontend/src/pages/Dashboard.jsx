import { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ open: 0, inProgress: 0, closed: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats', error);
        }
    };

    const chartData = [
        { name: 'Abiertas', value: stats.open, color: '#EF4444' },     // danger
        { name: 'En Progreso', value: stats.inProgress, color: '#F59E0B' }, // warning
        { name: 'Cerradas', value: stats.closed, color: '#10B981' },   // secondary/emerald
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-gray-400">Resumen del estado de las incidencias técnicas.</p>
            </div>

            {/* Tarjetas Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Abiertas" value={stats.open} color="border-danger" text="text-danger" />
                <StatCard title="En Progreso" value={stats.inProgress} color="border-warning" text="text-warning" />
                <StatCard title="Cerradas" value={stats.closed} color="border-secondary" text="text-secondary" />
            </div>

            {/* Gráfico */}
            <div className="mt-12 bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-xl w-full max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">Distribución de Incidencias</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#3D3D3D', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, text }) => (
    <div className={`bg-dark-800 p-6 rounded-2xl border-b-4 ${color} shadow-lg border border-dark-700 flex flex-col items-center justify-center transition-transform hover:-translate-y-1`}>
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
        <span className={`text-4xl font-bold ${text}`}>{value}</span>
    </div>
);

export default Dashboard;
