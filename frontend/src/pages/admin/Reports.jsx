import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiEye, 
  FiShoppingBag, 
  FiGrid, 
  FiAlertTriangle, 
  FiTrendingUp,
  FiDollarSign
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';
import ChartCard from '../../components/admin/ChartCard';
import StatCard from '../../components/admin/StatCard';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('views'); // views, sales, categories, low_stock, profit
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReportData = async (tab) => {
    setLoading(true);
    try {
      const endpoints = {
        views: '/reports/most-viewed',
        sales: '/reports/most-sold',
        categories: '/reports/categories',
        low_stock: '/reports/low-stock',
        profit: '/reports/profit'
      };

      const { data } = await api.get(endpoints[tab]);
      if (data.success) {
        setReportData(data.data);
      }
    } catch (err) {
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'views', label: 'Mais Vistos', icon: FiEye },
    { id: 'sales', label: 'Mais Vendidos', icon: FiShoppingBag },
    { id: 'categories', label: 'Categorias', icon: FiGrid },
    { id: 'low_stock', label: 'Estoque Baixo', icon: FiAlertTriangle },
    { id: 'profit', label: 'Lucro Estimado', icon: FiTrendingUp }
  ];

  // Colors for charts
  const COLORS = ['#6C5CE7', '#00CEFF', '#FD79A8', '#FDCB6E', '#00B894', '#E17055'];

  return (
    <div className="space-y-6 text-white">
      <Helmet>
        <title>Relatórios Analíticos - Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Relatórios Analíticos</h1>
        <p className="text-text-secondary text-sm">
          Consulte o desempenho de visualizações, vendas, categorias e margens de lucro.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-dark-600 overflow-x-auto scrollbar-none gap-2 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold bg-primary/5'
                  : 'border-transparent text-text-secondary hover:text-white hover:border-dark-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          
          {/* Tab 1: Most Viewed */}
          {activeTab === 'views' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-7">
                <ChartCard title="Top 10 Produtos Mais Acessados" subtitle="Número de visualizações únicas de páginas">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={reportData.slice(0, 10).map(v => ({
                        name: v.product?.name ? (v.product.name.length > 15 ? `${v.product.name.substring(0, 15)}...` : v.product.name) : 'Excluído',
                        visualizacoes: v.viewCount
                      }))}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D44" />
                      <XAxis dataKey="name" stroke="#6B6B80" fontSize={11} />
                      <YAxis stroke="#6B6B80" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#2D2D44' }} />
                      <Bar dataKey="visualizacoes" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="lg:col-span-5">
                <div className="glass-card border border-dark-600 rounded-2xl p-6">
                  <h3 className="text-base font-bold border-b border-dark-600 pb-3 mb-4">Tabela de Acessos</h3>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="min-w-full text-xs text-left">
                      <thead className="text-text-secondary border-b border-dark-600 font-semibold">
                        <tr>
                          <th className="py-2">Produto</th>
                          <th className="py-2">Marca</th>
                          <th className="py-2 text-right">Visualizações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {reportData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-dark-700/10">
                            <td className="py-2.5 font-bold truncate max-w-[150px]">{item.product?.name || 'Excluído'}</td>
                            <td className="py-2.5 text-text-secondary">{item.product?.brand?.name || '-'}</td>
                            <td className="py-2.5 text-right font-black text-secondary">{item.viewCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Most Sold */}
          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-7">
                <ChartCard title="Top 10 Produtos Mais Vendidos" subtitle="Total de unidades vendidas em pedidos fechados">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={reportData.slice(0, 10).map(s => ({
                        name: s.product?.name ? (s.product.name.length > 15 ? `${s.product.name.substring(0, 15)}...` : s.product.name) : 'Excluído',
                        vendas: s.totalSold
                      }))}
                      margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D44" />
                      <XAxis dataKey="name" stroke="#6B6B80" fontSize={11} />
                      <YAxis stroke="#6B6B80" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#2D2D44' }} />
                      <Bar dataKey="vendas" fill="#00CEFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <div className="lg:col-span-5">
                <div className="glass-card border border-dark-600 rounded-2xl p-6">
                  <h3 className="text-base font-bold border-b border-dark-600 pb-3 mb-4">Tabela de Vendas</h3>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="min-w-full text-xs text-left">
                      <thead className="text-text-secondary border-b border-dark-600 font-semibold">
                        <tr>
                          <th className="py-2">Produto</th>
                          <th className="py-2">Categoria</th>
                          <th className="py-2 text-right">Qtd Vendida</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {reportData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-dark-700/10">
                            <td className="py-2.5 font-bold truncate max-w-[150px]">{item.product?.name || 'Excluído'}</td>
                            <td className="py-2.5 text-text-secondary">{item.product?.category?.name || '-'}</td>
                            <td className="py-2.5 text-right font-black text-success">{item.totalSold} un</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Categories stats */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
              <div className="lg:col-span-7 flex flex-col justify-between">
                <ChartCard title="Distribuição do Catálogo por Categorias" subtitle="Número de produtos cadastrados em cada setor">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={reportData.map(c => ({
                          name: c.category?.name || 'Sem Categoria',
                          value: c.productCount
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#2D2D44' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-text-muted mt-2">
                    {reportData.map((c, index) => (
                      <div key={idx => idx} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{c.category?.name || 'Sem Categoria'} ({c.productCount})</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
              <div className="lg:col-span-5">
                <div className="glass-card border border-dark-600 rounded-2xl p-6">
                  <h3 className="text-base font-bold border-b border-dark-600 pb-3 mb-4">Tabela de Categorias</h3>
                  <div className="overflow-x-auto max-h-[300px]">
                    <table className="min-w-full text-xs text-left">
                      <thead className="text-text-secondary border-b border-dark-600 font-semibold">
                        <tr>
                          <th className="py-2">Categoria</th>
                          <th className="py-2 text-right">Cadastrados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-600">
                        {reportData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-dark-700/10">
                            <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                              <span className="text-base">{item.category?.icon || '📦'}</span>
                              <span>{item.category?.name || 'Sem Categoria'}</span>
                            </td>
                            <td className="py-2.5 text-right font-black text-secondary">{item.productCount} produtos</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Low Stock */}
          {activeTab === 'low_stock' && (
            <div className="glass-card border border-dark-600 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-dark-600 pb-3 mb-4 text-warning">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="w-5 h-5 animate-pulse" />
                  <h3 className="text-lg font-bold">Relatório Crítico de Estoque</h3>
                </div>
                <span className="text-xs font-semibold bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                  {reportData.length} alertas de atenção
                </span>
              </div>
              
              {reportData.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">Excelente! Nenhum produto com estoque abaixo de 10 unidades.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead className="text-text-secondary border-b border-dark-600 font-semibold">
                      <tr>
                        <th className="py-3">Produto</th>
                        <th className="py-3">Categoria</th>
                        <th className="py-3">Marca</th>
                        <th className="py-3 text-right">Preço Venda</th>
                        <th className="py-3 text-right">Estoque Atual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {reportData.map((product) => (
                        <tr key={product.id} className="hover:bg-dark-700/10">
                          <td className="py-3 font-bold text-white">{product.name}</td>
                          <td className="py-3 text-text-secondary">{product.category?.name}</td>
                          <td className="py-3 text-text-secondary">{product.brand?.name}</td>
                          <td className="py-3 text-right font-semibold">{formatCurrency(product.salePrice)}</td>
                          <td className="py-3 text-right font-black text-danger bg-danger/5 px-2 rounded-lg">
                            {product.stock} un
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Profit Report */}
          {activeTab === 'profit' && (
            <div className="space-y-6 animate-fadeIn">
              {/* StatCards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                  title="Faturamento Total"
                  value={formatCurrency(reportData.totalRevenue)}
                  icon={FiDollarSign}
                  color="info"
                />
                <StatCard
                  title="Custo Total das Vendas"
                  value={formatCurrency(reportData.totalCost)}
                  icon={FiDollarSign}
                  color="danger"
                />
                <StatCard
                  title="Lucro Líquido Estimado"
                  value={formatCurrency(reportData.totalProfit)}
                  icon={FiTrendingUp}
                  color="success"
                />
              </div>

              {/* Monthly Profit Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <ChartCard title="Faturamento vs Lucro por Mês" subtitle="Valores brutos arrecadados versus margem líquida">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart 
                        data={[...reportData.monthly].reverse()}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D2D44" />
                        <XAxis dataKey="month" stroke="#6B6B80" fontSize={11} />
                        <YAxis stroke="#6B6B80" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#12121A', borderColor: '#2D2D44' }} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Receita" stroke="#00CEFF" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" name="Lucro Líquido" stroke="#00B894" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
                
                <div className="lg:col-span-4">
                  <div className="glass-card border border-dark-600 rounded-2xl p-6">
                    <h3 className="text-base font-bold border-b border-dark-600 pb-3 mb-4">Balancete Mensal</h3>
                    <div className="overflow-x-auto max-h-[250px]">
                      <table className="min-w-full text-xs text-left">
                        <thead className="text-text-secondary border-b border-dark-600 font-semibold">
                          <tr>
                            <th className="py-2">Mês</th>
                            <th className="py-2 text-right">Vendas</th>
                            <th className="py-2 text-right">Lucro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-600">
                          {reportData.monthly.map((m, idx) => (
                            <tr key={idx} className="hover:bg-dark-700/10">
                              <td className="py-2.5 font-bold text-white">{m.month}</td>
                              <td className="py-2.5 text-right text-text-secondary">{formatCurrency(m.revenue)}</td>
                              <td className="py-2.5 text-right font-black text-success">{formatCurrency(m.profit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="py-20 text-center text-text-secondary">
          Nenhum dado retornado para este relatório.
        </div>
      )}
    </div>
  );
}
