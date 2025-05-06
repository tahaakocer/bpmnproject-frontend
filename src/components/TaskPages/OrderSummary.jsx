import React, { useState, useEffect } from 'react';
import { getOrderRequest } from '../../services/orderService';
import { getAddonsForMainProduct } from '../../services/addonService';
import { sendMessage } from '../../services/taskService';
import '../../styles/FormStyles.css';
import '../../styles/CommonStyles.css';
import { AlertCircle, ShoppingCart, CheckCircle, Info, ArrowRight } from 'lucide-react';

const OrderSummary = ({ onComplete, orderData, loading, onGoBack }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [addonsByMainProduct, setAddonsByMainProduct] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState([]);

  // Sipariş detaylarını getir
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLocalLoading(true);
        const orderRequestId = orderData?.data?.orderRequestId;
        
        console.log("OrderSummary: Sipariş ID:", orderRequestId);
        console.log("OrderSummary: orderData:", orderData);
        
        if (!orderRequestId) {
          throw new Error('Sipariş ID bulunamadı');
        }
        
        const response = await getOrderRequest(orderRequestId);
        console.log("OrderSummary: Sipariş yanıtı:", response);
        
        setOrderDetails(response.data.baseOrder);
        
        // Ana ürünleri tespit et ve her biri için addonları getir
        const mainProducts = response.data.baseOrder.products.filter(p => !p.isAddon);
        console.log("OrderSummary: Ana Ürünler:", mainProducts);
        
        await fetchAddonsForMainProducts(mainProducts);
        
      } catch (err) {
        console.error("OrderSummary ERROR:", err);
        setError('Sipariş detayları yüklenirken bir hata oluştu: ' + err.message);
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderData]);
  
  // Ana ürünlere ait addonları getir
  const fetchAddonsForMainProducts = async (mainProducts) => {
    try {
      const addonMap = {};
      
      for (const product of mainProducts) {
        console.log(`${product.name} için addon'lar getiriliyor... (ID: ${product.id})`);
        const addons = await getAddonsForMainProduct(product.id);
        console.log(`${product.name} için addon yanıtı:`, addons);
        addonMap[product.id] = addons.data || [];
      }
      
      setAddonsByMainProduct(addonMap);
    } catch (err) {
      console.error('Addon ürünleri getirme hatası:', err);
    }
  };
  
  // Ürün detaylarını genişlet/daralt
  const toggleProductExpand = (productId) => {
    setExpandedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  // Siparişi tamamla
  const handleCompleteOrder = async () => {
    try {
      setLocalLoading(true);
      
      // Başarı mesajını göster
      console.log('Sipariş tamamlama işlemi başlatılıyor...');
      
      // onComplete fonksiyonunu çağırarak üst bileşene bildiriyoruz
      onComplete({});
      
    } catch (error) {
      console.error('Sipariş tamamlama hatası:', error);
      setError('Sipariş tamamlama sırasında bir hata oluştu: ' + error.message);
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
      
      console.log('Geri dönüş mesajı gönderiliyor. ProcessInstanceId:', processInstanceId);
      
      // Önceki task'a dönmek için mesaj gönder
      const messageResponse = await sendMessage(processInstanceId, "backToAddProduct");
      console.log('Mesaj gönderme işlemi sonucu:', messageResponse);
      
      // Üst component'e bildirerek task bilgisinin güncellenmesini sağla
      if (onGoBack) {
        onGoBack();
      }
    } catch (error) {
      console.error('Önceki adıma dönme hatası:', error);
      setError('Önceki adıma dönülürken bir hata oluştu: ' + error.message);
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Sepetteki toplam ürün sayısını hesapla
  const getTotalProductCount = () => {
    if (!orderDetails?.products) return 0;
    return orderDetails.products.length;
  };
  
  // Siparişte ana ürünleri ve onların addonlarını grupla
  const groupProductsWithAddons = () => {
    if (!orderDetails?.products) return [];
    
    // Ana ürünleri bul
    const mainProducts = orderDetails.products.filter(p => !p.isAddon);
    
    // Addonları ana ürünlere göre eşleştir
    const addonProducts = orderDetails.products.filter(p => p.isAddon);
    
    // Her ana ürün için eşleşen addonları bul
    return mainProducts.map(mainProduct => {
      // Bu ana ürüne ait addonları bul
      const matchingAddons = addonProducts.filter(addon => 
        addon.mainProductId === mainProduct.id || 
        addon.mainProductCode === mainProduct.code
      );
      
      return {
        mainProduct,
        addons: matchingAddons
      };
    });
  };
  
  // Ürün özelliklerinden detay bilgilerini oluştur
  const renderProductCharacteristics = (product) => {
    // Ürün ve karakteristikler yoksa boş döndür
    if (!product || !product.specifications) return null;
    
    return product.specifications.flatMap(spec => 
      spec.characteristics?.filter(char => char.value).map(char => (
        <div key={char.id || char.code} className="product-characteristic">
          <span className="characteristic-name">{char.name || char.code}:</span> 
          <span className="characteristic-value">{char.value}</span>
        </div>
      ))
    );
  };
  
  // Grup içindeki ürün detaylarını görüntüle
  const renderProductGroup = (group, index) => {
    const { mainProduct, addons } = group;
    const isExpanded = expandedProducts.includes(mainProduct.id);
    
    return (
      <div key={mainProduct.id} className="order-product-group">
        {/* Ana Ürün */}
        <div 
          className={`order-product-item main-product ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleProductExpand(mainProduct.id)}
        >
          <div className="product-header">
            <div className="product-title">
              <h4>{mainProduct.name}</h4>
              <div className="product-code">{mainProduct.code}</div>
            </div>
            <div className="expand-icon">
              {isExpanded ? <span>▲</span> : <span>▼</span>}
            </div>
          </div>
          
          {isExpanded && (
            <div className="product-details">
              {renderProductCharacteristics(mainProduct)}
            </div>
          )}
        </div>
        
        {/* Addon Ürünler */}
        {addons.length > 0 && (
          <div className="addon-products-container">
            {addons.map(addon => (
              <div key={addon.id} className="order-product-item addon-product">
                <div className="product-header">
                  <div className="product-title">
                    <div className="addon-label">Addon</div>
                    <h4>{addon.name}</h4>
                    <div className="product-code">{addon.code}</div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="product-details">
                    {renderProductCharacteristics(addon)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="order-summary-container">
      <h2 className="order-summary-title">
        <ShoppingCart size={24} className="title-icon" />
        Sipariş Önizleme
      </h2>
      <p className="order-summary-description">
        Lütfen siparişinizi inceleyip onaylayın. {orderData ? '(Sipariş verisi var)' : '(Sipariş verisi yok)'}
      </p>
      
      {/* Hata mesajı */}
      {error && (
        <div className="error-banner" style={{padding: '15px', margin: '15px 0', backgroundColor: '#ffebee', color: 'red', borderRadius: '4px'}}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      
      {/* Yükleme durumu (daima görünür test için) */}
      <div style={{border: '1px solid #ddd', padding: '10px', marginBottom: '10px', backgroundColor: '#f5f5f5'}}>
        Yükleme Durumu: {(loading || localLoading) ? 'Yükleniyor...' : 'Tamamlandı'}
      </div>
      
      {/* Normal yükleme göstergesi */}
      {(loading || localLoading) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <div className="order-summary-content">
        {/* Müşteri Bilgileri Özeti */}
        <div className="order-section customer-summary">
          <h3 className="section-title">Müşteri Bilgileri</h3>
          
          {orderDetails?.engagedParty ? (
            <div className="customer-info-grid">
              <div className="info-group">
                <h4>Kişisel Bilgiler</h4>
                <div className="info-item">
                  <span className="info-label">TC Kimlik No:</span>
                  <span className="info-value">{orderDetails.engagedParty.tckn}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ad:</span>
                  <span className="info-value">{orderDetails.engagedParty.firstName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Soyad:</span>
                  <span className="info-value">{orderDetails.engagedParty.lastName}</span>
                </div>
              </div>
              
              <div className="info-group">
                <h4>İletişim Bilgileri</h4>
                <div className="info-item">
                  <span className="info-label">E-posta:</span>
                  <span className="info-value">{orderDetails.engagedParty.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Telefon:</span>
                  <span className="info-value">{orderDetails.engagedParty.phoneNumber}</span>
                </div>
              </div>
              
              <div className="info-group full-width">
                <h4>Adres Bilgileri</h4>
                <div className="info-item">
                  <span className="info-label">Adres:</span>
                  <span className="info-value">{orderDetails.engagedParty.formattedAddress}</span>
                </div>
                {orderDetails.engagedParty.address?.bbk && (
                  <div className="info-item">
                    <span className="info-label">BBK Kodu:</span>
                    <span className="info-value">{orderDetails.engagedParty.address.bbk}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
              Müşteri bilgileri yüklenemedi.
            </div>
          )}
        </div>
        
        {/* Ürün Listesi */}
        <div className="order-section products-summary">
          <h3 className="section-title">
            Sipariş Ürünleri 
            <span className="product-count">{getTotalProductCount()}</span>
          </h3>
          
          {orderDetails?.products && orderDetails.products.length > 0 ? (
            <div className="order-products-list">
              {groupProductsWithAddons().map((group, index) => renderProductGroup(group, index))}
            </div>
          ) : (
            <div className="empty-cart-message">
              <Info size={20} />
              <p>Sepetinizde ürün bulunmamaktadır.</p>
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
          className="primary-button complete-order-button"
          onClick={handleCompleteOrder}
          disabled={loading || localLoading || !orderDetails?.products || orderDetails.products.length === 0}
        >
          {loading || localLoading ? 'İşlem yapılıyor...' : 
            <>
              Siparişi Tamamla <ArrowRight size={16} />
            </>
          }
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;