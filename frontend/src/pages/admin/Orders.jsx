import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiShoppingBag, FiInfo } from 'react-icons/fi';
import api from '../../api/axios';
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP } from '../../utils/formatters';
import DataTable from '../../components/admin/DataTable';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async (currentPage = 1, status = 'ALL') => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10
      };
      if (status !== 'ALL') {
        params.status = status;
      }

      const { data } = await api.get('/orders', { params });
      if (data.success) {
        setOrders(data.data.orders || []);
        setTotalOrders(data.data.total || 0);
        setPage(data.data.page || 1);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Erro ao carregar lista de pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusTabChange = (status) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Status Tabs config
  const statusTabs = [
    { key: 'ALL', label: 'Todos' },
    { key: 'RECEIVED', label: 'Recebidos' },
    { key: 'ANALYZING', label: 'Em Análise' },
    { key: 'PAID', label: 'Pagos' },
    { key: 'SEPARATING', label: 'Em Separação' },
    { key: 'SHIPPED', label: 'Enviados' },
    { key: 'DELIVERED', label: 'Entregues' },
    { key: 'CANCELLED', label: 'Cancelados' }
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID Pedido',
      render: (row) => (
        <span className="font-extrabold text-secondary hover:underline cursor-pointer" onClick={() => navigate(`/admin/pedidos/${row.id}`)}>
          #{row.id}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Cliente',
      render: (row) => (
        <div>
          <div className="font-semibold text-white">{row.user?.name}</div>
          <div className="text-xs text-text-secondary">{row.user?.email}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Data/Hora',
      render: (row) => (
        <span className="text-text-secondary">
          {formatDateTime(row.createdAt)}
        </span>
      )
    },
    {
      key: 'itemsCount',
      label: 'Itens',
      render: (row) => (
        <span className="font-semibold text-white">
          {row.items?.length || 0} {row.items?.length === 1 ? 'item' : 'itens'}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span className="font-black text-white">
          {formatCurrency(row.total)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusInfo = ORDER_STATUS_MAP[row.status] || { label: row.status, color: 'info' };
        return (
          <span className={`px-2.5 py-1 rounded text-xs font-bold inline-block border ${
            statusInfo.color === 'success' ? 'bg-success/15 border-success/35 text-success' :
            statusInfo.color === 'danger' ? 'bg-danger/15 border-danger/35 text-danger' :
            statusInfo.color === 'warning' ? 'bg-warning/15 border-warning/35 text-warning' :
            statusInfo.color === 'primary' ? 'bg-primary/15 border-primary/35 text-primary' :
            'bg-secondary/15 border-secondary/35 text-secondary'
          }`}>
            {statusInfo.label}
          </span>
        );
      }
    }
  ];

  const renderActions = (row) => (
    <Link
      to={`/admin/pedidos/${row.id}`}
      title="Ver detalhes do pedido"
      className="p-2 bg-dark-700 border border-dark-600 hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-text-secondary inline-block"
    >
      <FiEye className="w-4 h-4" />
    </Link>
  );

  return (
    <div className="space-y-6 text-white">
      <Helmet>
        <title>Pedidos - Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Pedidos</h1>
        <p className="text-text-secondary text-sm">
          Acompanhe o status e atualize o workflow de vendas.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-dark-600 overflow-x-auto scrollbar-none gap-2 pb-1">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleStatusTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
              statusFilter === tab.key
                ? 'border-primary text-primary font-bold bg-primary/5'
                : 'border-transparent text-text-secondary hover:text-white hover:border-dark-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Box */}
      <div className="glass-card p-4 border border-dark-600 rounded-2xl flex items-center gap-3 text-sm text-text-secondary">
        <FiInfo className="w-5 h-5 text-secondary flex-shrink-0" />
        <span>
          Foram encontrados <span className="font-bold text-white">{totalOrders}</span> pedidos para o filtro selecionado.
        </span>
      </div>

      {/* Orders table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        actions={renderActions}
        emptyMessage="Nenhum pedido encontrado para este status."
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
