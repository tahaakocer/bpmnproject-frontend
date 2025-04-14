import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, Plus, AlertCircle, CheckCircle, X, Info } from 'lucide-react';
import '../styles/ProductListStyles.css';
import { 
  getAllProductCatalog, 
  searchProductCatalog, 
  deleteProductByCode,
  getProductByCode
} from '../services/productService';

const ProductDetail = ({ product, onClose }) => {
  if (!product) return null;

  // Basit bilgiler
  const basicInfo = [
    { name: 'Ürün Kodu', value: product.code },
    { name: 'Ürün Adı', value: product.name },
    { name: 'Konfigürasyon Tipi', value: product.productConfType },
    { name: 'Oluşturma Tarihi', value: new Date(product.createDate).toLocaleString('tr-TR') },
    { name: 'Güncelleme Tarihi', value: new Date(product.updateDate).toLocaleString('tr-TR') },
    { name: 'Oluşturan', value: product.createdBy },
    { name: 'Son Düzenleyen', value: product.lastModifiedBy }
  ];

  return (
    <div className="product-detail-modal-backdrop" onClick={onClose}>
      <div className="product-detail-content" onClick={e => e.stopPropagation()}>
        <div className="product-detail-header">
          <h2>{product.name}</h2>
          <button className="product-detail-close" onClick={onClose}>&times;</button>
        </div>
        <div className="product-detail-body">
          <div className="product-info-section">
            <h3>Ürün Bilgileri</h3>
            <div className="product-info-grid">
              {basicInfo.map((info, index) => (
                <div className="product-attribute" key={index}>
                  <div className="product-attribute-name">{info.name}</div>
                  <div className="product-attribute-value">{info.value}</div>
                </div>
              ))}
            </div>
            <div className="tag tag-common">{product.productConfType}</div>
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div className="characteristics-section">
              <h3>Özellikler</h3>
              {product.specifications.map(spec => (
                <div key={spec.id} className="specification-section">
                  <h4>{spec.code}</h4>
                  {spec.characteristics && spec.characteristics.map(char => (
                    <div key={char.id} className="characteristic-card">
                      <div className="characteristic-header">
                        <span className="characteristic-name">{char.name}</span>
                        <span className="characteristic-value">{char.value}</span>
                      </div>
                      <div className="characteristic-code">Kod: {char.code}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Ürünleri getir
  useEffect(() => {
    fetchProducts();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchProducts(searchQuery);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProductCatalog();
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error) {
      console.error('Ürünleri getirme hatası:', error);
      showNotification('error', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    try {
      if (query.length < 2) return;
      
      const response = await searchProductCatalog(query);
      setFilteredProducts(response.data || []);
    } catch (error) {
      console.error('Ürün arama hatası:', error);
      showNotification('error', 'Ürün araması sırasında bir hata oluştu');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductByCode(productToDelete.code);
      
      // Ürün listesini güncelle
      setProducts(products.filter(p => p.code !== productToDelete.code));
      showNotification('success', `${productToDelete.name} ürünü başarıyla silindi`);
      closeDeleteModal();
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      showNotification('error', 'Ürün silinirken bir hata oluştu');
    }
  };

  const handleProductClick = async (product) => {
    try {
      setDetailLoading(true);
      const response = await getProductByCode(product.code);
      setSelectedProduct(response.data);
    } catch (error) {
      console.error('Ürün detayları getirme hatası:', error);
      showNotification('error', 'Ürün detayları yüklenirken bir hata oluştu');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleCloseNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  return (
    <div className="product-list-container">
      {notification.show && (
        <div className={`notification ${notification.type === 'success' ? 'success-notification' : 'error-notification'}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={handleCloseNotification}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="product-list-header">
        <h2 className="product-list-title">Ürün Listesi</h2>
        <div className="product-list-actions">
          <Link to="/urun-ekle" className="primary-button">
            <Plus size={16} /> Yeni Ürün Ekle
          </Link>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Search className="search-icon" size={20} />
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              <h3>{product.name}</h3>
              <div className="product-code">Kod: {product.code}</div>
              <div className="product-actions">
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(product);
                  }}
                >
                  <Trash2 size={16} /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products-message">
          {searchQuery.length > 0 
            ? "Arama kriterlerine uygun ürün bulunamadı." 
            : "Henüz bir ürün bulunmuyor. Yeni bir ürün ekleyin."
          }
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ürünü Sil</h3>
              <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>{productToDelete?.name}</strong> ürününü silmek istediğinizden emin misiniz?
              </p>
              <p>Bu işlem geri alınamaz.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-button" onClick={closeDeleteModal}>İptal</button>
              <button className="modal-delete-button" onClick={handleDeleteProduct}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Detay Modalı */}
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={closeProductDetail} />
      )}
    </div>
  );
};

export default ProductList;