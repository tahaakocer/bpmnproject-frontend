// MaxSpeedInfo.jsx - CustomerAddProduct için güncellenmiş bileşen

import React from 'react';
import { Wifi } from 'lucide-react';

const MaxSpeedInfo = ({ speedInfo }) => {
  if (!speedInfo) return null;

  // Hangi bağlantı tiplerinin mevcut olduğunu kontrol et
  const hasFiber = speedInfo.hasFiber;
  const hasVdsl = speedInfo.hasVdsl;
  const hasAdsl = speedInfo.hasAdsl;
  
  // En iyi bağlantı tipini belirle (öncelik: Fiber > VDSL > ADSL)
  let connectionType = '';
  if (hasFiber) {
    connectionType = 'Fiber';
  } else if (hasVdsl) {
    connectionType = 'VDSL';
  } else if (hasAdsl) {
    connectionType = 'ADSL';
  } else {
    return null; // Hiçbir bağlantı tipi yoksa bilgi gösterme
  }

  return (
    <div className="max-speed-info">
      <div className="max-speed-header">
        <Wifi size={18} />
        <h3>Adresinizde Mevcut İnternet Altyapısı</h3>
      </div>
      <div className="max-speed-content">
        <div className="speed-type">{connectionType}</div>
        <div className="speed-value">{speedInfo.maxSpeed} Mbps</div>
        <div className="speed-description">
          Bu lokasyonda alabileceğiniz maksimum internet hızı
        </div>
      </div>
    </div>
  );
};

export default MaxSpeedInfo;