import React, { useState } from 'react';
import '../../styles/FormStyles.css';
import { sendMessage } from '../../services/taskService';

const CustomerReview = ({ onComplete, customerData, loading, orderData, onGoBack }) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({}); // Bilgileri onaylayarak devam et
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
      const messageResponse = await sendMessage(processInstanceId, "backToAddress");
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
      <h2>Bilgileri İnceleyin</h2>
      <p className="form-description">Lütfen girdiğiniz bilgileri kontrol edin ve onaylayın.</p>
      
      <div className="review-container">
        <div className="review-section">
          <h3>Kişisel Bilgiler</h3>
          <div className="review-item">
            <span className="review-label">TC Kimlik No:</span>
            <span className="review-value">{customerData.tckn}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Ad:</span>
            <span className="review-value">{customerData.firstName}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Soyad:</span>
            <span className="review-value">{customerData.lastName}</span>
          </div>
        </div>
        
        <div className="review-section">
          <h3>İletişim Bilgileri</h3>
          <div className="review-item">
            <span className="review-label">E-posta:</span>
            <span className="review-value">{customerData.email}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Telefon:</span>
            <span className="review-value">{customerData.phoneNumber}</span>
          </div>
        </div>
        
        <div className="review-section">
          <h3>Adres Bilgileri</h3>
          <div className="review-item">
            <span className="review-label">Adres:</span>
            <span className="review-value">{customerData.formattedAddress}</span>
          </div>
          {customerData.bbk && (
            <div className="review-item">
              <span className="review-label">BBK Kodu:</span>
              <span className="review-value">{customerData.bbk}</span>
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
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
            {loading || localLoading ? 'İşlem yapılıyor...' : 'Bilgileri Onayla ve Tamamla'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerReview;