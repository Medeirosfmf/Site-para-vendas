import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiUsers, 
  FiTrash2, 
  FiEye,
  FiShoppingBag,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatDate, formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = async (currentPage = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery
        }
      });
      if (data.success) {
        setCustomers(data.data.customers || []);
        setTotal(data.data.total || 0);
        setPage(data.data.page || 1);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Erro ao carregar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page, search]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewDetails = async (customerId) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const { data } = await api.get(`/customers/${customerId}`);
      if (data.success) {
        setSelectedCustomer(data.data);
      }
    } catch (err) {
      toast.error('Erro ao carregar detalhes do cliente');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/customers/${customerToDelete.id}`);
      if (data.success) {
        toast.success('Cliente removido com sucesso!');
        setDeleteModalOpen(false);
        fetchCustomers(page, search); // Refresh
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao remover cliente');
    } finally {
      setDeleteLoading(false);
      setCustomerToDelete(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <span className="font-bold text-white text-base block">
          {row.name}
        </span>
      )
    },
    {
      key: 'email',
      label: 'E-mail',
      render: (row) => (
        <span className="text-text-secondary text-sm">
          {row.email}
        </span>
      )
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (row) => (
        <span className="text-text-secondary text-sm">
          {row.phone || 'Não informado'}
        </span>
      )
    },
    {
      key: 'city',
      label: 'Cidade',
      render: (row) => (
        <span className="text-text-secondary text-sm">
          {row.city || 'Não informado'}
        </span>
      )
    },
    {
      key: 'ordersCount',
      label: 'Pedidos',
      render: (row) => (
        <span className="font-semibold text-white">
          {row._count?.orders !== undefined ? row._count.orders : 0} pd
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Cadastro',
      render: (row) => (
        <span className="text-xs text-text-muted">
          {formatDate(row.createdAt)}
        </span>
      )
    }
  ];

  const renderActions = (row) => (
    <>
      <button
        onClick={() => handleViewDetails(row.id)}
        title="Ver ficha do cliente"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-text-secondary"
      >
        <FiEye className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleDeleteClick(row)}
        title="Excluir cliente"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-danger/30 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors text-text-secondary"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="space-y-6 text-white">
      <Helmet>
        <title>Clientes - Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Clientes</h1>
        <p className="text-text-secondary text-sm">
          Consulte o perfil, compras e produtos preferidos dos compradores cadastrados.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por nome ou e-mail..."
        actions={renderActions}
        emptyMessage="Nenhum cliente cadastrado."
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: handlePageChange
        }}
      />

      {/* Customer Detail Profile Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Ficha do Cliente"
        size="lg"
      >
        {detailLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : selectedCustomer ? (
          <div className="space-y-6 text-white text-sm max-h-[70vh] overflow-y-auto pr-1">
            {/* Header info info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-dark-800/40 p-4 border border-dark-600 rounded-xl">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiUsers className="text-secondary w-4 h-4" />
                  <span className="font-bold text-base">{selectedCustomer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <FiMail className="w-4 h-4" />
                  <span>{selectedCustomer.email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <FiPhone className="w-4 h-4" />
                  <span>{selectedCustomer.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <FiMapPin className="w-4 h-4" />
                  <span>{selectedCustomer.city || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* Last 10 Orders */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold border-b border-dark-600 pb-2 text-primary flex items-center gap-1.5">
                <FiShoppingBag /> Últimos 10 Pedidos
              </h4>
              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-text-muted py-2">Nenhum pedido efetuado por este cliente.</p>
              ) : (
                <div className="border border-dark-600 rounded-xl overflow-hidden">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-dark-800 text-text-secondary font-semibold">
                      <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Valor</th>
                        <th className="px-4 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {selectedCustomer.orders?.map(order => (
                        <tr key={order.id} className="hover:bg-dark-750/30">
                          <td className="px-4 py-2 font-bold text-secondary">#{order.id}</td>
                          <td className="px-4 py-2 text-text-secondary">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-2 font-bold">{formatCurrency(order.total)}</td>
                          <td className="px-4 py-2 text-right font-bold text-warning">{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Favorites List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold border-b border-dark-600 pb-2 text-accent flex items-center gap-1.5">
                <FiHeart /> Produtos Favoritos
              </h4>
              {selectedCustomer.favorites?.length === 0 ? (
                <p className="text-xs text-text-muted py-2">Nenhum produto favoritado por este cliente.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCustomer.favorites?.map(fav => (
                    <div key={fav.id} className="bg-dark-900 border border-dark-600 rounded-xl p-3 flex justify-between items-center">
                      <span className="font-semibold text-xs truncate max-w-[180px]">{fav.product?.name}</span>
                      <span className="font-bold text-xs text-accent">
                        {formatCurrency(fav.product?.promoPrice || fav.product?.salePrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remover Cliente"
        size="sm"
      >
        <div className="space-y-4 text-white">
          <p className="text-sm text-text-secondary leading-relaxed">
            Deseja realmente remover o cliente <span className="font-bold text-white">"{customerToDelete?.name}"</span>? Os carrinhos, favoritos e histórico de acessos desse usuário serão removidos.
          </p>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteLoading}
              className="bg-danger hover:bg-danger-hover text-white font-bold px-4 py-2 rounded-lg"
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
