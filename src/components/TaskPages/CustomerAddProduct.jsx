import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAllProductCatalog, 
  updateOrderProducts,
  deleteOrderProducts,
  getOrderRequest,
  getProductByCode,
  getProductsByBbk  // Yeni BBK ile ürün getirme fonksiyonu
} from '../../services/productService';
import '../../styles/FormStyles.css';
import { sendMessage } from '../../services/taskService';
import { ChevronDown, ChevronUp, Trash2, ShoppingCart, X, AlertCircle, Info, Plus, Wifi } from 'lucide-react';
import { getMaxSpeedInfo } from '../../services/infrastructureService'; // Yeni eklenecek servis

// Ürün Detayları Popup Bileşeni
const ProductDetailModal = ({ product, onClose }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        if (product?.code) {
          const response = await getProductByCode(product.code);
          setProductDetails(response.data);
        }
      } catch (error) {
        console.error("Ürün detayları getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  if (!product) return null;

  return (
    <div className="product-detail-modal-backdrop" onClick={onClose}>
      <div className="product-detail-content" onClick={e => e.stopPropagation()}>
        <div className="product-detail-header">
          <h2>{product.name}</h2>
          <button className="product-detail-close" onClick={onClose}>&times;</button>
        </div>
        <div className="product-detail-body">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="product-info-section">
                <h3>Ürün Bilgileri</h3>
                <div className="product-info-grid">
                  <div className="product-attribute">
                    <div className="product-attribute-name">Ürün Kodu</div>
                    <div className="product-attribute-value">{productDetails?.code || product.code}</div>
                  </div>
                  <div className="product-attribute">
                    <div className="product-attribute-name">Ürün Adı</div>
                    <div className="product-attribute-value">{productDetails?.name || product.name}</div>
                  </div>
                  {productDetails?.productConfType && (
                    <div className="product-attribute">
                      <div className="product-attribute-name">Konfigürasyon Tipi</div>
                      <div className="product-attribute-value">{productDetails.productConfType}</div>
                    </div>
                  )}
                </div>
              </div>

              {productDetails?.specifications && productDetails.specifications.length > 0 && (
                <div className="characteristics-section">
                  <h3>Özellikler</h3>
                  {productDetails.specifications.map(spec => (
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
            </>
          )}
        </div>
        <div className="product-detail-footer">
          <button
            className="add-to-cart-button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={16} /> Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// Maksimum Hız Bilgisi Bileşeni
const MaxSpeedInfo = ({ speedInfo }) => {
  if (!speedInfo) return null;

  const hasVdsl = speedInfo.vdsl !== undefined;
  const hasAdsl = speedInfo.adsl !== undefined;
  const speedValue = hasVdsl ? speedInfo.vdsl : (hasAdsl ? speedInfo.adsl : null);
  const speedType = hasVdsl ? 'VDSL' : (hasAdsl ? 'ADSL' : '');

  if (speedValue === null) return null;

  return (
    <div className="max-speed-info">
      <div className="max-speed-header">
        <Wifi size={18} />
        <h3>Adresinizde Mevcut İnternet Altyapısı</h3>
      </div>
      <div className="max-speed-content">
        <div className="speed-type">{speedType}</div>
        <div className="speed-value">{speedValue} Mbps</div>
        <div className="speed-description">
          Bu lokasyonda alabileceğiniz maksimum internet hızı
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <div className="product-card">
      <div className="product-card-header" onClick={() => onViewDetails(product)}>
        <h3>{product.name}</h3>
        <div className="product-details-icon">
          <Info size={18} />
        </div>
      </div>
      
      <button 
        className="add-to-cart-button"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
      >
        <Plus size={16} /> Sepete Ekle
      </button>
    </div>
  );
};

const CartItem = ({ product, onRemove, onViewDetails }) => {
  return (
    <div className="cart-item">
      <div className="cart-item-content" onClick={() => onViewDetails(product)}>
        <h4>{product.name}</h4>
        <div className="cart-item-characteristics">
          {product.characteristics && product.characteristics.slice(0, 2).map(char => (
            <div key={char.id} className="characteristic">
              <strong>{char.name}:</strong> {char.value}
            </div>
          ))}
        </div>
      </div>
      <button 
        className="remove-from-cart-button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(product);
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const CustomerAddProduct = ({ onComplete, orderData, loading, onGoBack }) => {
  const [products, setProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bbk, setBbk] = useState(null);
  const [maxSpeedInfo, setMaxSpeedInfo] = useState(null);
  const [usingBbkProducts, setUsingBbkProducts] = useState(false);

  // Sipariş detaylarını getiren ve güncelleyen fonksiyon
  const fetchOrderDetails = useCallback(async () => {
    try {
      if (orderData?.data?.orderRequestId) {
        const orderRequest = await getOrderRequest(orderData.data.orderRequestId);
        console.log('Order Request Details:', orderRequest.data);
        setOrderDetails(orderRequest.data.baseOrder);
        
        // BBK bilgisini al
        if (orderRequest.data?.baseOrder?.engagedParty?.address?.bbk) {
          const bbkValue = orderRequest.data.baseOrder.engagedParty.address.bbk;
          setBbk(bbkValue);
          
          // BBK ile ürünleri getir
          await fetchProductsByBbk(bbkValue);
          
          // BBK ile maksimum hız bilgisini getir
          await fetchMaxSpeedInfo(bbkValue);
        }
      }
    } catch (err) {
      setError('Sipariş detayları yüklenirken bir hata oluştu: ' + err.message);
    }
  }, [orderData]);

  // BBK ile ürünleri getir
  const fetchProductsByBbk = async (bbkValue) => {
    try {
      setLocalLoading(true);
      const response = await getProductsByBbk(bbkValue);
      if (response.data && response.data.length > 0) {
        setProducts(response.data);
        setUsingBbkProducts(true);
      } else {
        // BBK'ya göre ürün bulunamazsa tüm ürünleri getir
        const allProducts = await getAllProductCatalog();
        setProducts(allProducts.data || []);
        setUsingBbkProducts(false);
      }
    } catch (err) {
      console.error('BBK ile ürün getirme hatası:', err);
      // Hata durumunda tüm ürünleri getir
      const allProducts = await getAllProductCatalog();
      setProducts(allProducts.data || []);
      setUsingBbkProducts(false);
    } finally {
      setLocalLoading(false);
    }
  };

  // BBK ile maksimum hız bilgisini getir
  const fetchMaxSpeedInfo = async (bbkValue) => {
    try {
      const speedInfo = await getMaxSpeedInfo(bbkValue);
      if (speedInfo && speedInfo.data) {
        setMaxSpeedInfo(speedInfo.data);
      }
    } catch (err) {
      console.error('Maksimum hız bilgisi getirme hatası:', err);
    }
  };

  // İlk yükleme ve ürün ekleme/silme sonrası çalışacak
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLocalLoading(true);
        await fetchOrderDetails();
        
        // BBK yoksa veya BBK ürünleri getirilemezse tüm ürünleri getir
        if (!usingBbkProducts && products.length === 0) {
          const productCatalog = await getAllProductCatalog();
          setProducts(productCatalog.data || []);
        }
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu: ' + err.message);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchData();
  }, [fetchOrderDetails, usingBbkProducts, products.length]);

  // Ürün ekleme
  const handleProductAdd = async (product) => {
    try {
      setLocalLoading(true);
      const orderRequestId = orderData?.data?.orderRequestId;
      
      if (!orderRequestId) {
        throw new Error('Order Request ID bulunamadı');
      }

      await updateOrderProducts(orderRequestId, product.code);
      await fetchOrderDetails(); // Sepeti güncellemek için
      setError(null); // Başarılı işlem sonrası hata mesajını temizle
    } catch (err) {
      setError('Ürün güncelleme hatası: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Ürün silme
  const handleProductRemove = async (product) => {
    try {
      setLocalLoading(true);
      const orderRequestId = orderData?.data?.orderRequestId;
      
      if (!orderRequestId) {
        throw new Error('Order Request ID bulunamadı');
      }

      await deleteOrderProducts(orderRequestId, product.mainProductCode);
      await fetchOrderDetails(); // Sepeti güncellemek için
      setError(null); // Başarılı işlem sonrası hata mesajını temizle
    } catch (err) {
      setError('Ürün silme hatası: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Önceki adıma dönme
  const handleGoBack = async () => {
    try {
      setLocalLoading(true);
      const processInstanceId = orderData?.data?.processInstanceId;
      
      if (!processInstanceId) {
        console.error('Process Instance ID bulunamadı');
        return;
      }
      
      const messageResponse = await sendMessage(processInstanceId, "backToReview");
      
      if (onGoBack) {
        onGoBack();
      }
    } catch (error) {
      console.error('Önceki adıma dönme hatası:', error);
      setError('Önceki adıma dönülürken bir hata oluştu');
    } finally {
      setLocalLoading(false);
    }
  };

  // Ürün detaylarını görüntüleme
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  // Ürün detay modalını kapat
  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="product-selection-container">
      {(loading || localLoading) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Maksimum hız bilgisi */}
      {maxSpeedInfo && <MaxSpeedInfo speedInfo={maxSpeedInfo} />}
      
      <div className="product-selection-grid">
        <div className="product-catalog">
          <h2>
            Ürün Kataloğu
            {usingBbkProducts && bbk && (
              <span className="bbk-products-note"> (BBK: {bbk})</span>
            )}
          </h2>
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div className="product-grid">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleProductAdd}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <div className="empty-cart">
                <p>Ürün kataloğu yükleniyor veya ürün bulunamadı</p>
              </div>
            )}
          </div>
        </div>

        <div className="cart-section">
          <h2>
            <ShoppingCart size={20} /> Sepet 
            {orderDetails?.products?.length > 0 && 
              <span className="cart-count">({orderDetails.products.length})</span>
            }
          </h2>
          
          {orderDetails?.products && orderDetails.products.length > 0 ? (
            <div className="cart-items">
              {orderDetails.products.map(product => (
                <CartItem 
                  key={product.id} 
                  product={product} 
                  onRemove={handleProductRemove}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="empty-cart">
              <p>Sepetiniz henüz boş</p>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="secondary-button"
          onClick={handleGoBack}
          disabled={loading || localLoading}
        >
          {localLoading ? 'İşlem yapılıyor...' : 'Geri Dön'}
        </button>
        
        <button 
          type="button" 
          className="primary-button"
          onClick={() => onComplete(orderDetails?.products || [])}
          disabled={loading || localLoading || !orderDetails?.products?.length}
        >
          {loading || localLoading ? 'İşlem yapılıyor...' : 'Devam Et'}
        </button>
      </div>

      {/* Ürün Detay Modalı */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeProductDetail} 
        />
      )}
    </div>
  );
};

export default CustomerAddProduct;