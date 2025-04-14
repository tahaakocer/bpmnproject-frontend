import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
import { sendMessage } from '../../services/taskService';

const CustomerAddress = ({ onComplete, initialData, loading, orderData, onGoBack }) => {
  const [formData, setFormData] = useState({
    formattedAddress: '',
    bbk: ''
  });
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        formattedAddress: initialData.formattedAddress || '',
        bbk: initialData.bbk ? String(initialData.bbk) : ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    // Adres validasyonu
    if (!formData.formattedAddress) {
      newErrors.formattedAddress = 'Adres alanı zorunludur';
    } else if (formData.formattedAddress.length < 10) {
      newErrors.formattedAddress = 'Adres en az 10 karakter olmalıdır';
    }
    
    // BBK (isteğe bağlı olarak eklenmiş)
    if (formData.bbk && !/^\d+$/.test(formData.bbk)) {
      newErrors.bbk = 'BBK sadece rakamlardan oluşmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // BBK için sadece rakam girişine izin ver
    if (name === 'bbk' && !/^\d*$/.test(value)) {
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
      // BBK'yı sayıya çevir (eğer varsa)
      const processedData = {
        ...formData,
        bbk: formData.bbk ? parseInt(formData.bbk, 10) : null
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
      const messageResponse = await sendMessage(processInstanceId, "backToContact");
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
      <h2>Adres Bilgileri</h2>
      <p className="form-description">Lütfen adres bilgilerinizi giriniz.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="formattedAddress">Açık Adres</label>
          <textarea
            id="formattedAddress"
            name="formattedAddress"
            value={formData.formattedAddress}
            onChange={handleChange}
            placeholder="Adresinizi giriniz"
            rows={4}
            disabled={loading || localLoading}
          />
          {errors.formattedAddress && <span className="error-text">{errors.formattedAddress}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="bbk">BBK Kodu (İsteğe Bağlı)</label>
          <input
            type="text"
            id="bbk"
            name="bbk"
            value={formData.bbk}
            onChange={handleChange}
            placeholder="BBK kodunuz"
            disabled={loading || localLoading}
          />
          {errors.bbk && <span className="error-text">{errors.bbk}</span>}
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

export default CustomerAddress;