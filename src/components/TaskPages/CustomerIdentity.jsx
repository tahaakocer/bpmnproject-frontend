import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
const CustomerIdentity = ({ onComplete, initialData, loading }) => {
  const [formData, setFormData] = useState({
    tckn: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        tckn: initialData.tckn || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || ''
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    
    // TC Kimlik No validasyonu
    if (!formData.tckn) {
      newErrors.tckn = 'TC Kimlik Numarası zorunludur';
    } else if (!/^\d{11}$/.test(formData.tckn)) {
      newErrors.tckn = 'TC Kimlik Numarası 11 rakamdan oluşmalıdır';
    }
    
    // Ad validasyonu
    if (!formData.firstName) {
      newErrors.firstName = 'Ad alanı zorunludur';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }
    
    // Soyad validasyonu
    if (!formData.lastName) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // TC Kimlik için sadece rakam girişine izin ver
    if (name === 'tckn' && !/^\d*$/.test(value)) {
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
      // TCKN'yi sayıya çevir
      const processedData = {
        ...formData,
        tckn: formData.tckn ? parseInt(formData.tckn, 10) : null
      };
      
      onComplete(processedData);
    }
  };

  return (
    <div className="form-step">
      <h2>Kişisel Bilgiler</h2>
      <p className="form-description">Lütfen kimlik bilgilerinizi giriniz.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tckn">TC Kimlik Numarası</label>
          <input
            type="text"
            id="tckn"
            name="tckn"
            value={formData.tckn}
            onChange={handleChange}
            maxLength={11}
            placeholder="11 haneli TC Kimlik Numarası"
            disabled={loading}
          />
          {errors.tckn && <span className="error-text">{errors.tckn}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="firstName">Ad</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Adınız"
            disabled={loading}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Soyad</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Soyadınız"
            disabled={loading}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'İşlem yapılıyor...' : 'Devam Et'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerIdentity;