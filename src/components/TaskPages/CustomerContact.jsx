import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
import { sendMessage } from '../../services/taskService';

const CustomerContact = ({ onComplete, initialData, orderData, loading, onGoBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber ? String(initialData.phoneNumber) : ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    // Email validasyonu
    if (!formData.email) {
      newErrors.email = 'Email adresi zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }
    
    // Telefon numarası validasyonu
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Telefon numarası zorunludur';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Telefon numarası 10 rakamdan oluşmalıdır (Başında 0 olmadan)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Telefon numarası için sadece rakam girişine izin ver
    if (name === 'phoneNumber' && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Anlık validasyon için hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Telefon numarasını sayıya çevir
      const processedData = {
        ...formData,
        phoneNumber: formData.phoneNumber ? parseInt(formData.phoneNumber, 10) : null
      };
      
      onComplete(processedData);
    }
  };
  
  // Önceki adıma dönmek için mesaj gönderme işlemi
  const handleGoBack = async () => {
    try {
      setLocalLoading(true);
      // orderData'dan processInstanceId'yi alın
      const processInstanceId = orderData?.data?.processInstanceId;
      
      if (!processInstanceId) {
        console.error('Process Instance ID bulunamadı');
        return;
      }
      
      console.log('Geri dönüş mesajı gönderiliyor. ProcessInstanceId:', processInstanceId);
      
      // Önceki task'a dönmek için mesaj gönder
      const messageResponse = await sendMessage(processInstanceId, "backToIdentity");
      console.log('Mesaj gönderme işlemi sonucu:', messageResponse);
      
      // Üst component'e bildirerek task bilgisinin güncellenmesini sağla
      if (onGoBack) {
        onGoBack();
      }
    } catch (error) {
      console.error('Önceki adıma dönme hatası:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="form-step">
      <h2>İletişim Bilgileri</h2>
      <p className="form-description">Lütfen iletişim bilgilerinizi giriniz.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Adresi</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ornek@mail.com"
            disabled={loading || localLoading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Telefon Numarası</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="5xxxxxxxxx (10 hane, başında 0 olmadan)"
            maxLength={10}
            disabled={loading || localLoading}
          />
          {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
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
            type="submit" 
            className="primary-button"
            disabled={loading || localLoading}
          >
            {loading || localLoading ? 'İşlem yapılıyor...' : 'Devam Et'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerContact;