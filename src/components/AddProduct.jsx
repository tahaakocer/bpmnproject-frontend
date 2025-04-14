import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/FormStyles.css';
import '../styles/AddProductStyles.css';
import {
  searchSpecifications,
  getSpecificationByCode,
  createProduct
} from '../services/productService';

const AddProduct = () => {
  // Temel ürün bilgileri
  const [productData, setProductData] = useState({
    code: '',
    name: '',
    productType: '',
    productConfType: 'common'
  });

  // Spec arama işlemleri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedSpecDetails, setSelectedSpecDetails] = useState(null);
  const [editableCharacteristics, setEditableCharacteristics] = useState([]);

  // Bildirim mesajları
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Arama işlevselliği
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const result = await searchSpecifications(searchQuery);
        setSearchResults(result.data || []);
      } catch (error) {
        console.error('Spec arama hatası:', error);
        showNotification('error', 'Spec arama sırasında bir hata oluştu');
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Spec seçildiğinde detayları getir
  useEffect(() => {
    const fetchSpecDetails = async () => {
      if (!selectedSpec) {
        setSelectedSpecDetails(null);
        setEditableCharacteristics([]);
        return;
      }

      try {
        const result = await getSpecificationByCode(selectedSpec.code);
        setSelectedSpecDetails(result.data);

        // Düzenlenebilir özellikleri ayarla
        if (result.data && result.data.characteristics) {
          const editable = result.data.characteristics.map(char => ({
            code: char.code,
            value: char.value || ''
          }));
          setEditableCharacteristics(editable);
        }
      } catch (error) {
        console.error('Spec detay getirme hatası:', error);
        showNotification('error', 'Spec detayları getirilirken bir hata oluştu');
      }
    };

    fetchSpecDetails();
  }, [selectedSpec]);

  // Spec seçimi
  const handleSelectSpec = (spec) => {
    setSelectedSpec(spec);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Spec kaldırma
  const handleRemoveSpec = () => {
    setSelectedSpec(null);
    setSelectedSpecDetails(null);
    setEditableCharacteristics([]);
  };

  // Karakteristik değerlerini güncelleme
  const handleCharacteristicChange = (code, value) => {
    const updatedCharacteristics = editableCharacteristics.map(char => 
      char.code === code ? { ...char, value } : char
    );
    setEditableCharacteristics(updatedCharacteristics);
  };

  // Ürün bilgilerini güncelleme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value
    }));
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

  // Ürün oluşturma
  const handleCreateProduct = async () => {
    if (!productData.code || !productData.name || !productData.productType) {
      showNotification('error', 'Lütfen tüm gerekli alanları doldurun');
      return;
    }

    if (!selectedSpec) {
      showNotification('error', 'Lütfen en az bir spec seçin');
      return;
    }

    try {
      // Final edilmiş özellikleri oluştur
      const finalCharacteristics = editableCharacteristics
        .filter(char => char.value) // Boş değerleri filtrele
        .map(({ code, value }) => ({ code, value }));

      // Ürün verisini oluştur
      const finalProductData = {
        ...productData,
        specifications: [
          {
            code: selectedSpec.code,
            characteristics: finalCharacteristics
          }
        ]
      };

      const result = await createProduct(finalProductData);
      console.log('Ürün başarıyla oluşturuldu:', result);
      
      // Formu sıfırla
      setProductData({
        code: '',
        name: '',
        productType: '',
        productConfType: 'common'
      });
      setSelectedSpec(null);
      setSelectedSpecDetails(null);
      setEditableCharacteristics([]);
      
      showNotification('success', 'Ürün başarıyla oluşturuldu');
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      showNotification('error', 'Ürün oluşturulurken bir hata oluştu');
    }
  };

  return (
    <div className="add-product-container">
      {notification.show && (
        <div className={`notification ${notification.type === 'success' ? 'success-notification' : 'error-notification'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <h2>Yeni Ürün Ekle</h2>
      <div className="add-product-grid">
        <div className="add-product-left">
          <div className="add-product-section">
            <h3 className="section-title">Ürün Bilgileri</h3>
            <div className="form-group">
              <label htmlFor="code">Ürün Kodu</label>
              <input
                type="text"
                id="code"
                name="code"
                value={productData.code}
                onChange={handleInputChange}
                placeholder="Örn: ADSL_BASIC_8"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Ürün Adı</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                placeholder="Örn: ADSL 8 Mbps Temel Paket"
              />
            </div>

            <div className="form-group">
              <label htmlFor="productType">Ürün Tipi</label>
              <input
                type="text"
                id="productType"
                name="productType"
                value={productData.productType}
                onChange={handleInputChange}
                placeholder="Örn: ADSL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="productConfType">Konfigürasyon Tipi</label>
              <select
                id="productConfType"
                name="productConfType"
                value={productData.productConfType}
                onChange={handleInputChange}
              >
                <option value="COMMON">Common</option>
                <option value="addon">Addon</option>
              </select>
            </div>
          </div>

          <div className="add-product-section">
            <h3 className="section-title">Spec Ekle</h3>
            <div className="spec-search-container">
              <div className="form-group">
                <label htmlFor="specSearch">Spec Ara (min. 2 karakter)</label>
                <div style={{ position: 'relative', display: 'flex' }}>
                  <input
                    type="text"
                    id="specSearch"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Spec adını yazın..."
                    style={{ flexGrow: 1 }}
                  />
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    {searching ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <Search size={20} color="#aaa" />}
                  </div>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="spec-search-results">
                  {searchResults.map((spec) => (
                    <div
                      key={spec.id}
                      className="spec-search-item"
                      onClick={() => handleSelectSpec(spec)}
                    >
                      {spec.code}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSpec && (
              <div className="selected-spec">
                <div className="spec-info">
                  <h4>{selectedSpec.code}</h4>
                  <p>ID: {selectedSpec.id}</p>
                </div>
                <button className="remove-spec-button" onClick={handleRemoveSpec}>
                  <Trash2 size={16} /> Kaldır
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="add-product-right">
          <div className="add-product-section">
            <h3 className="section-title">Spec Özellikleri</h3>
            
            {!selectedSpecDetails ? (
              <p>Lütfen özelliklerini görmek için bir spec seçin.</p>
            ) : (
              <div className="characteristics-list">
                {selectedSpecDetails.characteristics.map((char) => (
                  <div key={char.id} className="characteristic-item">
                    <div className="characteristic-name">{char.name}</div>
                    <div className="characteristic-value">
                      {char.value ? (
                        <div className="readonly-value">{char.value}</div>
                      ) : (
                        <input
                          type="text"
                          value={editableCharacteristics.find(c => c.code === char.code)?.value || ''}
                          onChange={(e) => handleCharacteristicChange(char.code, e.target.value)}
                          placeholder="Değer girin..."
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="button-container">
              <button className="primary-button" onClick={handleCreateProduct}>
                Ürünü Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;