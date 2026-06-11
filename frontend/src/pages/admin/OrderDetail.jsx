import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiShoppingBag, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatCurrency, formatDateTime, ORDER_STATUS_MAP } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
        setStatus(data.data.status);
      }
    } catch (err) {
      toast.error('Erro ao carregar detalhes do pedido');
      navigate('/admin/pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleStatusChange = async (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!status) return;
    setStatusLoading(true);
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      if (data.success) {
        toast.success('Status do pedido atualizado com sucesso!');
        setOrder(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar status');
      setStatus(order?.status || '');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido? O estoque dos produtos será restaurado.')) return;
    setCancelLoading(true);
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      if (data.success) {
        toast.success('Pedido cancelado com sucesso!');
        setOrder(data.data);
        setStatus('CANCELLED');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao cancelar pedido');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <FiShoppingBag className="w-16 h-16 text-text-muted mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Pedido não encontrado</h2>
        <Link to="/admin/pedidos" className="btn-primary">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  const isFinalState = order.status === 'CANCELLED' || order.status === 'DELIVERED';
  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'info' };
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Status List for visual timeline
  const statusesList = [
    { key: 'RECEIVED', label: 'Recebido', icon: FiShoppingBag },
    { key: 'ANALYZING', label: 'Análise', icon: FiAlertCircle },
    { key: 'PAID', label: 'Pago', icon: FiCheckCircle },
    { key: 'SEPARATING', label: 'Separação', icon: FiPackage },
    { key: 'SHIPPED', label: 'Enviado', icon: FiTruck },
    { key: 'DELIVERED', label: 'Entregue', icon: FiCheckCircle }
  ];

  // Helper to determine index of status
  const getStatusIndex = (stat) => {
    return statusesList.findIndex(s => s.key === stat);
  };

  const currentIdx = getStatusIndex(order.status);

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto">
      <Helmet>
        <title>Pedido #{order.id} - Admin</title>
      </Helmet>

      {/* Header back */}
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/pedidos" 
          className="p-2 bg-dark-800 border border-dark-600 rounded-lg text-text-secondary hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Detalhes do Pedido #{order.id}
          </h1>
          <p className="text-text-secondary text-sm flex items-center gap-1.5 mt-1">
            <FiCalendar /> Criado em {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Stepper Timeline (Only show if not Cancelled) */}
      {order.status !== 'CANCELLED' && (
        <div className="glass-card p-6 border border-dark-600 rounded-2xl overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-between relative px-8 py-4">
            {/* Timeline bar back */}
            <div className="absolute top-[38px] left-[52px] right-[52px] h-[3px] bg-dark-700 z-0" />
            
            {/* Timeline bar active */}
            <div 
              className="absolute top-[38px] left-[52px] h-[3px] bg-gradient-to-r from-primary to-secondary z-0 transition-all duration-500" 
              style={{ width: `${(currentIdx / (statusesList.length - 1)) * 90}%` }}
            />

            {statusesList.map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = idx < currentIdx;
              const isActive = idx === currentIdx;
              
              return (
                <div key={step.key} className="flex flex-col items-center z-10 select-none relative">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(108,92,231,0.5)] scale-110' 
                      : isPast 
                      ? 'bg-dark-800 border-secondary text-secondary' 
                      : 'bg-dark-800 border-dark-600 text-text-muted'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-semibold mt-2.5 whitespace-nowrap transition-colors ${
                    isActive ? 'text-white font-bold' : isPast ? 'text-secondary' : 'text-text-muted'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Alert Box */}
      {order.status === 'CANCELLED' && (
        <div className="glass-card p-6 border border-danger/30 bg-danger/5 rounded-2xl flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center flex-shrink-0">
            <FiXCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-danger">Pedido Cancelado</h4>
            <p className="text-sm text-text-secondary mt-0.5">
              Este pedido foi cancelado e o estoque reservado para os itens foi restaurado para a loja.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Items table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Items list card */}
          <div className="glass-card overflow-hidden border border-dark-600 rounded-2xl">
            <div className="p-4 sm:p-6 border-b border-dark-600 bg-dark-800/10">
              <h3 className="text-lg font-bold">Itens do Pedido</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-dark-800 font-semibold text-text-secondary text-xs uppercase border-b border-dark-600">
                  <tr>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Preço Unit.</th>
                    <th className="px-6 py-4 text-center">Qtd</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600 bg-dark-850/10">
                  {order.items?.map((item) => {
                    const product = item.product;
                    const imageUrl = product?.mainImage ? `${baseUrl}${product.mainImage}` : '';
                    return (
                      <tr key={item.id} className="hover:bg-dark-700/15">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-dark-850 border border-dark-600 p-1 flex-shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product?.name} className="w-full h-full object-contain" />
                            ) : (
                              <FiShoppingBag className="w-4 h-4 text-text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            {product ? (
                              <Link to={`/produto/${product.slug}`} className="font-bold text-white hover:underline block truncate max-w-[220px]">
                                {product.name}
                              </Link>
                            ) : (
                              <span className="text-text-muted">Produto Excluído</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-secondary">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-white">
                          {formatCurrency(parseFloat(item.unitPrice) * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-dark-600 bg-dark-800/10 flex flex-col sm:flex-row justify-between items-end gap-4">
              {order.notes && (
                <div className="text-xs text-text-secondary bg-dark-850 p-4 rounded-xl border border-dark-600 w-full sm:max-w-md">
                  <span className="font-semibold block text-white mb-1">Observações do Cliente:</span>
                  {order.notes}
                </div>
              )}
              <div className="text-right ml-auto min-w-[200px] space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-secondary border-b border-dark-600 pb-2">
                  <span>Frete/Envio:</span>
                  <span className="text-success font-semibold">A combinar</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-sm font-bold text-white">Total Geral:</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Workflow & Customer Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Order Status Control */}
          <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
            <h3 className="text-base font-bold border-b border-dark-600 pb-2">Gerenciar Pedido</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-secondary">Status Atual:</span>
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold inline-block border ${
                    statusInfo.color === 'success' ? 'bg-success/15 border-success/35 text-success' :
                    statusInfo.color === 'danger' ? 'bg-danger/15 border-danger/35 text-danger' :
                    statusInfo.color === 'warning' ? 'bg-warning/15 border-warning/35 text-warning' :
                    statusInfo.color === 'primary' ? 'bg-primary/15 border-primary/35 text-primary' :
                    'bg-secondary/15 border-secondary/35 text-secondary'
                  }`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {!isFinalState && (
                <div className="space-y-3 pt-2">
                  <label htmlFor="statusSelect" className="text-xs font-semibold text-text-secondary block">Alterar Status:</label>
                  <select
                    id="statusSelect"
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="RECEIVED">Recebido</option>
                    <option value="ANALYZING">Em Análise</option>
                    <option value="PAID">Pago</option>
                    <option value="SEPARATING">Em Separação</option>
                    <option value="SHIPPED">Enviado</option>
                    <option value="DELIVERED">Entregue</option>
                  </select>

                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={handleUpdateStatus}
                    isLoading={statusLoading}
                    className="py-2.5"
                  >
                    Salvar Status
                  </Button>
                </div>
              )}

              {/* Cancel Button */}
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <div className="border-t border-dark-600 pt-4">
                  <Button 
                    variant="danger" 
                    fullWidth 
                    onClick={handleCancelOrder}
                    isLoading={cancelLoading}
                    className="bg-transparent border-danger/35 text-danger hover:bg-danger/15"
                  >
                    Cancelar Pedido
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
            <h3 className="text-base font-bold border-b border-dark-600 pb-2">Informações do Cliente</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <FiUser className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-text-secondary block">Nome Completo:</span>
                  <span className="font-semibold text-white">{order.user?.name}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-dark-600 pt-3">
                <FiMail className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs text-text-secondary block">E-mail:</span>
                  <span className="font-semibold text-white truncate block">{order.user?.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-dark-600 pt-3">
                <FiPhone className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-text-secondary block">Telefone/WhatsApp:</span>
                  <span className="font-semibold text-white">{order.user?.phone || 'Não informado'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-dark-600 pt-3">
                <FiMapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-text-secondary block">Cidade de Destino:</span>
                  <span className="font-semibold text-white">{order.user?.city || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
