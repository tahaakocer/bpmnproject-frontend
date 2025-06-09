import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Package, MapPin, Phone, Mail, Calendar, CreditCard, 
  ChevronDown, ChevronRight, Star, Settings, Wifi, Router, ArrowDownRight
} from 'lucide-react';
import '../styles/FormStyles.css';
import '../styles/CommonStyles.css';
import { 
  getPartyRoleByOrderRequestId, 
  getAccountByOrderId, 
  getAgreementByOrderId 
} from '../services/userDetailService';

const UserDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [partyRoleData, setPartyRoleData] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [agreementData, setAgreementData] = useState(null);
  const [searchTckn, setSearchTckn] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedAccounts, setExpandedAccounts] = useState({});

  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
      setSearchTckn(location.state.searchTckn || '');
      loadAdditionalData(location.state.userData.id);
    } else {
      navigate('/kullanici-ara');
    }
  }, [location.state, navigate]);

  const loadAdditionalData = async (orderRequestId) => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm API'leri çağır
      const [partyRoleResponse, accountResponse, agreementResponse] = await Promise.all([
        getPartyRoleByOrderRequestId(orderRequestId),
        getAccountByOrderId(orderRequestId),
        getAgreementByOrderId(orderRequestId)
      ]);

      setPartyRoleData(partyRoleResponse?.data);
      setAccountData(accountResponse?.data);
      setAgreementData(agreementResponse?.data);
    } catch (error) {
      console.error('Ek veri yüklemede hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountExpansion = (accountId) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getAddressFromContactMedia = (contactMedia) => {
    const addressMedia = contactMedia?.find(media => media.type === 'ADDRESS');
    if (!addressMedia?.contactMediumCharacteristic) return 'Adres bilgisi bulunamadı';
    
    const addr = addressMedia.contactMediumCharacteristic;
    return `${addr.neighborhoodName} Mah., ${addr.streetName}, ${addr.blokName}, ${addr.districtName}, ${addr.cityName}`;
  };

  const getPhoneFromContactMedia = (contactMedia) => {
    const phoneMedia = contactMedia?.find(media => media.type === 'PHONE');
    return phoneMedia?.contactMediumCharacteristic?.phoneNumber || 'Telefon bilgisi bulunamadı';
  };

  const getEmailFromContactMedia = (contactMedia) => {
    const emailMedia = contactMedia?.find(media => media.type === 'EMAIL');
    return emailMedia?.contactMediumCharacteristic?.email || 'E-posta bilgisi bulunamadı';
  };

  // Ürünleri ana ürün ve addon'lara ayır
  const separateProducts = (agreementItems) => {
    if (!agreementItems) return { mainProducts: [], addonProducts: [] };
    
    const mainProducts = agreementItems.filter(item => item.product?.mainProduct === true);
    const addonProducts = agreementItems.filter(item => item.product?.mainProduct === false);
    
    return { mainProducts, addonProducts };
  };

  const renderProductCard = (item, isMainProduct = false, isAddon = false) => {
    const product = item.product;
    if (!product) return null;

    return (
      <div 
        key={item.id} 
        className={`product-card ${isMainProduct ? 'main-product' : ''} ${isAddon ? 'addon-product' : ''}`}
        style={{
          marginBottom: '12px',
          padding: '15px',
          backgroundColor: isMainProduct ? '#e8f5e8' : isAddon ? '#f0f7ff' : '#f8f9fa',
          border: isMainProduct ? '2px solid #4caf50' : isAddon ? '1px solid #1976d2' : '1px solid #ddd',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        {isMainProduct && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '15px',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            <Star size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            ANA ÜRÜN
          </div>
        )}
        
        {isAddon && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '15px',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            <Package size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            ADDON
          </div>
        )}

        <div style={{ marginTop: isMainProduct || isAddon ? '10px' : '0' }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: isMainProduct ? '#2e7d32' : isAddon ? '#1565c0' : '#333',
            fontSize: '1.1rem'
          }}>
            {product.name}
          </h4>
          
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
            <strong>Ürün Kodu:</strong> {product.code}
          </div>
          
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
            <strong>Durum:</strong> 
            <span style={{
              marginLeft: '8px',
              padding: '2px 6px',
              backgroundColor: item.agreementItemStatus?.status === 'ACTIVATED' ? '#c8e6c9' : '#ffecb3',
              color: item.agreementItemStatus?.status === 'ACTIVATED' ? '#2e7d32' : '#f57c00',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {item.agreementItemStatus?.status || 'Bilinmiyor'}
            </span>
          </div>

          {product.productCharacteristics && product.productCharacteristics.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: 'bold', 
                color: '#555', 
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Settings size={14} style={{ marginRight: '4px' }} />
                Ürün Özellikleri:
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '6px' 
              }}>
                {product.productCharacteristics.slice(0, 4).map((char, index) => (
                  <div key={index} style={{ 
                    fontSize: '0.8rem', 
                    color: '#555',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    <strong>{char.name}:</strong> {char.value}
                  </div>
                ))}
              </div>
              
              {product.productCharacteristics.length > 4 && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#999', 
                  fontStyle: 'italic',
                  marginTop: '4px'
                }}>
                  +{product.productCharacteristics.length - 4} özellik daha...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleGoBack = () => {
    navigate('/kullanici-ara');
  };

  if (!userData) {
    return (
      <div className="main-content">
        <div className="form-container">
          <div className="form-content">
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="form-container user-detail-container">
        <div className="form-content">
          <div className="form-step">
            <h2>
              <User size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Müşteri Detayları
            </h2>
            <p className="form-description">
              TCKN: {searchTckn} için bulunan müşteri ve sipariş bilgileri
            </p>

            {/* Üst Bilgi Alanı - İki Kolon */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px', 
              marginBottom: '20px' 
            }}>
              {/* Sol Taraf - Kimlik Bilgileri */}
              <div className="review-section">
                <h3>
                  <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Kimlik ve Kişisel Bilgiler
                </h3>
                
                {/* Ana Kimlik Bilgileri */}
                <div className="identity-section">
                  <div className="identity-header">
                    <User size={16} style={{ marginRight: '6px', color: '#1976d2' }} />
                    <strong>Kimlik Bilgileri</strong>
                  </div>
                  
                  <div className="identity-details">
                    <div className="identity-item highlight">
                      <span className="identity-label">TCKN:</span>
                      <span className="identity-value tckn">
                        {partyRoleData?.individual?.individualIdentification?.identificationId || 
                         userData.baseOrder?.engagedParty?.tckn}
                      </span>
                    </div>
                    
                    <div className="identity-item">
                      <span className="identity-label">Ad:</span>
                      <span className="identity-value">
                        {partyRoleData?.individual?.firstName || userData.baseOrder?.engagedParty?.firstName}
                      </span>
                    </div>
                    
                    <div className="identity-item">
                      <span className="identity-label">Soyad:</span>
                      <span className="identity-value">
                        {partyRoleData?.individual?.lastName || userData.baseOrder?.engagedParty?.lastName}
                      </span>
                    </div>
                    
                    <div className="identity-item">
                      <span className="identity-label">Tam Ad:</span>
                      <span className="identity-value full-name">
                        {partyRoleData?.individual?.formattedName || 
                         `${userData.baseOrder?.engagedParty?.firstName} ${userData.baseOrder?.engagedParty?.lastName}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Demografik Bilgiler */}
                <div className="demographic-section">
                  <div className="demographic-header">
                    <Calendar size={16} style={{ marginRight: '6px', color: '#666' }} />
                    <strong>Demografik Bilgiler</strong>
                  </div>
                  
                  <div className="demographic-details">
                    <div className="demographic-item">
                      <Calendar size={14} style={{ marginRight: '6px', color: '#666' }} />
                      <span className="demographic-label">Doğum Yılı:</span>
                      <span className="demographic-value">
                        {partyRoleData?.individual?.birthYear || userData.baseOrder?.engagedParty?.birthYear}
                        <span className="age-info">
                          ({new Date().getFullYear() - (partyRoleData?.individual?.birthYear || userData.baseOrder?.engagedParty?.birthYear)} yaş)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="contact-info-section">
                  <div className="contact-info-header">
                    <Phone size={16} style={{ marginRight: '6px', color: '#666' }} />
                    <strong>İletişim Bilgileri</strong>
                  </div>
                  
                  <div className="contact-info-details">
                    <div className="contact-info-item">
                      <Phone size={14} style={{ marginRight: '8px', color: '#666' }} />
                      <div className="contact-info-content">
                        <span className="contact-info-label">Telefon:</span>
                        <span className="contact-info-value phone">
                          {(() => {
                            const phone = getPhoneFromContactMedia(partyRoleData?.contactMedia);
                            return phone !== 'Telefon bilgisi bulunamadı' ? 
                              phone.toString().replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2 $3 $4') : 
                              phone;
                          })()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="contact-info-item">
                      <Mail size={14} style={{ marginRight: '8px', color: '#666' }} />
                      <div className="contact-info-content">
                        <span className="contact-info-label">E-posta:</span>
                        <span className="contact-info-value email">
                          {getEmailFromContactMedia(partyRoleData?.contactMedia)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Müşteri Durumu */}
                <div className="customer-status-section">
                  <div className="customer-status-header">
                    <Settings size={16} style={{ marginRight: '6px', color: '#666' }} />
                    <strong>Müşteri Durumu</strong>
                  </div>
                  
                  <div className="customer-status-details">
                    <div className="status-item">
                      <span className="status-label">Müşteri Tipi:</span>
                      <span className="status-value customer-type">
                        {partyRoleData?.roleTypeRef?.name || 'CUSTOMER'}
                      </span>
                    </div>
                    
                    <div className="status-item">
                      <span className="status-label">İletişim İzni:</span>
                      <span className={`status-value ${partyRoleData?.customer?.hasCommunicationPermAppr ? 'approved' : 'denied'}`}>
                        {partyRoleData?.customer?.hasCommunicationPermAppr ? 'Onaylı' : 'Onaylanmamış'}
                      </span>
                    </div>
                    
                    <div className="status-item">
                      <span className="status-label">Veri Kullanım İzni:</span>
                      <span className={`status-value ${partyRoleData?.customer?.hasPersonalDataUsagePerm ? 'approved' : 'denied'}`}>
                        {partyRoleData?.customer?.hasPersonalDataUsagePerm ? 'Onaylı' : 'Onaylanmamış'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf - Adres ve İletişim Bilgileri */}
              <div className="review-section">
                <h3>
                  <MapPin size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Adres ve İletişim Bilgileri
                </h3>
                
                {/* Detaylı Adres Bilgileri */}
                {(() => {
                  const addressMedia = partyRoleData?.contactMedia?.find(m => m.type === 'ADDRESS');
                  const addr = addressMedia?.contactMediumCharacteristic;
                  
                  if (!addr) return (
                    <div className="review-item">
                      <span className="review-value">Adres bilgisi bulunamadı</span>
                    </div>
                  );
                  
                  return (
                    <>
                      <div className="address-section">
                        <div className="address-header">
                          <MapPin size={16} style={{ marginRight: '6px', color: '#1976d2' }} />
                          <strong>Posta Adresi</strong>
                        </div>
                        
                        <div className="address-details">
                          <div className="address-line">
                            <span className="address-label">Mahalle:</span>
                            <span className="address-value">{addr.neighborhoodName}</span>
                          </div>
                          
                          <div className="address-line">
                            <span className="address-label">Sokak:</span>
                            <span className="address-value">{addr.streetName}</span>
                          </div>
                          
                          <div className="address-line">
                            <span className="address-label">Bina:</span>
                            <span className="address-value">{addr.blokName}</span>
                          </div>
                          
                          <div className="address-line">
                            <span className="address-label">İlçe:</span>
                            <span className="address-value">{addr.districtName}</span>
                          </div>
                          
                          <div className="address-line">
                            <span className="address-label">İl:</span>
                            <span className="address-value">{addr.cityName}</span>
                          </div>
                          
                          <div className="address-line">
                            <span className="address-label">Belde:</span>
                            <span className="address-value">{addr.townshipName}</span>
                          </div>
                        </div>
                        
                        <div className="address-codes">
                          <div className="code-item">
                            <span className="code-label">BBK:</span>
                            <span className="code-value">{addr.bbk}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">Şehir Kodu:</span>
                            <span className="code-value">{addr.cityCode}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">İlçe Kodu:</span>
                            <span className="code-value">{addr.districtCode}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">Belde Kodu:</span>
                            <span className="code-value">{addr.townshipCode}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">Mahalle Kodu:</span>
                            <span className="code-value">{addr.neighborhoodCode}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">Sokak Kodu:</span>
                            <span className="code-value">{addr.streetCode}</span>
                          </div>
                          <div className="code-item">
                            <span className="code-label">Bina Kodu:</span>
                            <span className="code-value">{addr.buildingCode}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Teknik Altyapı Bilgileri */}
                {accountData?.[0]?.billingAccountSacInfo && (
                  <div className="technical-section">
                    <div className="technical-header">
                      <Settings size={16} style={{ marginRight: '6px', color: '#ff9800' }} />
                      <strong>Teknik Altyapı Bilgileri</strong>
                    </div>
                    
                    <div className="technical-grid">
                      <div className="tech-item">
                        <span className="tech-label">Maksimum Hız:</span>
                        <span className="tech-value speed">
                          {accountData[0].billingAccountSacInfo.maxSpeed} Mbps
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">ADSL Mesafe:</span>
                        <span className="tech-value">
                          {accountData[0].billingAccountSacInfo.adslDistance} m
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">ADSL Port:</span>
                        <span className={`tech-value ${accountData[0].billingAccountSacInfo.adslPortState ? 'available' : 'unavailable'}`}>
                          {accountData[0].billingAccountSacInfo.adslPortState ? 'Uygun' : 'Uygun Değil'}
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">VDSL Mesafe:</span>
                        <span className="tech-value">
                          {accountData[0].billingAccountSacInfo.vdslDistance} m
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">VDSL Port:</span>
                        <span className={`tech-value ${accountData[0].billingAccountSacInfo.vdslPortState ? 'available' : 'unavailable'}`}>
                          {accountData[0].billingAccountSacInfo.vdslPortState ? 'Uygun' : 'Uygun Değil'}
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">Fiber Mesafe:</span>
                        <span className="tech-value">
                          {accountData[0].billingAccountSacInfo.fiberDistance} m
                        </span>
                      </div>
                      
                      <div className="tech-item">
                        <span className="tech-label">Fiber Port:</span>
                        <span className={`tech-value ${accountData[0].billingAccountSacInfo.fiberPortState ? 'available' : 'unavailable'}`}>
                          {accountData[0].billingAccountSacInfo.fiberPortState ? 'Uygun' : 'Uygun Değil'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* İletişim Bilgileri Özeti */}
                <div className="contact-summary">
                  <div className="contact-header">
                    <Phone size={16} style={{ marginRight: '6px', color: '#4caf50' }} />
                    <strong>İletişim Özeti</strong>
                  </div>
                  
                  <div className="contact-items">
                    <div className="contact-item">
                      <Phone size={14} style={{ marginRight: '6px', color: '#4caf50' }} />
                      <span>{getPhoneFromContactMedia(partyRoleData?.contactMedia)}</span>
                    </div>
                    
                    <div className="contact-item">
                      <Mail size={14} style={{ marginRight: '6px', color: '#2196f3' }} />
                      <span>{getEmailFromContactMedia(partyRoleData?.contactMedia)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Sekmeleri */}
            {accountData && accountData.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                {accountData.map((account, index) => (
                  <div key={account.id} style={{ marginBottom: '15px' }}>
                    {/* Account Header - Tıklanabilir */}
                    <div 
                      onClick={() => toggleAccountExpansion(account.id)}
                      style={{
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard size={20} style={{ marginRight: '10px', color: '#1976d2' }} />
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                            Account: {account.accountCode}
                          </h3>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                            Fatura Dönemi: {account.billingAccount?.billCycle || 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {agreementData && (
                          <span style={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            marginRight: '10px'
                          }}>
                            {agreementData.agreementItems?.length || 0} Ürün
                          </span>
                        )}
                        {expandedAccounts[account.id] ? 
                          <ChevronDown size={20} /> : 
                          <ChevronRight size={20} />
                        }
                      </div>
                    </div>

                    {/* Account İçeriği - Genişleyebilir */}
                    {expandedAccounts[account.id] && (
                      <div style={{
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        padding: '20px',
                        backgroundColor: '#fafafa',
                        animation: 'slideDown 0.3s ease'
                      }}>
                        {/* Account Detay Bilgileri */}
                        <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                          <div className="review-item">
                            <span className="review-label">Account ID:</span>
                            <span className="review-value" style={{ fontSize: '0.8rem' }}>{account.id}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Durum:</span>
                            <span className="review-value">{account.reasor || 'Aktif'}</span>
                          </div>
                          {account.billingAccount?.billingSystem && (
                            <div className="review-item">
                              <span className="review-label">Fatura Sistemi:</span>
                              <span className="review-value">{account.billingAccount.billingSystem.billingSystemCode}</span>
                            </div>
                          )}
                        </div>

                        {/* Ürünler Bölümü */}
                        {agreementData?.agreementItems && agreementData.agreementItems.length > 0 && (
                          <div>
                            <h4 style={{ 
                              color: '#333', 
                              borderBottom: '2px solid #1976d2', 
                              paddingBottom: '8px',
                              marginBottom: '15px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Package size={18} style={{ marginRight: '8px' }} />
                              Ürünler ve Servisler
                            </h4>
                            
                            {(() => {
                              const { mainProducts, addonProducts } = separateProducts(agreementData.agreementItems);
                              
                              return (
                                <div>
                                  {/* Ana Ürünler */}
                                  {mainProducts.map((item) => renderProductCard(item, true, false))}
                                  
                                  {/* Addon Ürünler - Bağlantı okları ile */}
                                  {addonProducts.length > 0 && (
                                    <div style={{ marginLeft: '20px', position: 'relative' }}>
                                      {/* Bağlantı çizgisi */}
                                      <div style={{
                                        position: 'absolute',
                                        left: '-15px',
                                        top: '0',
                                        bottom: '0',
                                        width: '2px',
                                        backgroundColor: '#1976d2',
                                        opacity: 0.5
                                      }}></div>
                                      
                                      {addonProducts.map((item, index) => (
                                        <div key={item.id} style={{ position: 'relative' }}>
                                          {/* Ok işareti */}
                                          <ArrowDownRight 
                                            size={16} 
                                            style={{
                                              position: 'absolute',
                                              left: '-25px',
                                              top: '20px',
                                              color: '#1976d2'
                                            }}
                                          />
                                          {renderProductCard(item, false, true)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666'
              }}>
                <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                <div>Ek bilgiler yükleniyor...</div>
              </div>
            )}

            {/* Aksiyonlar */}
            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={handleGoBack}
              >
                <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                Geri Dön
              </button>
              
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  console.log('Yeni işlemler için hazır');
                }}
              >
                İşlemlere Devam Et
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .user-detail-container {
          max-width: 95% !important;
          width: 70% !important;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        
        .product-card {
          transition: all 0.3s ease;
        }
        
        .product-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .main-product {
          background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
        }
        
        .addon-product {
          background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
        }
        
        /* Kimlik Bilgileri Stilleri */
        .identity-section {
          margin-bottom: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 4px solid #1976d2;
        }
        
        .identity-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #1976d2;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .identity-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .identity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .identity-item:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .identity-item.highlight {
          background: rgba(25, 118, 210, 0.05);
          border: 1px solid rgba(25, 118, 210, 0.2);
        }
        
        .identity-label {
          font-weight: 600;
          color: #666;
          min-width: 80px;
        }
        
        .identity-value {
          color: #333;
          font-weight: 500;
          text-align: right;
        }
        
        .identity-value.tckn {
          font-family: monospace;
          background: #1976d2;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        
        .identity-value.full-name {
          color: #1976d2;
          font-weight: bold;
          font-size: 1.05rem;
        }
        
        /* Demografik Bilgiler Stilleri */
        .demographic-section {
          margin-bottom: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 4px solid #666;
        }
        
        .demographic-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #666;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .demographic-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .demographic-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .demographic-label {
          font-weight: 600;
          color: #666;
          margin-right: 10px;
        }
        
        .demographic-value {
          color: #333;
          font-weight: 500;
        }
        
        .age-info {
          margin-left: 8px;
          color: #999;
          font-size: 0.85rem;
          font-style: italic;
        }
        
        /* İletişim Bilgileri Stilleri */
        .contact-info-section {
          margin-bottom: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 4px solid #666;
        }
        
        .contact-info-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #666;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .contact-info-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .contact-info-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .contact-info-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .contact-info-label {
          font-weight: 600;
          color: #666;
        }
        
        .contact-info-value {
          color: #333;
          font-weight: 500;
        }
        
        .contact-info-value.phone {
          font-family: monospace;
          background: #666;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .contact-info-value.email {
          color: #1976d2;
          font-weight: 500;
          word-break: break-all;
        }
        
        /* Müşteri Durumu Stilleri */
        .customer-status-section {
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 4px solid #666;
        }
        
        .customer-status-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #666;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .customer-status-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .status-label {
          font-weight: 500;
          color: #666;
        }
        
        .status-value {
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .status-value.customer-type {
          background: #1976d2;
          color: white;
        }
        
        .status-value.approved {
          background: #4caf50;
          color: white;
        }
        
        .status-value.denied {
          background: #f44336;
          color: white;
        }
        
        /* Adres Detay Stilleri */
        .address-section {
          margin-bottom: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 4px solid #1976d2;
        }
        
        .address-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #1976d2;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .address-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .address-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .address-label {
          font-weight: 500;
          color: #666;
          min-width: 70px;
        }
        
        .address-value {
          color: #333;
          font-weight: 500;
          text-align: right;
        }
        
        .address-codes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 6px;
          margin-top: 10px;
          padding: 8px;
          background: rgba(25, 118, 210, 0.05);
          border-radius: 6px;
        }
        
        .code-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          padding: 2px 6px;
        }
        
        .code-label {
          color: #666;
          font-weight: 500;
        }
        
        .code-value {
          color: #1976d2;
          font-weight: bold;
          font-family: monospace;
        }
        
        /* Teknik Bilgiler Stilleri */
        .technical-section {
          margin-bottom: 15px;
          padding: 12px;
          background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }
        
        .technical-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          color: #ff9800;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .technical-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }
        
        .tech-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .tech-label {
          font-weight: 500;
          color: #666;
        }
        
        .tech-value {
          font-weight: bold;
          color: #333;
        }
        
        .tech-value.speed {
          color: #2e7d32;
          background: #e8f5e8;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .tech-value.available {
          color: #2e7d32;
        }
        
        .tech-value.unavailable {
          color: #d32f2f;
        }
        
        /* İletişim Özeti Stilleri */
        .contact-summary {
          padding: 12px;
          background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }
        
        .contact-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: #4caf50;
          font-weight: bold;
          font-size: 0.95rem;
        }
        
        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          font-size: 0.85rem;
          color: #333;
        }
        
        @media (max-width: 768px) {
          .user-detail-container {
            max-width: 100% !important;
            width: 100% !important;
          }
          
          .address-details,
          .address-codes,
          .technical-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDetail;