import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit, 
  FiCopy, 
  FiTrash2, 
  FiStar,
  FiShoppingBag,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async (currentPage = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery,
          all: 'true'
        }
      });
      if (data.success) {
        setProducts(data.data.products || []);
        setTotal(data.data.total || 0);
        setPage(data.data.page || 1);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Erro ao carregar lista de produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, search);
  }, [page, search]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleToggleActive = async (product) => {
    try {
      const { data } = await api.patch(`/products/${product.id}/toggle`);
      if (data.success) {
        toast.success(`Produto ${product.active ? 'desativado' : 'ativado'} com sucesso!`);
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, active: !p.active } : p
        ));
      }
    } catch (err) {
      toast.error('Erro ao alternar status do produto');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await api.post(`/products/${id}/duplicate`);
      if (data.success) {
        toast.success('Produto duplicado com sucesso!');
        fetchProducts(page, search); // Refresh
      }
    } catch (err) {
      toast.error('Erro ao duplicar produto');
    }
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/products/${selectedProduct.id}`);
      if (data.success) {
        toast.success('Produto excluído com sucesso!');
        setDeleteModalOpen(false);
        fetchProducts(page, search); // Refresh
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir produto');
    } finally {
      setDeleteLoading(false);
      setSelectedProduct(null);
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const columns = [
    {
      key: 'mainImage',
      label: 'Imagem',
      render: (row) => {
        const imageUrl = row.mainImage ? `${baseUrl}${row.mainImage}` : '';
        return (
          <div className="w-10 h-10 rounded bg-dark-700 overflow-hidden border border-dark-600 flex items-center justify-center p-1">
            {imageUrl ? (
              <img src={imageUrl} alt={row.name} className="w-full h-full object-contain" />
            ) : (
              <FiShoppingBag className="w-4 h-4 text-text-muted" />
            )}
          </div>
        );
      }
    },
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <div className="max-w-[200px] sm:max-w-xs font-semibold text-white truncate" title={row.name}>
          {row.name}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (row) => (
        <span className="text-secondary text-xs font-medium">
          {row.category?.name || 'Sem Categoria'}
        </span>
      )
    },
    {
      key: 'brand',
      label: 'Marca',
      render: (row) => (
        <span className="text-primary text-xs font-medium">
          {row.brand?.name || 'Sem Marca'}
        </span>
      )
    },
    {
      key: 'salePrice',
      label: 'Preço Venda',
      render: (row) => (
        <div className="font-bold text-white">
          {row.promoPrice ? (
            <div className="space-y-0.5">
              <div className="text-xs text-text-muted line-through">{formatCurrency(row.salePrice)}</div>
              <div className="text-success">{formatCurrency(row.promoPrice)}</div>
            </div>
          ) : (
            <span>{formatCurrency(row.salePrice)}</span>
          )}
        </div>
      )
    },
    {
      key: 'commissionValue',
      label: 'Comissão',
      render: (row) => (
        <span className="font-bold text-emerald-400">
          {row.commissionValue ? formatCurrency(row.commissionValue) : '—'}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Estoque',
      render: (row) => (
        <span className={`font-bold ${row.stock <= 0 ? 'text-danger' : row.stock < 5 ? 'text-warning' : 'text-success'}`}>
          {row.stock} un
        </span>
      )
    },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
          row.active 
            ? 'bg-success/15 border-success/35 text-success' 
            : 'bg-dark-600 border-dark-500 text-text-muted'
        }`}>
          {row.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'featured',
      label: 'Destaque',
      render: (row) => (
        <FiStar className={`w-4 h-4 ${row.featured ? 'text-amber-400 fill-amber-400' : 'text-text-muted'}`} />
      )
    }
  ];

  const renderActions = (row) => (
    <>
      {/* Toggle active status */}
      <button
        onClick={() => handleToggleActive(row)}
        title={row.active ? 'Desativar produto' : 'Ativar produto'}
        className={`p-2 rounded-lg border transition-colors ${
          row.active 
            ? 'border-success/30 hover:bg-success/10 text-success' 
            : 'border-dark-600 hover:bg-dark-750 text-text-secondary'
        }`}
      >
        {row.active ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
      </button>

      {/* Duplicate */}
      <button
        onClick={() => handleDuplicate(row.id)}
        title="Duplicar produto"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-primary/30 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-text-secondary"
      >
        <FiCopy className="w-4 h-4" />
      </button>

      {/* Edit */}
      <Link
        to={`/admin/produtos/editar/${row.id}`}
        title="Editar produto"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-text-secondary inline-block"
      >
        <FiEdit className="w-4 h-4" />
      </Link>

      {/* Delete */}
      <button
        onClick={() => handleDeleteClick(row)}
        title="Excluir produto"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-danger/30 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors text-text-secondary"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="space-y-6 text-white">
      <Helmet>
        <title>Produtos - Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Produtos</h1>
          <p className="text-text-secondary text-sm">
            Total de {total} produtos cadastrados no sistema.
          </p>
        </div>

        <Link
          to="/admin/produtos/novo"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Novo Produto
        </Link>
      </div>

      {/* Products table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Buscar por nome, marca ou categoria..."
        actions={renderActions}
        emptyMessage="Nenhum produto cadastrado."
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: handlePageChange
        }}
      />

      {/* Confirmation Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Produto"
        size="sm"
      >
        <div className="space-y-4 text-white">
          <p className="text-sm text-text-secondary leading-relaxed">
            Tem certeza que deseja excluir o produto <span className="font-bold text-white">"{selectedProduct?.name}"</span>? Esta ação é irreversível e pode afetar históricos de vendas vinculados.
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
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
