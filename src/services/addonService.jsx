import api from './apiClient';

// Ana ürünleri getir (COMMON)
export const getMainProducts = async () => {
  try {
    const response = await api.get('/api/product-catalog/get-by-confType', {
      params: { confType: 'COMMON' }
    });
    console.log('Ana ürünler başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ana ürünleri getirme hatası:', error);
    throw error;
  }
};

// Addon ürünleri getir (ADDON)
export const getAddonProducts = async () => {
  try {
    const response = await api.get('/api/product-catalog/get-by-confType', {
      params: { confType: 'ADDON' }
    });
    console.log('Addon ürünler başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Addon ürünleri getirme hatası:', error);
    throw error;
  }
};

// Addon ürünleri ana ürüne ekle
export const createAddon = async (addonData) => {
  try {
    const response = await api.post('/api/addon/create', addonData);
    console.log('Addon ürün ekleme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Addon ürün ekleme hatası:', error);
    throw error;
  }
};

// Ana ürüne eklenmiş addon ürünleri getir
export const getAddonsForMainProduct = async (mainProductId) => {
  try {
    const response = await api.get(`/api/addon/get-by-main-product-id`, {
      params: { mainProductId }
    });
    console.log('Ana ürünün addon ürünleri başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ana ürünün addon ürünlerini getirme hatası:', error);
    throw error;
  }
};

// Addon bağlantısını sil
export const deleteAddon = async (addonId) => {
  try {
    const response = await api.delete(`/api/addon/delete-by-id`, {
      params: { id: addonId }
    });
    console.log('Addon bağlantısı başarıyla silindi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Addon bağlantısı silme hatası:', error);
    throw error;
  }
};

// Tüm addon bağlantılarını getir
export const getAllAddons = async () => {
  try {
    const response = await api.get('/api/addon/get-all');
    console.log('Tüm addon bağlantıları başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Tüm addon bağlantılarını getirme hatası:', error);
    throw error;
  }
};