import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/FormStyles.css';
import '../styles/CommonStyles.css';
import { getOrderRequestByTckn } from '../services/userService';

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    tckn: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Input değişikliklerini handle etme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Sadece rakam girişine izin ver ve 11 karakter sınırla
    if (name === 'tckn') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 11) {
        setSearchData(prev => ({
          ...prev,
          [name]: numericValue
        }));
        setError(''); // Hata mesajını temizle
      }
    }
  };

  // TCKN doğrulama
  const validateTckn = (tckn) => {
    if (!tckn) return 'TCKN gereklidir';
    if (tckn.length !== 11) return 'TCKN 11 haneli olmalıdır';
    if (tckn[0] === '0') return 'TCKN sıfır ile başlayamaz';
    
    // TCKN algoritması kontrolü (Türkiye TC Kimlik No algoritması)
    const digits = tckn.split('').map(Number);
    
    // İlk 9 hanenin toplamı
    const sum9 = digits.slice(0, 9).reduce((sum, digit) => sum + digit, 0);
    
    // Tek pozisyonlardaki rakamların toplamı (1,3,5,7,9. haneler)
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    
    // Çift pozisyonlardaki rakamların toplamı (2,4,6,8. haneler)
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    // 10. hane kontrolü: (tek pozisyonlar toplamı * 7 - çift pozisyonlar toplamı) mod 10
    const check10 = ((oddSum * 7) - evenSum) % 10;
    if (check10 !== digits[9]) {
      return 'Geçersiz TCKN formatı';
    }
    
    // 11. hane kontrolü: (ilk 10 hanenin toplamı) mod 10
    const check11 = (sum9 + digits[9]) % 10;
    if (check11 !== digits[10]) {
      return 'Geçersiz TCKN formatı';
    }
    
    return null;
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

  // Kullanıcı arama işlemi
  const handleSearch = async (e) => {
    e.preventDefault();
    
    // TCKN doğrulama
    const tcknError = validateTckn(searchData.tckn);
    if (tcknError) {
      setError(tcknError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await getOrderRequestByTckn(searchData.tckn);
      
      if (response && response.data) {
        showNotification('success', 'Kullanıcı başarıyla bulundu!');
        
        // Kullanıcı bilgilerini ikinci sayfaya göndermek için navigate et
        setTimeout(() => {
          navigate('/kullanici-detay', { 
            state: { 
              userData: response.data,
              searchTckn: searchData.tckn
            } 
          });
        }, 1000);
      } else {
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      console.error('Kullanıcı arama hatası:', err);
      
      if (err.response?.status === 404) {
        setError('Bu TCKN ile kayıtlı kullanıcı bulunamadı');
      } else if (err.response?.status === 400) {
        setError('Geçersiz TCKN formatı');
      } else {
        setError('Kullanıcı arama sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Formu temizleme
  const handleClear = () => {
    setSearchData({ tckn: '' });
    setError('');
    setNotification({ show: false, type: '', message: '' });
  };

  return (
    <div className="main-content">
      <div className="form-container">
        {/* Bildirim */}
        {notification.show && (
          <div className={`notification ${notification.type === 'success' ? 'success' : 'error'}`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <div className="notification-message">{notification.message}</div>
            <button 
              className="notification-close" 
              onClick={() => setNotification({ show: false, type: '', message: '' })}
            >
              ×
            </button>
          </div>
        )}

        <div className="form-content">
          <div className="form-step">
            <h2>
              <User size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Kullanıcı Arama
            </h2>
            <p className="form-description">
              Mevcut sipariş bilgilerini görüntülemek için TCKN numarasını girin.
            </p>

            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="tckn">
                  TCKN <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  id="tckn"
                  name="tckn"
                  value={searchData.tckn}
                  onChange={handleInputChange}
                  placeholder="TCKN numarasını girin (11 hane)"
                  maxLength={11}
                  disabled={loading}
                  style={{
                    borderColor: error ? 'var(--error-color)' : '',
                    backgroundColor: loading ? '#f5f5f5' : ''
                  }}
                />
                {error && (
                  <span className="error-text">
                    <AlertCircle size={14} style={{ marginRight: '5px' }} />
                    {error}
                  </span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Temizle
                </button>
                
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading || !searchData.tckn || searchData.tckn.length !== 11}
                >
                  <Search size={16} style={{ marginRight: '8px' }} />
                  {loading ? 'Aranıyor...' : 'Kullanıcı Ara'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;