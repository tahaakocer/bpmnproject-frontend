import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Search, Plus, Edit, Check, Trash2 } from 'lucide-react';
import '../styles/FormStyles.css';
import '../styles/AddProductStyles.css';
import '../styles/AddonProductStyles.css';
import { 
  getMainProducts, 
  getAddonProducts, 
  createAddon,
  getAddonsForMainProduct,
  deleteAddon
} from '../services/addonService';

const AddonProductPage = () => {
  // Ana ürün ve addon ürün durum yönetimi
  const [mainProducts, setMainProducts] = useState([]);
  const [addonProducts, setAddonProducts] = useState([]);
  const [selectedMainProduct, setSelectedMainProduct] = useState(null);
  const [selectedAddonProducts, setSelectedAddonProducts] = useState([]);
  const [existingAddons, setExistingAddons] = useState([]);
  
  // Durum bilgileri
  const [loading, setLoading] = useState(false);
  const [mainProductsLoading, setMainProductsLoading] = useState(false);
  const [addonProductsLoading, setAddonProductsLoading] = useState(false);
  const [existingAddonsLoading, setExistingAddonsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAddonProducts, setFilteredAddonProducts] = useState([]);
  
  // Düzenleme
  const [editingAddonIndex, setEditingAddonIndex] = useState(null);
  const [editableCharacteristics, setEditableCharacteristics] = useState([]);
  
  // Bildirim mesajları
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Ana ürünleri ve addon ürünleri getir
  useEffect(() => {
    fetchMainProducts();
    fetchAddonProducts();
  }, []);

  // Seçilen ana ürün değiştiğinde mevcut addon'ları getir
  useEffect(() => {
    if (selectedMainProduct) {
      fetchExistingAddons(selectedMainProduct.id);
    } else {
      setExistingAddons([]);
    }
  }, [selectedMainProduct]);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery) {
      const filtered = addonProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAddonProducts(filtered);
    } else {
      setFilteredAddonProducts(addonProducts);
    }
  }, [searchQuery, addonProducts]);

  // Ana ürünleri getir
  const fetchMainProducts = async () => {
    try {
      setMainProductsLoading(true);
      const response = await getMainProducts();
      setMainProducts(response.data || []);
    } catch (error) {
      console.error('Ana ürünleri getirme hatası:', error);
      showNotification('error', 'Ana ürünler yüklenirken bir hata oluştu');
    } finally {
      setMainProductsLoading(false);
    }
  };

  // Addon ürünleri getir
  const fetchAddonProducts = async () => {
    try {
      setAddonProductsLoading(true);
      const response = await getAddonProducts();
      setAddonProducts(response.data || []);
      setFilteredAddonProducts(response.data || []);
    } catch (error) {
      console.error('Addon ürünleri getirme hatası:', error);
      showNotification('error', 'Addon ürünler yüklenirken bir hata oluştu');
    } finally {
      setAddonProductsLoading(false);
    }
  };

  // Mevcut addon'ları getir
  const fetchExistingAddons = async (mainProductId) => {
    try {
      setExistingAddonsLoading(true);
      const response = await getAddonsForMainProduct(mainProductId);
      setExistingAddons(response.data || []);
    } catch (error) {
      console.error('Mevcut addonları getirme hatası:', error);
      showNotification('error', 'Mevcut addonlar yüklenirken bir hata oluştu');
    } finally {
      setExistingAddonsLoading(false);
    }
  };

  // Ana ürün seçimi
  const handleMainProductSelect = (product) => {
    setSelectedMainProduct(product);
  };

  // Addon ürün seçimi
  const handleAddonProductSelect = (product) => {
    // Eğer ürün zaten seçili ise listeden çıkar
    const existingIndex = selectedAddonProducts.findIndex(p => p.product.id === product.id);
    
    if (existingIndex >= 0) {
      const newSelected = [...selectedAddonProducts];
      newSelected.splice(existingIndex, 1);
      setSelectedAddonProducts(newSelected);
    } else {
      // Ürünü seçili listeye ekle
      setSelectedAddonProducts([...selectedAddonProducts, {
        product,
        mandatory: false,
        editedCharacteristics: product.specifications?.flatMap(spec => 
          spec.characteristics?.map(char => ({
            specCode: spec.code,
            code: char.code, 
            name: char.name, 
            value: char.value || ''
          })) || []
        ) || []
      }]);
    }
  };

  // Addon ürünün zorunlu/isteğe bağlı durumu değiştirildiğinde
  const handleMandatoryToggle = (index) => {
    const newSelected = [...selectedAddonProducts];
    newSelected[index].mandatory = !newSelected[index].mandatory;
    setSelectedAddonProducts(newSelected);
  };

  // Addon ürün düzenleme modunu aç
  const handleEditAddon = (index) => {
    setEditingAddonIndex(index);
    setEditableCharacteristics([...selectedAddonProducts[index].editedCharacteristics]);
  };

  // Karakteristik düzenleme
  const handleCharacteristicChange = (index, value) => {
    const newCharacteristics = [...editableCharacteristics];
    newCharacteristics[index].value = value;
    setEditableCharacteristics(newCharacteristics);
  };

  // Düzenlemeyi kaydet
  const handleSaveEdit = () => {
    const newSelected = [...selectedAddonProducts];
    newSelected[editingAddonIndex].editedCharacteristics = [...editableCharacteristics];
    setSelectedAddonProducts(newSelected);
    setEditingAddonIndex(null);
  };

  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setEditingAddonIndex(null);
  };

  // Addon ürünü kaydet
  const handleSaveAddon = async (addonIndex) => {
    if (!selectedMainProduct) {
      showNotification('error', 'Lütfen bir ana ürün seçin');
      return;
    }

    const addonInfo = selectedAddonProducts[addonIndex];
    const addonProduct = addonInfo.product;

    try {
      setLoading(true);
      
      // Düzenlenmiş karakteristikleri uygun formata getir
      const specifications = [];
      
      // Karakteristikleri spec bazında grupla
      const specGroups = {};
      addonInfo.editedCharacteristics.forEach(char => {
        if (!specGroups[char.specCode]) {
          specGroups[char.specCode] = [];
        }
        if (char.value) { // Sadece değeri olan karakteristikleri ekle
          specGroups[char.specCode].push({
            code: char.code,
            value: char.value
          });
        }
      });
      
      // Grupları specifications dizisine dönüştür
      Object.keys(specGroups).forEach(specCode => {
        if (specGroups[specCode].length > 0) {
          specifications.push({
            code: specCode,
            characteristics: specGroups[specCode]
          });
        }
      });
      
      // Eğer hiç specification yoksa, boş bir tane ekle
      if (specifications.length === 0) {
        specifications.push({
          characteristics: []
        });
      }
      
      const requestBody = {
        mainProductId: selectedMainProduct.id,
        addonProductId: addonProduct.id,
        addonProduct: {
          specifications: specifications
        },
        mandatory: addonInfo.mandatory
      };
      
      console.log('Addon ekleme isteği:', requestBody);
      
      const response = await createAddon(requestBody);
      console.log('Addon ekleme başarılı:', response.data);
      
      showNotification('success', `${addonProduct.name} ürünü ana ürüne başarıyla eklendi`);
      
      // Eklenen ürünü listeden çıkar
      const newSelected = [...selectedAddonProducts];
      newSelected.splice(addonIndex, 1);
      setSelectedAddonProducts(newSelected);
      
      // Mevcut addon'ları yeniden getir
      await fetchExistingAddons(selectedMainProduct.id);
      
    } catch (error) {
      console.error('Addon ekleme hatası:', error);
      showNotification('error', 'Addon ürün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Addon silme
  const handleDeleteAddon = async (addonId, addonName) => {
    try {
      setLoading(true);
      await deleteAddon(addonId);
      showNotification('success', `${addonName} addon ürünü başarıyla silindi`);
      // Mevcut addon'ları yeniden getir
      await fetchExistingAddons(selectedMainProduct.id);
    } catch (error) {
      console.error('Addon silme hatası:', error);
      showNotification('error', 'Addon ürün silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
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

  // Bildirim kapatma
  const handleCloseNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  return (
    <div className="add-product-container">
      {notification.show && (
        <div className={`notification ${notification.type === 'success' ? 'success-notification' : 'error-notification'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div className="notification-message">{notification.message}</div>
          <button className="notification-close" onClick={handleCloseNotification}>
            <X size={16} />
          </button>
        </div>
      )}

      <h2>Addon Ürün Ekleme</h2>
      <div className="add-product-grid">
        <div className="add-product-left">
          <div className="add-product-section">
            <h3 className="section-title">Ana Ürün Seçimi</h3>
            {mainProductsLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Ana ürünler yükleniyor...</p>
              </div>
            ) : mainProducts.length === 0 ? (
              <p>Hiç ana ürün bulunamadı.</p>
            ) : (
              <div className="main-product-list">
                {mainProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`main-product-item ${selectedMainProduct?.id === product.id ? 'selected' : ''}`}
                    onClick={() => handleMainProductSelect(product)}
                  >
                    <div className="main-product-info">
                      <h4>{product.name}</h4>
                      <div className="main-product-code">Kod: {product.code}</div>
                    </div>
                    {selectedMainProduct?.id === product.id && (
                      <div className="selected-icon"><Check size={16} /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-product-section">
            <h3 className="section-title">Addon Ürün Seçimi</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Addon ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" size={20} />
            </div>

            {addonProductsLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Addon ürünler yükleniyor...</p>
              </div>
            ) : filteredAddonProducts.length === 0 ? (
              <p>Hiç addon ürün bulunamadı.</p>
            ) : (
              <div className="addon-product-list">
                {filteredAddonProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`addon-product-item ${selectedAddonProducts.some(p => p.product.id === product.id) ? 'selected' : ''}`}
                    onClick={() => handleAddonProductSelect(product)}
                  >
                    <div className="addon-product-info">
                      <h4>{product.name}</h4>
                      <div className="addon-product-code">Kod: {product.code}</div>
                    </div>
                    {selectedAddonProducts.some(p => p.product.id === product.id) && (
                      <div className="selected-icon"><Check size={16} /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="add-product-right">
          <div className="add-product-section">
            <h3 className="section-title">Seçilen Ürünler</h3>
            
            {!selectedMainProduct ? (
              <div className="no-selection-message">
                <p>Lütfen sol taraftan bir ana ürün seçin.</p>
              </div>
            ) : (
              <div className="selected-product-container">
                <div className="selected-main-product">
                  <h4>Ana Ürün:</h4>
                  <div className="selected-main-product-details">
                    <div className="product-name">{selectedMainProduct.name}</div>
                    <div className="product-code">Kod: {selectedMainProduct.code}</div>
                  </div>
                </div>

                <h4 className="selected-addons-title">
                  Mevcut Addon Ürünler:
                  <span className="selected-count">{existingAddons.length}</span>
                </h4>

                {existingAddonsLoading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Mevcut addon ürünler yükleniyor...</p>
                  </div>
                ) : existingAddons.length === 0 ? (
                  <div className="no-addons-message">
                    <p>Bu ana ürüne ait addon ürün bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="selected-addons-list">
                    {existingAddons.map(addon => (
                      <div key={addon.id} className="selected-addon-item">
                        <div className="addon-details">
                          <div className="addon-header">
                            <div className="addon-info">
                              <h5>{addon.addonProduct.name}</h5>
                              <div className="addon-code">Kod: {addon.addonProduct.code}</div>
                            </div>
                            <div className="addon-actions">
                              <button 
                                className={`mandatory-toggle ${addon.mandatory ? 'mandatory' : ''}`}
                                disabled
                              >
                                {addon.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                              </button>
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteAddon(addon.id, addon.addonProduct.name)}
                                disabled={loading}
                              >
                                <Trash2 size={16} /> Sil
                              </button>
                            </div>
                          </div>
                          
                          <div className="addon-characteristics">
                            {addon.addonProduct.specifications?.length === 0 ? (
                              <p className="no-chars">Karakteristik bulunmamaktadır.</p>
                            ) : (
                              <div className="char-summary">
                                {addon.addonProduct.specifications.flatMap(spec =>
                                  spec.characteristics?.filter(char => char.value).map(char => (
                                    <div key={char.code} className="char-item">
                                      <span className="char-name">{char.name || char.code}:</span>
                                      <span className="char-value">{char.value}</span>
                                    </div>
                                  ))
                                )}
                                {addon.addonProduct.specifications.every(spec => 
                                  !spec.characteristics || spec.characteristics.every(char => !char.value)
                                ) && (
                                  <p className="no-chars">Ayarlanmış karakteristik bulunmuyor.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h4 className="selected-addons-title">
                  Yeni Seçilen Addon Ürünler:
                  <span className="selected-count">{selectedAddonProducts.length}</span>
                </h4>

                {selectedAddonProducts.length === 0 ? (
                  <div className="no-addons-message">
                    <p>Henüz bir addon ürün seçilmedi.</p>
                  </div>
                ) : (
                  <div className="selected-addons-list">
                    {selectedAddonProducts.map((addonInfo, index) => (
                      <div key={addonInfo.product.id} className="selected-addon-item">
                        {editingAddonIndex === index ? (
                          // Düzenleme modu
                          <div className="editing-addon">
                            <div className="editing-addon-header">
                              <h5>{addonInfo.product.name} - Düzenleme</h5>
                              <div className="editing-addon-actions">
                                <button 
                                  className="save-button" 
                                  onClick={handleSaveEdit}
                                >
                                  <Check size={16} /> Kaydet
                                </button>
                                <button 
                                  className="cancel-button" 
                                  onClick={handleCancelEdit}
                                >
                                  <X size={16} /> İptal
                                </button>
                              </div>
                            </div>
                            
                            <div className="characteristics-list">
                              {editableCharacteristics.length === 0 ? (
                                <p>Bu ürünün düzenlenebilir karakteristiği bulunmamaktadır.</p>
                              ) : (
                                editableCharacteristics.map((char, charIndex) => (
                                  <div key={char.code} className="characteristic-item">
                                    <div className="characteristic-name">{char.name || char.code}</div>
                                    <div className="characteristic-value">
                                      <input
                                        type="text"
                                        value={char.value || ''}
                                        onChange={(e) => handleCharacteristicChange(charIndex, e.target.value)}
                                        placeholder="Değer girin..."
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ) : (
                          // Normal görünüm
                          <div className="addon-details">
                            <div className="addon-header">
                              <div className="addon-info">
                                <h5>{addonInfo.product.name}</h5>
                                <div className="addon-code">Kod: {addonInfo.product.code}</div>
                              </div>
                              <div className="addon-actions">
                                <button 
                                  className="edit-button" 
                                  onClick={() => handleEditAddon(index)}
                                >
                                  <Edit size={16} /> Düzenle
                                </button>
                                <button 
                                  className={`mandatory-toggle ${addonInfo.mandatory ? 'mandatory' : ''}`}
                                  onClick={() => handleMandatoryToggle(index)}
                                >
                                  {addonInfo.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                                </button>
                              </div>
                            </div>
                            
                            <div className="addon-characteristics">
                              {addonInfo.editedCharacteristics.length === 0 ? (
                                <p className="no-chars">Karakteristik bulunmamaktadır.</p>
                              ) : (
                                <div className="char-summary">
                                  {addonInfo.editedCharacteristics
                                    .filter(char => char.value)
                                    .map(char => (
                                      <div key={char.code} className="char-item">
                                        <span className="char-name">{char.name || char.code}:</span>
                                        <span className="char-value">{char.value}</span>
                                      </div>
                                    ))}
                                  
                                  {addonInfo.editedCharacteristics.filter(char => char.value).length === 0 && (
                                    <p className="no-chars">Ayarlanmış karakteristik bulunmuyor.</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="addon-footer">
                              <button 
                                className="save-addon-button"
                                onClick={() => handleSaveAddon(index)}
                                disabled={loading}
                              >
                                <Plus size={16} />
                                {loading ? 'Kaydediliyor...' : 'Ana Ürüne Ekle'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonProductPage;