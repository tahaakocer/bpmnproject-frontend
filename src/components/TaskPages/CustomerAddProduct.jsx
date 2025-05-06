import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAllProductCatalog, 
  updateOrderProducts,
  deleteOrderProducts,
  getOrderRequest,
  getProductByCode,
  getProductsByBbk
} from '../../services/productService';
import { getAddonsForMainProduct } from '../../services/addonService';
import '../../styles/FormStyles.css';
import '../../styles/CommonStyles.css';
import { sendMessage } from '../../services/taskService';
import { ChevronDown, ChevronUp, Trash2, ShoppingCart, X, AlertCircle, Info, Plus, Wifi, CheckCircle } from 'lucide-react';
import { getMaxSpeedInfo } from '../../services/infrastructureService';

// Ürün Detayları Popup Bileşeni
const ProductDetailModal = ({ product, onClose }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addonLoading, setAddonLoading] = useState(true);

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

    const fetchAddons = async () => {
      try {
        setAddonLoading(true);
        if (product?.id) {
          const response = await getAddonsForMainProduct(product.id);
          setAddons(response.data || []);
        }
      } catch (error) {
        console.error("Addon getirme hatası:", error);
      } finally {
        setAddonLoading(false);
      }
    };

    fetchProductDetails();
    fetchAddons();
  }, [product]);

  if (!product) return null;

  return (
    <div className="product-detail-modal-backdrop" onClick={onClose}>
      <div className="product-detail-content" onClick={e => e.stopPropagation()}>
        <div className="product-detail-header">
          <h2>{product.name}</h2>
          <button className="product-detail-close" onClick={onClose}>×</button>
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

              <div className="addons-section">
                <h3>İlişkili Addon Ürünler</h3>
                {addonLoading ? (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                  </div>
                ) : addons.length === 0 ? (
                  <p>Bu ürüne ait addon ürün bulunmamaktadır.</p>
                ) : (
                  <div className="addon-list">
                    {addons.map(addon => (
                      <div key={addon.id} className="addon-item">
                        <div className="addon-header">
                          <h4>{addon.addonProduct.name}</h4>
                          <span className={`addon-status ${addon.mandatory ? 'mandatory' : 'optional'}`}>
                            {addon.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                          </span>
                        </div>
                        <div className="addon-code">Kod: {addon.addonProduct.code}</div>
                        {addon.addonProduct.specifications?.flatMap(spec =>
                          spec.characteristics?.filter(char => char.value).map(char => (
                            <div key={char.code} className="addon-characteristic">
                              <span>{char.name || char.code}:</span> {char.value}
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

// Addon Seçimi Modal Bileşeni
const AddonSelectionModal = ({ addons, onConfirm, onClose, mainProduct }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);

  const handleToggleAddon = (addon) => {
    if (addon.mandatory) return; // Zorunlu addon'lar değiştirilemez
    const isSelected = selectedAddons.some(a => a.id === addon.id);
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  return (
    <div className="addon-selection-modal-backdrop" onClick={onClose}>
      <div className="addon-selection-content" onClick={e => e.stopPropagation()}>
        <div className="addon-selection-header">
          <h2>{mainProduct.name} için Addon Seçimi</h2>
          <button className="addon-selection-close" onClick={onClose}>×</button>
        </div>
        <div className="addon-selection-body">
          {addons.length === 0 ? (
            <p>Addon ürün bulunmamaktadır.</p>
          ) : (
            <div className="addon-list">
              {addons.map(addon => (
                <div key={addon.id} className="addon-item">
                  <div className="addon-info">
                    <h4>{addon.addonProduct.name}</h4>
                    <div className="addon-code">Kod: {addon.addonProduct.code}</div>
                    <span className={`addon-status ${addon.mandatory ? 'mandatory' : 'optional'}`}>
                      {addon.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                    </span>
                    {addon.addonProduct.specifications?.flatMap(spec =>
                      spec.characteristics?.filter(char => char.value).map(char => (
                        <div key={char.code} className="addon-characteristic">
                          <span>{char.name || char.code}:</span> {char.value}
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    className={`addon-select-button ${addon.mandatory || selectedAddons.some(a => a.id === addon.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleAddon(addon)}
                    disabled={addon.mandatory}
                  >
                    {addon.mandatory ? 'Zorunlu' : selectedAddons.some(a => a.id === addon.id) ? 'Seçildi' : 'Seç'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="addon-selection-footer">
          <button
            className="addon-cancel-button"
            onClick={onClose}
          >
            <X size={16} /> İptal
          </button>
          <button
            className="addon-confirm-button"
            onClick={() => onConfirm(selectedAddons)}
          >
            <CheckCircle size={16} /> Onayla
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

const CartItem = ({ product, onRemove, onViewDetails, isAddon }) => {
  return (
    <div className={`cart-item ${isAddon ? 'addon-cart-item' : ''}`}>
      <div className="cart-item-content" onClick={() => onViewDetails(product)}>
        <h4>{product.name} {isAddon && <span className="addon-label">(Addon)</span>}</h4>
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
  const [addonModalProduct, setAddonModalProduct] = useState(null);
  const [addons, setAddons] = useState([]);
  const [bbk, setBbk] = useState(null);
  const [maxSpeedInfo, setMaxSpeedInfo] = useState(null);
  const [hasInfrastructure, setHasInfrastructure] = useState(true); // New state for infrastructure availability
  const [usingBbkProducts, setUsingBbkProducts] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

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
      const response = await getMaxSpeedInfo(bbkValue);
      console.log('Max Speed Response:', response);
      if (response && response.data && Object.keys(response.data).length > 0) {
        setMaxSpeedInfo(response.data);
        setHasInfrastructure(true); // Infrastructure exists
      } else {
        setMaxSpeedInfo(null);
        setHasInfrastructure(false); // No infrastructure
      }
    } catch (err) {
      console.error('Maksimum hız bilgisi getirme hatası:', err);
      setHasInfrastructure(false); // Treat error as no infrastructure
    }
  };

  // Addon'ları getir
  const fetchAddons = async (mainProductId) => {
    try {
      const response = await getAddonsForMainProduct(mainProductId);
      return response.data || [];
    } catch (err) {
      console.error('Addon getirme hatası:', err);
      showNotification('error', 'Addon ürünleri yüklenirken bir hata oluştu');
      return [];
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

      // Addon'ları getir
      const addons = await fetchAddons(product.id);
      const mandatoryAddons = addons.filter(addon => addon.mandatory);
      const optionalAddons = addons.filter(addon => !addon.mandatory);

      // Zorunlu addon'ları otomatik ekle ve bildir
      if (mandatoryAddons.length > 0) {
        const mandatoryNames = mandatoryAddons.map(addon => addon.addonProduct.name).join(', ');
        showNotification('success', `Zorunlu addon ürünler eklendi: ${mandatoryNames}`);
      }

      // Tüm addon'ları modalda göster
      setAddonModalProduct(product);
      setAddons(addons);
    } catch (err) {
      setError('Ürün güncelleme hatası: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Ürün ve addon'ları sepete ekle
  const addProductsToCart = async (mainProduct, selectedAddons) => {
    try {
      setLocalLoading(true);
      const orderRequestId = orderData?.data?.orderRequestId;

      // Ana ürünü ekle
      await updateOrderProducts(orderRequestId, mainProduct.code);

      // Addon'ları ekle
      for (const addon of selectedAddons) {
        await updateOrderProducts(orderRequestId, addon.addonProduct.code);
      }

      await fetchOrderDetails(); // Sepeti güncelle
      setError(null);
    } catch (err) {
      setError('Ürün ve addon ekleme hatası: ' + err.message);
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

      await deleteOrderProducts(orderRequestId, product.mainProductCode || product.code);
      await fetchOrderDetails(); // Sepeti güncelle
      setError(null);
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

  // Addon seçimini onayla
  const handleConfirmAddons = async (selectedAddons) => {
    const mandatoryAddons = addons.filter(a => a.mandatory);
    await addProductsToCart(addonModalProduct, [
      ...mandatoryAddons, // Zorunlu addon'ları ekle
      ...selectedAddons // Kullanıcının seçtiği addon'ları ekle
    ]);
    setAddonModalProduct(null);
    setAddons([]);
  };

  // Addon seçim modalını kapat
  const closeAddonModal = () => {
    setAddonModalProduct(null);
    setAddons([]);
  };

  // Bildirim gösterme
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

  return (
    <div className="product-selection-container">
      {(loading || localLoading) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {notification.show && (
        <div className={`notification ${notification.type === 'success' ? 'success-notification' : 'error-notification'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div className="notification-message">{notification.message}</div>
          <button className="notification-close" onClick={() => setNotification({ show: false, type: '', message: '' })}>
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Conditional Rendering Based on Infrastructure Availability */}
      {!hasInfrastructure ? (
        <div className="error-banner">
          <AlertCircle size={16} /> 
          Bu adreste internet altyapısı bulunmamaktadır. Lütfen başka bir adres deneyin veya destek ekibiyle iletişime geçin.
        </div>
      ) : (
        <>
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
                      isAddon={product.isAddon || false}
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
        </>
      )}

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
          disabled={loading || localLoading || !hasInfrastructure || !orderDetails?.products?.length}
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

      {/* Addon Seçim Modalı */}
      {addonModalProduct && (
        <AddonSelectionModal
          addons={addons}
          onConfirm={handleConfirmAddons}
          onClose={closeAddonModal}
          mainProduct={addonModalProduct}
        />
      )}
    </div>
  );
};

export default CustomerAddProduct;