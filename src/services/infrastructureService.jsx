import api from './apiClient';

// BBK kodu ile altyapı bilgisini getir
export const getInfrastructureInfo = async (bbkCode) => {
  try {
    const response = await api.get(`http://localhost:8383/api/bbk-service/infrastructure`, {
      params: { bbkCode }
    });
    
    if (response.data) {
      const infraData = response.data;
      
      // MaxSpeed bilgisini Mbit'e çevir (1000'e bölerek)
      if (infraData.MaxSpeed) {
        const maxSpeedMbit = Math.floor(parseInt(infraData.MaxSpeed) / 1000);
        infraData.maxSpeedMbit = maxSpeedMbit;
      }
      
      // Altyapı tipine göre hazır data oluştur
      const result = {
        maxSpeed: infraData.maxSpeedMbit || 0,
        svuId: infraData.SVUID,
        hasAdsl: infraData.ADSL && infraData.ADSL.PortState === "VAR",
        hasVdsl: infraData.VDSL && infraData.VDSL.PortState === "VAR",
        hasFiber: infraData.Fiber && infraData.Fiber.PortState === "VAR",
        adsl: infraData.ADSL && infraData.ADSL.PortState === "VAR" ? 
          parseInt(infraData.ADSL.Distance) : null,
        vdsl: infraData.VDSL && infraData.VDSL.PortState === "VAR" ? 
          parseInt(infraData.VDSL.Distance) : null,
        fiber: infraData.Fiber && infraData.Fiber.PortState === "VAR" ? 
          parseInt(infraData.Fiber.Distance) : null
      };
      
      // DTO'ya uygun formatta da hazırla
      result.toSacInfoDto = () => {
        return {
          maxSpeed: result.maxSpeed,
          SVUID: result.svuId,
          adslPortState: result.hasAdsl,
          adslDistance: result.adsl,
          vdslPortState: result.hasVdsl,
          vdslDistance: result.vdsl,
          fiberPortState: result.hasFiber,
          fiberDistance: result.fiber
        };
      };
      
      console.log('Altyapı bilgisi başarıyla getirildi:', result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Altyapı bilgisi getirme hatası:', error);
    throw error;
  }
};