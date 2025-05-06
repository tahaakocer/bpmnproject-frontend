import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Search, Trash2, Info } from 'lucide-react';
import { getAllAddons, getMainProducts, deleteAddon } from '../services/addonService';
import '../styles/AddonProductStyles.css';
import '../styles/ProductListStyles.css';
import '../styles/AddonListStyles.css';

const AddonList = () => {
  const [addons, setAddons] = useState([]);
  const [mainProducts, setMainProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAddons, setFilteredAddons] = useState([]);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState(null);
  
  // Bildirim mesajları
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Addonları ve ana ürünleri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ana ürünleri getir
        const mainProductsResponse = await getMainProducts();
        const mainProductsMap = {};
        
        if (mainProductsResponse.data) {
          mainProductsResponse.data.forEach(product => {
            mainProductsMap[product.id] = product;
          });
        }
        
        setMainProducts(mainProductsMap);
        
        // Tüm addonları getir
        const addonsResponse = await getAllAddons();
        if (addonsResponse.data) {
          setAddons(addonsResponse.data);
          setFilteredAddons(addonsResponse.data);
        }
      } catch (error) {
        console.error('Veri getirme hatası:', error);
        showNotification('error', 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery) {
      const filtered = addons.filter(addon => 
        addon.addonProduct.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        addon.addonProduct.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mainProducts[addon.mainProductId]?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mainProducts[addon.mainProductId]?.code || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAddons(filtered);
    } else {
      setFilteredAddons(addons);
    }
  }, [searchQuery, addons, mainProducts]);

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

  // Addon detayını görüntüle
  const handleViewAddon = (addon) => {
    setSelectedAddon(addon);
    setModalOpen(true);
  };

  // Addon silme modalını aç
  const handleOpenDeleteModal = (e, addon) => {
    e.stopPropagation();
    setAddonToDelete(addon);
    setDeleteModalOpen(true);
  };

  // Addon silme işlemi
  const handleDeleteAddon = async () => {
    if (!addonToDelete) return;
    
    try {
      setLoading(true);
      await deleteAddon(addonToDelete.id);
      
      // Addon listesini güncelle
      setAddons(addons.filter(a => a.id !== addonToDelete.id));
      setFilteredAddons(filteredAddons.filter(a => a.id !== addonToDelete.id));
      
      showNotification('success', `Addon bağlantısı başarıyla silindi`);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Addon silme hatası:', error);
      showNotification('error', 'Addon silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Modalleri kapat
  const closeModal = () => {
    setModalOpen(false);
    setSelectedAddon(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAddonToDelete(null);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="product-list-container">
      {notification.show && (
        <div className={`notification ${notification.type === 'success' ? 'success-notification' : 'error-notification'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div className="notification-message">{notification.message}</div>
          <button className="notification-close" onClick={handleCloseNotification}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="product-list-header">
        <h2 className="product-list-title">Addon Bağlantı Listesi</h2>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Addon veya ana ürün ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="search-icon" size={20} />
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      ) : filteredAddons.length > 0 ? (
        <div className="addon-list-table">
          <table>
            <thead>
              <tr>
                <th>Ana Ürün</th>
                <th>Addon Ürün</th>
                <th>Zorunlu</th>
                <th>Oluşturma Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAddons.map((addon) => (
                <tr key={addon.id} onClick={() => handleViewAddon(addon)}>
                  <td className="main-product-cell">
                    {mainProducts[addon.mainProductId] ? (
                      <>
                        <div className="product-name">{mainProducts[addon.mainProductId].name}</div>
                        <div className="product-code">{mainProducts[addon.mainProductId].code}</div>
                      </>
                    ) : (
                      <span className="not-available">Ana ürün bilgisi mevcut değil</span>
                    )}
                  </td>
                  <td className="addon-product-cell">
                    <div className="product-name">{addon.addonProduct.name}</div>
                    <div className="product-code">{addon.addonProduct.code}</div>
                  </td>
                  <td className="mandatory-cell">
                    <span className={`mandatory-badge ${addon.mandatory ? 'mandatory-yes' : 'mandatory-no'}`}>
                      {addon.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(addon.createDate)}</td>
                  <td className="actions-cell">
                    <button 
                      className="delete-button" 
                      onClick={(e) => handleOpenDeleteModal(e, addon)}
                    >
                      <Trash2 size={16} /> Sil
                    </button>
                    <button 
                      className="info-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAddon(addon);
                      }}
                    >
                      <Info size={16} /> Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-products-message">
          {searchQuery.length > 0 
            ? "Arama kriterlerine uygun addon bağlantısı bulunamadı." 
            : "Henüz bir addon bağlantısı bulunmuyor."}
        </div>
      )}

      {/* Addon Detay Modalı */}
      {modalOpen && selectedAddon && (
        <div className="product-detail-modal-backdrop" onClick={closeModal}>
          <div className="product-detail-content" onClick={e => e.stopPropagation()}>
            <div className="product-detail-header">
              <h2>Addon Detayları</h2>
              <button className="product-detail-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="product-detail-body">
              {/* Ana Ürün Bilgisi */}
              <div className="product-info-section">
                <h3>Ana Ürün</h3>
                {mainProducts[selectedAddon.mainProductId] ? (
                  <div className="product-info-grid">
                    <div className="product-attribute">
                      <div className="product-attribute-name">Ürün Adı</div>
                      <div className="product-attribute-value">{mainProducts[selectedAddon.mainProductId].name}</div>
                    </div>
                    <div className="product-attribute">
                      <div className="product-attribute-name">Ürün Kodu</div>
                      <div className="product-attribute-value">{mainProducts[selectedAddon.mainProductId].code}</div>
                    </div>
                  </div>
                ) : (
                  <p>Ana ürün bilgisi mevcut değil</p>
                )}
              </div>

              {/* Addon Ürün Bilgisi */}
              <div className="product-info-section">
                <h3>Addon Ürün</h3>
                <div className="product-info-grid">
                  <div className="product-attribute">
                    <div className="product-attribute-name">Ürün Adı</div>
                    <div className="product-attribute-value">{selectedAddon.addonProduct.name}</div>
                  </div>
                  <div className="product-attribute">
                    <div className="product-attribute-name">Ürün Kodu</div>
                    <div className="product-attribute-value">{selectedAddon.addonProduct.code}</div>
                  </div>
                  <div className="product-attribute">
                    <div className="product-attribute-name">Zorunlu</div>
                    <div className="product-attribute-value">
                      <span className={`mandatory-badge ${selectedAddon.mandatory ? 'mandatory-yes' : 'mandatory-no'}`}>
                        {selectedAddon.mandatory ? 'Zorunlu' : 'İsteğe Bağlı'}
                      </span>
                    </div>
                  </div>
                  <div className="product-attribute">
                    <div className="product-attribute-name">Oluşturma Tarihi</div>
                    <div className="product-attribute-value">{formatDate(selectedAddon.createDate)}</div>
                  </div>
                  <div className="product-attribute">
                    <div className="product-attribute-name">Son Güncelleme</div>
                    <div className="product-attribute-value">{formatDate(selectedAddon.updateDate)}</div>
                  </div>
                </div>
              </div>

              {/* Addon Ürün Özellikleri */}
              <div className="characteristics-section">
                <h3>Ürün Özellikleri</h3>
                {selectedAddon.addonProduct.specifications && selectedAddon.addonProduct.specifications.length > 0 ? (
                  selectedAddon.addonProduct.specifications.map(spec => (
                    <div key={spec.id} className="specification-section">
                      <h4>{spec.code}</h4>
                      {spec.characteristics && spec.characteristics.length > 0 ? (
                        <div className="characteristics-grid">
                          {spec.characteristics.map(char => (
                            <div key={char.id} className="characteristic-card">
                              <div className="characteristic-header">
                                <span className="characteristic-name">{char.name || char.code}</span>
                                <span className="characteristic-value">{char.value}</span>
                              </div>
                              <div className="characteristic-code">Kod: {char.code}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>Bu özelliğe ait karakteristik bulunamadı.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Bu ürüne ait özellik bulunamadı.</p>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="modal-delete-button" 
                  onClick={() => {
                    closeModal();
                    setAddonToDelete(selectedAddon);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={16} /> Bu Addon Bağlantısını Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Addon Bağlantısını Sil</h3>
              <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>{addonToDelete?.addonProduct.name}</strong> ürününün 
                <strong> {mainProducts[addonToDelete?.mainProductId]?.name || 'Ana ürün'}</strong> ile olan bağlantısını 
                silmek istediğinizden emin misiniz?
              </p>
              <p>Bu işlem geri alınamaz.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-button" onClick={closeDeleteModal}>İptal</button>
              <button className="modal-delete-button" onClick={handleDeleteAddon}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonList;