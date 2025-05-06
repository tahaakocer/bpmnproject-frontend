import React from 'react';
import '../styles/ProgressBar.css';

const ProgressBar = ({ step, totalSteps }) => {
  const steps = [
    { number: 1, label: "Kimlik Bilgileri" },
    { number: 2, label: "İletişim Bilgileri" },
    { number: 3, label: "Adres Bilgileri" },
    { number: 4, label: "Kimlik Bilgileri İnceleme" },
    { number: 5, label: "Ürün Seçimi" },
    { number: 6, label: "Sipariş Özeti" },
    { number: 7, label: "Tamamlandı" }
  ];

  return (
    <div className="progress-container">
      <div className="progress-bar">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div 
              className={`progress-step ${step >= s.number ? 'active' : ''} 
                          ${step > s.number ? 'completed' : ''}`}
            >
              <div className="step-number">{s.number}</div>
              <div className="step-label">{s.label}</div>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`progress-connector ${step > s.number ? 'active' : ''}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;