import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getProductByCode } from '../services/productService';

const ProductDetailModal = ({ productCode, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await getProductByCode(productCode);
        setProduct(response.data);
      } catch (error) {
        console.error('Ürün detayları getirilirken hata oluştu:', error);
        setError('Ürün detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    if (productCode) {
      fetchProductDetails();
    }
  }, [productCode]);

  // Modal dışına tıklanınca kapatma
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC tuşuna basınca kapatma
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  // Scroll'u engelleme
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (loading) {
    return (
      <div className="product-detail-modal" onClick={handleBackdropClick}>
        <div className="product-detail-content" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '20px' }}>Ürün detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-modal" onClick={handleBackdropClick}>
        <div className="product-detail-content" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--error-color)' }}>Hata</h3>
          <p>{error}</p>
          <button className="primary-button" onClick={onClose} style={{ marginTop: '20px' }}>
            Kapat
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="product-detail-modal" onClick={handleBackdropClick}>
      <div className="product-detail-content">
        <div className="product-detail-header">
          <div>
            <h2 className="product-detail-title">{product.name}</h2>
            <div className="product-detail-subtitle">Kod: {product.code}</div>
          </div>
          <button className="product-detail-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="product-detail-body">
          <div className="product-detail-info">
            <div className="product-info-item">
              <div className="product-info-label">Oluşturulma Tarihi:</div>
              <div className="product-info-value">
                {new Date(product.createDate).toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">Son Güncelleme:</div>
              <div className="product-info-value">
                {new Date(product.updateDate).toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">Oluşturan:</div>
              <div className="product-info-value">{product.createdBy}</div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">Son Güncelleyen:</div>
              <div className="product-info-value">{product.lastModifiedBy}</div>
            </div>
            <div className="product-info-item">
              <div className="product-info-label">Konfigürasyon Tipi:</div>
              <div className="product-info-value">{product.productConfType}</div>
            </div>
          </div>

          <h3>Özellikler</h3>
          <div className="specifications-section">
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec) => (
                <div key={spec.id} className="specification-card">
                  <div className="specification-header">
                    <h4 className="specification-title">Specification</h4>
                    <div className="specification-code">{spec.code}</div>
                  </div>

                  {spec.characteristics && spec.characteristics.length > 0 ? (
                    <table className="characteristics-table">
                      <thead>
                        <tr>
                          <th>Özellik</th>
                          <th>Değer</th>
                          <th>Kod</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spec.characteristics.map((char) => (
                          <tr key={char.id}>
                            <td className="characteristic-name">{char.name}</td>
                            <td>{char.value}</td>
                            <td>{char.code}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Bu özelliğe ait karakteristikler bulunmamaktadır.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="no-specifications">Bu ürüne ait özellik bulunmamaktadır.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;