import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiAward,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import api from '../../api/axios';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [active, setActive] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete Confirmation States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/brands');
      if (data.success) {
        setBrands(data.data || []);
      }
    } catch (err) {
      toast.error('Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenAddModal = () => {
    setEditBrand(null);
    setName('');
    setLogo('');
    setActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (brand) => {
    setEditBrand(brand);
    setName(brand.name || '');
    setLogo(brand.logo || '');
    setActive(brand.active !== undefined ? !!brand.active : true);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Nome da marca é obrigatório');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = { name, logo, active };
      if (editBrand) {
        // Edit brand
        const { data } = await api.put(`/brands/${editBrand.id}`, payload);
        if (data.success) {
          toast.success('Marca atualizada com sucesso!');
        }
      } else {
        // Add brand
        const { data } = await api.post('/brands', payload);
        if (data.success) {
          toast.success('Marca criada com sucesso!');
        }
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar marca');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (brand) => {
    try {
      const nextActiveState = !brand.active;
      const { data } = await api.put(`/brands/${brand.id}`, {
        active: nextActiveState
      });
      if (data.success) {
        toast.success(`Marca ${nextActiveState ? 'ativada' : 'desativada'} com sucesso!`);
        setBrands(prev => prev.map(b => 
          b.id === brand.id ? { ...b, active: nextActiveState } : b
        ));
      }
    } catch (err) {
      toast.error('Erro ao atualizar status da marca');
    }
  };

  const handleDeleteClick = (brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/brands/${selectedBrand.id}`);
      if (data.success) {
        toast.success('Marca excluída com sucesso!');
        setDeleteModalOpen(false);
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir marca');
    } finally {
      setDeleteLoading(false);
      setSelectedBrand(null);
    }
  };

  const columns = [
    {
      key: 'logo',
      label: 'Logo/Ícone',
      render: (row) => (
        <span className="text-xl inline-block bg-dark-700 w-10 h-10 rounded-xl flex items-center justify-center border border-dark-600 font-bold text-secondary">
          {row.logo ? (
            row.logo.length <= 3 ? row.logo : <span className="text-xs">{row.name.substring(0, 3)}</span>
          ) : (
            <FiAward className="w-5 h-5 opacity-40" />
          )}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <span className="font-bold text-white text-base">
          {row.name}
        </span>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (row) => (
        <span className="text-xs font-mono text-text-secondary bg-dark-900 px-2 py-1 rounded">
          {row.slug}
        </span>
      )
    },
    {
      key: 'productsCount',
      label: 'Produtos Vinculados',
      render: (row) => (
        <span className="font-semibold text-white">
          {row._count?.products !== undefined ? row._count.products : 0} un
        </span>
      )
    },
    {
      key: 'active',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
          row.active !== false 
            ? 'bg-success/15 border-success/35 text-success' 
            : 'bg-dark-600 border-dark-500 text-text-muted'
        }`}>
          {row.active !== false ? 'Ativa' : 'Inativa'}
        </span>
      )
    }
  ];

  const renderActions = (row) => (
    <>
      <button
        onClick={() => handleToggleActive(row)}
        title={row.active !== false ? 'Desativar marca' : 'Ativar marca'}
        className={`p-2 rounded-lg border transition-colors ${
          row.active !== false 
            ? 'border-success/30 hover:bg-success/10 text-success' 
            : 'border-dark-600 hover:bg-dark-750 text-text-secondary'
        }`}
      >
        {row.active !== false ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
      </button>

      <button
        onClick={() => handleOpenEditModal(row)}
        title="Editar marca"
        className="p-2 bg-dark-700 border border-dark-600 hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-text-secondary"
      >
        <FiEdit className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleDeleteClick(row)}
        disabled={row._count?.products > 0}
        title={row._count?.products > 0 ? 'Não é possível excluir com produtos vinculados' : 'Excluir marca'}
        className={`p-2 bg-dark-700 border rounded-lg transition-colors ${
          row._count?.products > 0
            ? 'border-dark-600 text-text-muted cursor-not-allowed opacity-55'
            : 'border-dark-600 hover:border-danger/30 hover:bg-danger/10 hover:text-danger text-text-secondary'
        }`}
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto">
      <Helmet>
        <title>Marcas - Admin</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Marcas</h1>
          <p className="text-text-secondary text-sm">
            Adicione e gerencie os fabricantes e marcas dos produtos do catálogo.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Nova Marca
        </button>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        loading={loading}
        actions={renderActions}
        emptyMessage="Nenhuma marca cadastrada."
      />

      {/* Form Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editBrand ? 'Editar Marca' : 'Nova Marca'}
        size="sm"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 text-white">
          <div className="space-y-2">
            <label htmlFor="brandName" className="text-xs font-semibold text-text-secondary block">Nome da Marca *</label>
            <input
              id="brandName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Apple, Xiaomi, JBL"
              className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brandLogo" className="text-xs font-semibold text-text-secondary block">Logo (Texto ou Sigla Curta)</label>
            <input
              id="brandLogo"
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="Ex: AP, XI, JBL ou emoji"
              className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center justify-between border-t border-dark-600 pt-4">
            <div>
              <span className="text-sm font-semibold block">Visibilidade</span>
              <span className="text-[10px] text-text-secondary">Visível no menu de filtros na loja</span>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={() => setActive(!active)}
              className="rounded bg-dark-900 border-dark-600 text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saveLoading}
              className="px-4 py-2 rounded-lg font-semibold shadow"
            >
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Marca"
        size="sm"
      >
        <div className="space-y-4 text-white">
          <p className="text-sm text-text-secondary leading-relaxed">
            Deseja realmente excluir a marca <span className="font-bold text-white">"{selectedBrand?.name}"</span>? Esta ação não poderá ser desfeita.
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
