import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiUpload, 
  FiPlus, 
  FiTrash2, 
  FiCheckCircle, 
  FiX, 
  FiImage 
} from 'react-icons/fi';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [commissionValue, setCommissionValue] = useState('');
  const [stock, setStock] = useState('0');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Main Image Upload
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');

  // Gallery Images Upload
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Specifications state: list of { key, value }
  const [specList, setSpecList] = useState([]);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function loadFormMetadata() {
      setLoading(true);
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);

        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (brandRes.data.success) setBrands(brandRes.data.data || []);

        if (isEditMode) {
          const { data } = await api.get(`/products/id/${id}`);
          if (data.success) {
            const product = data.data;
            setName(product.name || '');
            setDescription(product.description || '');
            setCategoryId(String(product.categoryId || ''));
            setBrandId(String(product.brandId || ''));
            setPurchasePrice(String(product.purchasePrice || ''));
            setSalePrice(String(product.salePrice || ''));
            setPromoPrice(product.promoPrice ? String(product.promoPrice) : '');
            setCommissionValue(product.commissionValue ? String(product.commissionValue) : '');
            setStock(String(product.stock || 0));
            setFeatured(!!product.featured);
            setActive(!!product.active);
            setMetaTitle(product.metaTitle || '');
            setMetaDescription(product.metaDescription || '');
            
            if (product.mainImage) {
              setMainImagePreview(`${baseUrl}${product.mainImage}`);
            }

            setExistingGallery(product.images || []);

            // Specs parse
            if (product.specifications) {
              const parsedSpecs = typeof product.specifications === 'string'
                ? JSON.parse(product.specifications)
                : product.specifications;
              
              if (parsedSpecs && typeof parsedSpecs === 'object') {
                const list = Object.entries(parsedSpecs).map(([key, value]) => ({
                  key,
                  value: String(value)
                }));
                setSpecList(list);
              }
            }
          }
        }
      } catch (err) {
        toast.error('Erro ao carregar dados do formulário');
        navigate('/admin/produtos');
      } finally {
        setLoading(false);
      }
    }

    loadFormMetadata();
  }, [id, isEditMode, navigate, baseUrl]);

  // Spec handlers
  const handleAddSpec = () => {
    setSpecList(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx) => {
    setSpecList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx, field, value) => {
    setSpecList(prev => prev.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  // Main Image selection
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Gallery selection
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveGalleryPreview = (idx) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteExistingGalleryImage = async (imageId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem da galeria?')) return;
    try {
      const { data } = await api.delete(`/products/${id}/images/${imageId}`);
      if (data.success) {
        setExistingGallery(prev => prev.filter(img => img.id !== imageId));
        toast.success('Imagem removida da galeria!');
      }
    } catch (err) {
      toast.error('Erro ao remover imagem da galeria');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryId || !brandId || !purchasePrice || !salePrice) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaveLoading(true);

    // Format specifications to JSON string
    const specificationsObj = {};
    specList.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('brandId', brandId);
    formData.append('purchasePrice', purchasePrice);
    formData.append('salePrice', salePrice);
    formData.append('promoPrice', promoPrice);
    formData.append('commissionValue', commissionValue);
    formData.append('stock', stock);
    formData.append('featured', String(featured));
    formData.append('active', String(active));
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);
    formData.append('specifications', JSON.stringify(specificationsObj));

    if (mainImageFile) {
      formData.append('image', mainImageFile);
    }

    try {
      let productId = id;
      if (isEditMode) {
        await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { data } = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        productId = data.data.id;
        toast.success('Produto criado com sucesso!');
      }

      // If new gallery images are selected, upload them now
      if (galleryFiles.length > 0 && productId) {
        setGalleryLoading(true);
        const galleryData = new FormData();
        galleryFiles.forEach(file => {
          galleryData.append('images', file);
        });

        await api.post(`/products/${productId}/images`, galleryData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Galeria de imagens enviada!');
      }

      navigate('/admin/produtos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaveLoading(false);
      setGalleryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto">
      <Helmet>
        <title>{isEditMode ? 'Editar Produto' : 'Novo Produto'} - Admin</title>
      </Helmet>

      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/produtos" 
          className="p-2 bg-dark-800 border border-dark-600 rounded-lg text-text-secondary hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isEditMode ? 'Editar Produto' : 'Cadastrar Produto'}
          </h1>
          <p className="text-text-secondary text-sm">
            {isEditMode ? 'Modifique os detalhes do produto cadastrado' : 'Insira as informações para cadastrar um novo produto'}
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Basic Information */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold border-b border-dark-600 pb-2 mb-2">Informações Básicas</h3>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold text-text-secondary block">Nome do Produto *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: iPhone 15 Pro Max 256GB"
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-xs font-semibold text-text-secondary block">Categoria *</label>
                  <select
                    id="category"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="brand" className="text-xs font-semibold text-text-secondary block">Marca *</label>
                  <select
                    id="brand"
                    required
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Selecione...</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-text-secondary block">Descrição</label>
                <textarea
                  id="description"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escreva detalhes e especificações gerais..."
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* Price & Stock */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold border-b border-dark-600 pb-2 mb-2">Preço e Estoque</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="purchasePrice" className="text-xs font-semibold text-text-secondary block">Preço Compra (R$) *</label>
                  <input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="salePrice" className="text-xs font-semibold text-text-secondary block">Preço Venda (R$) *</label>
                  <input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="promoPrice" className="text-xs font-semibold text-text-secondary block">Preço Promoção (R$)</label>
                  <input
                    id="promoPrice"
                    type="number"
                    step="0.01"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="commissionValue" className="text-xs font-semibold text-text-secondary block">Comissão Venda (R$)</label>
                  <input
                    id="commissionValue"
                    type="number"
                    step="0.01"
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="stock" className="text-xs font-semibold text-text-secondary block">Estoque Inicial</label>
                  <input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Specifications Key-Value */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-dark-600 pb-2 mb-2">
                <h3 className="text-lg font-bold">Ficha Técnica</h3>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <FiPlus /> Adicionar Linha
                </button>
              </div>

              {specList.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">Nenhuma especificação técnica definida para este produto.</p>
              ) : (
                <div className="space-y-3">
                  {specList.map((spec, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Ex: Resolução"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        className="flex-1 bg-dark-900 border border-dark-600 rounded-xl py-2 px-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Ex: 4K Ultra HD"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-dark-900 border border-dark-600 rounded-xl py-2 px-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-2 bg-dark-800 border border-dark-600 hover:border-danger hover:text-danger rounded-lg transition-colors text-text-secondary"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEO Section */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-lg font-bold border-b border-dark-600 pb-2 mb-2">SEO (Opcional)</h3>
              
              <div className="space-y-2">
                <label htmlFor="metaTitle" className="text-xs font-semibold text-text-secondary block">Meta Title</label>
                <input
                  id="metaTitle"
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Título para buscadores (Google)"
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-2.5 px-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="metaDescription" className="text-xs font-semibold text-text-secondary block">Meta Description</label>
                <textarea
                  id="metaDescription"
                  rows="2"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Resumo curto para o snippet do Google..."
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Settings & Uploads */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status / Featured Settings */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-base font-bold border-b border-dark-600 pb-2">Status & Destaque</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold block">Visibilidade</span>
                  <span className="text-[10px] text-text-secondary">Disponível no catálogo público</span>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => setActive(!active)}
                  className="rounded bg-dark-900 border-dark-600 text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-dark-600 pt-3">
                <div>
                  <span className="text-sm font-semibold block">Produto Destaque</span>
                  <span className="text-[10px] text-text-secondary">Banner inicial e topo</span>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={() => setFeatured(!featured)}
                  className="rounded bg-dark-900 border-dark-600 text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer"
                />
              </div>
            </div>

            {/* Main Image Upload Box */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-base font-bold border-b border-dark-600 pb-2">Imagem Principal</h3>
              
              <div className="flex flex-col items-center justify-center">
                {mainImagePreview ? (
                  <div className="relative w-full aspect-square bg-dark-900 border border-dark-600 rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center">
                    <img src={mainImagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setMainImageFile(null);
                        setMainImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-danger rounded-lg transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full aspect-square bg-dark-900 border border-dashed border-dark-500 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary hover:bg-dark-800/40 transition-all mb-4">
                    <FiUpload className="w-8 h-8 text-text-muted mb-2" />
                    <span className="text-xs font-semibold">Selecione uma Imagem</span>
                    <span className="text-[10px] text-text-secondary mt-1">JPEG, PNG ou WebP de até 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Images Box */}
            <div className="glass-card p-6 border border-dark-600 rounded-2xl space-y-4">
              <h3 className="text-base font-bold border-b border-dark-600 pb-2">Galeria de Imagens</h3>
              
              {/* Existing Gallery Images (only edit mode) */}
              {isEditMode && existingGallery.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary block">Imagens Existentes:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {existingGallery.map(img => (
                      <div key={img.id} className="relative aspect-square bg-dark-950 rounded-lg overflow-hidden border border-dark-600 p-1 flex items-center justify-center">
                        <img src={`${baseUrl}${img.url}`} alt="Galeria" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingGalleryImage(img.id)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-danger rounded-full transition-colors"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Gallery Images */}
              <div className="space-y-4">
                <label className="w-full py-3 bg-dark-900 border border-dashed border-dark-500 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-dark-800/40 transition-all text-center">
                  <FiImage className="w-6 h-6 text-text-muted mb-1" />
                  <span className="text-xs font-semibold">Adicionar à Galeria</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                </label>

                {galleryPreviews.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase text-text-secondary block">Novas Imagens Adicionadas:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {galleryPreviews.map((url, idx) => (
                        <div key={idx} className="relative aspect-square bg-dark-950 rounded-lg overflow-hidden border border-dark-600 p-1 flex items-center justify-center">
                          <img src={url} alt="Nova galeria preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryPreview(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-danger rounded-full transition-colors"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 border-t border-dark-600 pt-6">
          <Link
            to="/admin/produtos"
            className="btn-secondary px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            Cancelar
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={saveLoading || galleryLoading}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20"
          >
            {isEditMode ? 'Salvar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
