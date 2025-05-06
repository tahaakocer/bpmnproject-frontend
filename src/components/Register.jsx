import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/AuthStyles.css';
import '../styles/CommonStyles.css';

const Register = () => {
  const [formData, setFormData] = useState({
    tckn: '',
    firstName: '',
    lastName: '',
    birthYear: '',
    phoneNumber: '',
    email: '',
    password: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8484/api/crm/partner/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthYear: parseInt(formData.birthYear)
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Kayıt sırasında bir hata oluştu');
      }
      showNotification('success', 'Kayıt başarılı! Giriş yapabilirsiniz.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Kayıt Ol</h2>
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="notification-message">{notification.message}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="tckn">TCKN</label>
            <input
              type="text"
              id="tckn"
              name="tckn"
              value={formData.tckn}
              onChange={handleInputChange}
              placeholder="TCKN girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="firstName">Ad</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Adınızı girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="lastName">Soyad</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Soyadınızı girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="birthYear">Doğum Yılı</label>
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleInputChange}
              placeholder="Doğum yılınızı girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="phoneNumber">Telefon Numarası</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Telefon numaranızı girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="E-posta adresinizi girin"
              required
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
          <p className="auth-link">
            Zaten hesabınız var mı?{' '}
            <span onClick={() => navigate('/login')} className="auth-link-text">
              Giriş Yap
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;