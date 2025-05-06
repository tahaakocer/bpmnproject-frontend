import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
import '../../styles/CommonStyles.css';
import { AlertCircle } from 'lucide-react';

const CustomerMernisFeedback = ({ onComplete, initialData, loading, orderData }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  // Task tamamlama işlemini ele alan fonksiyon
  const handleContinue = async () => {
    try {
      setLocalLoading(true);
      setError(null);
      
      // Doğrudan onComplete fonksiyonunu çağırıyoruz
      // completeTask işlemi Ana bileşende (App.js) handleCompleteStep içinde yapılıyor
      onComplete({});
      
    } catch (err) {
      console.error('İşlem sırasında bir hata oluştu:', err);
      setError('İşlem sırasında bir hata oluştu: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="form-step">
      <h2>Kimlik Doğrulama Hatası</h2>
      <p className="form-description">Girilen kimlik bilgileri Mernis sisteminde doğrulanamadı.</p>
     
      <div className="error-banner">
        <AlertCircle size={16} />
        TC Kimlik numarası, ad, soyad veya doğum yılı bilgilerinizden en az biri hatalıdır.
        Lütfen kimlik bilgilerinizi kontrol edip tekrar girmeyi deneyiniz.
      </div>
     
      <div className="mernis-feedback-content">
        <div className="mernis-feedback-section">
          <h3>Olası Hata Nedenleri:</h3>
          <ul>
            <li>TC Kimlik numarası hatalı veya başka bir kişiye ait olabilir</li>
            <li>Ad ve soyad bilgileriniz nüfus kayıtlarıyla eşleşmiyor olabilir</li>
            <li>Doğum yılı bilgisi hatalı girilmiş olabilir</li>
            <li>Sistem kaynaklı geçici bir sorun olabilir</li>
          </ul>
        </div>
       
        <div className="mernis-feedback-section">
          <h3>Ne yapmalıyım?</h3>
          <p>
            Kimlik bilgilerinizi kontrol edip tekrar giriş yapabilirsiniz.
            Bilgilerinizin doğru olduğundan eminseniz ve sorun devam ediyorsa,
            lütfen müşteri hizmetleri ile iletişime geçiniz.
          </p>
        </div>
      </div>
     
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} /> {error}
        </div>
      )}
     
      <div className="form-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleContinue}
          disabled={loading || localLoading}
        >
          {loading || localLoading ? 'İşlem yapılıyor...' : 'Bilgilerimi Tekrar Gir'}
        </button>
      </div>
    </div>
  );
};

export default CustomerMernisFeedback;