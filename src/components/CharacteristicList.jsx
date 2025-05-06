import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Info,
  Edit
} from 'lucide-react';
import '../styles/ProductListStyles.css';
import '../styles/CharacteristicStyles.css';
import { 
  getAllCharacteristics, 
  createCharacteristic, 
  deleteCharacteristic,
  getCharacteristicByCode
} from '../services/characteristicService';

const CharacteristicList = () => {
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCharacteristics, setFilteredCharacteristics] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [characteristicToDelete, setCharacteristicToDelete] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    value: '',
    sourceType: 'productCharacteristic'
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Özellikleri getir
  useEffect(() => {
    fetchCharacteristics();
  }, []);

  // Arama işlevi
  useEffect(() => {
    if (searchQuery) {
      const filtered = characteristics.filter(char => 
        char.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        char.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.value?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCharacteristics(filtered);
    } else {
      setFilteredCharacteristics(characteristics);
    }
  }, [searchQuery, characteristics]);

  const fetchCharacteristics = async () => {
    try {
      setLoading(true);
      const response = await getAllCharacteristics();
      setCharacteristics(response.data || []);
      setFilteredCharacteristics(response.data || []);
    } catch (error) {
      console.error('Karakteristikleri getirme hatası:', error);
      showNotification('error', 'Karakteristikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openDeleteModal = (characteristic) => {
    setCharacteristicToDelete(characteristic);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCharacteristicToDelete(null);
  };

  const handleDeleteCharacteristic = async () => {
    if (!characteristicToDelete) return;

    try {
      await deleteCharacteristic(characteristicToDelete.id);
      
      // Özellik listesini güncelle
      setCharacteristics(characteristics.filter(c => c.id !== characteristicToDelete.id));
      setFilteredCharacteristics(filteredCharacteristics.filter(c => c.id !== characteristicToDelete.id));
      
      showNotification('success', `"${characteristicToDelete.name}" özelliği başarıyla silindi`);
      closeDeleteModal();
    } catch (error) {
      console.error('Karakteristikler silme hatası:', error);
      showNotification('error', 'Karakteristikler silinirken bir hata oluştu');
    }
  };

  const openCreateModal = () => {
    setFormData({
      code: '',
      name: '',
      value: '',
      sourceType: 'productCharacteristic'
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCharacteristic = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.sourceType) {
      showNotification('error', 'Lütfen gerekli alanları doldurun');
      return;
    }

    try {
      const response = await createCharacteristic(formData);
      
      // Yeni özelliği listeye ekle
      setCharacteristics(prev => [...prev, response.data]);
      setFilteredCharacteristics(prev => [...prev, response.data]);
      
      showNotification('success', `"${formData.name}" özelliği başarıyla oluşturuldu`);
      closeCreateModal();
    } catch (error) {
      console.error('vKarakteristikleri oluşturma hatası:', error);
      showNotification('error', 'Karakteristikleri oluşturulurken bir hata oluştu');
    }
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

  // Tarih formatı
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
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
        <h2 className="product-list-title">Karakteristik Listesi</h2>
        <div className="product-list-actions">
          <button className="primary-button" onClick={openCreateModal}>
            <Plus size={16} /> Yeni Karakteristik Ekle
          </button>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Özellik ara..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Search className="search-icon" size={20} />
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Özellikler yükleniyor...</p>
        </div>
      ) : filteredCharacteristics.length > 0 ? (
        <div className="characteristic-list-table">
          <table>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Ad</th>
                <th>Değer</th>
                <th>Kaynak Tipi</th>
                <th>Oluşturulma Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharacteristics.map((characteristic) => (
                <tr key={characteristic.id}>
                  <td className="characteristic-code">{characteristic.code}</td>
                  <td className="characteristic-name">{characteristic.name}</td>
                  <td className="characteristic-value">{characteristic.value || "-"}</td>
                  <td className="characteristic-source">{characteristic.sourceType}</td>
                  <td className="characteristic-date">{formatDate(characteristic.createDate)}</td>
                  <td className="actions-cell">
                    <button 
                      className="delete-button" 
                      onClick={() => openDeleteModal(characteristic)}
                    >
                      <Trash2 size={16} /> Sil
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
            ? "Arama kriterlerine uygun özellik bulunamadı." 
            : "Henüz bir özellik bulunmuyor. Yeni bir özellik ekleyin."
          }
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Özelliği Sil</h3>
              <button className="modal-close-button" onClick={closeDeleteModal}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>{characteristicToDelete?.name}</strong> özelliğini silmek istediğinizden emin misiniz?
              </p>
              <p>Bu işlem geri alınamaz.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-button" onClick={closeDeleteModal}>İptal</button>
              <button className="modal-delete-button" onClick={handleDeleteCharacteristic}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Oluşturma Modalı */}
      {createModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Yeni Özellik Ekle</h3>
              <button className="modal-close-button" onClick={closeCreateModal}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCharacteristic}>
                <div className="form-group">
                  <label htmlFor="code">Kod *</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Örn: downloadSpeed"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Ad *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Örn: İndirme Hızı"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="value">Değer</label>
                  <input
                    type="text"
                    id="value"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="Örn: 100Mbps"
                  />
                </div>
                 <div className="form-group">
                  <label htmlFor="sourceType">Kaynak Tipi *</label>
                  <select
                    id="sourceType"
                    name="sourceType"
                    value={formData.sourceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="productCharacteristic">product</option>
                    <option value="provisionCharacteristic">provision</option>
                  </select>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="modal-cancel-button" onClick={closeCreateModal}>İptal</button>
                  <button type="submit" className="primary-button">Oluştur</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacteristicList;