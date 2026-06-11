import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiDatabase, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiSliders,
  FiAlertTriangle,
  FiCheckCircle,
  FiShoppingBag
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/formatters';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/ui/Button';

export default function Stock() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Movements list
  const [movements, setMovements] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Form States
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('ENTRY'); // ENTRY, EXIT, ADJUSTMENT
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const [statsRes, lowRes, prodRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/stock/low'),
        api.get('/products', { params: { limit: 100 } })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (lowRes.data.success) {
        setLowStockCount(lowRes.data.data.length || 0);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products || []);
      }
    } catch (err) {
      toast.error('Erro ao carregar dados de estoque');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async (currentPage = 1) => {
    setMovementsLoading(true);
    try {
      const { data } = await api.get('/stock/movements', {
        params: {
          page: currentPage,
          limit: 10
        }
      });
      if (data.success) {
        setMovements(data.data.movements || []);
        setPage(data.data.page || 1);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Erro ao carregar histórico de movimentações');
    } finally {
      setMovementsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    fetchMovements(1);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchMovements(newPage);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProductId || !quantity || parseInt(quantity) < 0) {
      toast.error('Preencha os campos obrigatórios corretamente');
      return;
    }

    setSubmitLoading(true);
    try {
      const endpointMap = {
        ENTRY: '/stock/entry',
        EXIT: '/stock/exit',
        ADJUSTMENT: '/stock/adjustment'
      };

      const payload = {
        productId: parseInt(selectedProductId),
        quantity: parseInt(quantity),
        reason
      };

      const { data } = await api.post(endpointMap[type], payload);
      if (data.success) {
        toast.success(data.message || 'Movimentação de estoque registrada!');
        // Reset form
        setSelectedProductId('');
        setQuantity('');
        setReason('');
        // Reload all
        fetchStockData();
        fetchMovements(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao registrar movimentação');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Data/Hora',
      render: (row) => (
        <span className="text-text-secondary text-xs">
          {formatDateTime(row.createdAt)}
        </span>
      )
    },
    {
      key: 'product',
      label: 'Produto',
      render: (row) => (
        <div className="font-semibold text-white max-w-xs truncate" title={row.product?.name}>
          {row.product?.name || 'Produto Excluído'}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Movimentação',
      render: (row) => {
        const badges = {
          ENTRY: 'bg-success/15 border-success/35 text-success',
          EXIT: 'bg-danger/15 border-danger/35 text-danger',
          ADJUSTMENT: 'bg-warning/15 border-warning/35 text-warning'
        };
        const labels = {
          ENTRY: 'Entrada (+)',
          EXIT: 'Saída (-)',
          ADJUSTMENT: 'Ajuste (=)'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-block border ${badges[row.type] || ''}`}>
            {labels[row.type] || row.type}
          </span>
        );
      }
    },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (row) => (
        <span className="font-extrabold text-white">
          {row.quantity} un
        </span>
      )
    },
    {
      key: 'reason',
      label: 'Motivo / Justificativa',
      render: (row) => (
        <span className="text-text-secondary text-xs italic">
          {row.reason || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 text-white">
      <Helmet>
        <title>Controle de Estoque - Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Controle de Estoque</h1>
        <p className="text-text-secondary text-sm">
          Acompanhe o fluxo de mercadorias e faça ajustes de quantidade.
        </p>
      </div>

      {/* High level indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Produtos Cadastrados"
          value={stats?.totalProducts || 0}
          icon={FiDatabase}
          color="primary"
        />
        <StatCard
          title="Produtos Disponíveis"
          value={stats?.inStockProducts || 0}
          icon={FiCheckCircle}
          color="success"
        />
        <StatCard
          title="Produtos Esgotados"
          value={stats?.outOfStockProducts || 0}
          icon={FiAlertTriangle}
          color="danger"
        />
        <StatCard
          title="Estoque Crítico (< 5 un)"
          value={lowStockCount}
          icon={FiAlertTriangle}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form to update stock */}
        <div className="lg:col-span-4">
          <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold border-b border-dark-600 pb-2 mb-2 flex items-center gap-2">
              <FiSliders className="text-primary" /> Registrar Movimentação
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label htmlFor="prodSelect" className="text-xs font-semibold text-text-secondary block">Selecionar Produto *</label>
                <select
                  id="prodSelect"
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">Selecione...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Atual: {p.stock} un)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-text-secondary block">Tipo de Lançamento *</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`border rounded-xl py-2 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    type === 'ENTRY' 
                      ? 'border-success bg-success/15 text-success font-bold' 
                      : 'border-dark-600 hover:bg-dark-700 text-text-secondary'
                  }`}>
                    <FiTrendingUp className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Entrada</span>
                    <input type="radio" name="moveType" value="ENTRY" checked={type === 'ENTRY'} onChange={() => setType('ENTRY')} className="hidden" />
                  </label>

                  <label className={`border rounded-xl py-2 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    type === 'EXIT' 
                      ? 'border-danger bg-danger/15 text-danger font-bold' 
                      : 'border-dark-600 hover:bg-dark-700 text-text-secondary'
                  }`}>
                    <FiTrendingDown className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Saída</span>
                    <input type="radio" name="moveType" value="EXIT" checked={type === 'EXIT'} onChange={() => setType('EXIT')} className="hidden" />
                  </label>

                  <label className={`border rounded-xl py-2 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    type === 'ADJUSTMENT' 
                      ? 'border-warning bg-warning/15 text-warning font-bold' 
                      : 'border-dark-600 hover:bg-dark-700 text-text-secondary'
                  }`}>
                    <FiSliders className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">Ajuste</span>
                    <input type="radio" name="moveType" value="ADJUSTMENT" checked={type === 'ADJUSTMENT'} onChange={() => setType('ADJUSTMENT')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="qtyInput" className="text-xs font-semibold text-text-secondary block">
                  {type === 'ADJUSTMENT' ? 'Nova Quantidade Geral *' : 'Quantidade de Itens *'}
                </label>
                <input
                  id="qtyInput"
                  type="number"
                  required
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reasonText" className="text-xs font-semibold text-text-secondary block">Justificativa / Motivo</label>
                <textarea
                  id="reasonText"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Nota Fiscal nº 2039, ajuste de balanço, produto danificado..."
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={submitLoading}
                className="py-3 font-semibold rounded-xl text-sm shadow-lg shadow-primary/20"
              >
                Confirmar Lançamento
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: History table */}
        <div className="lg:col-span-8">
          <DataTable
            columns={columns}
            data={movements}
            loading={movementsLoading}
            emptyMessage="Nenhuma movimentação registrada no histórico."
            pagination={{
              currentPage: page,
              totalPages: totalPages,
              onPageChange: handlePageChange
            }}
          />
        </div>
      </div>
    </div>
  );
}
