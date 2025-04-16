import api from './apiClient';

export const getAllProductCatalog = async () => {
  try {
    const response = await api.get('/api/product-catalog/get-all');
    console.log('Ürün kataloğu başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün kataloğu getirme hatası:', error);
    throw error;
  }
};

// BBK ile ürünleri getir - Yeni eklenen fonksiyon
export const getProductsByBbk = async (bbk) => {
  try {
    const response = await api.get(`/api/product-catalog/get-by-bbk?bbk=${bbk}`);
    console.log('BBK ile ürünler başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('BBK ile ürün getirme hatası:', error);
    throw error;
  }
};

export const updateOrderProducts = async (orderRequestId, productCatalogCode) => {
  try {
    const response = await api.put(
      `/api/initialize/${orderRequestId}/update-products`, 
      null, 
      { 
        params: { productCatalogCode } 
      }
    );
    
    console.log('Ürün güncelleme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    throw error;
  }
};

export const deleteOrderProducts = async (orderRequestId, productCatalogCode) => {
  try {
    const response = await api.put(
      `/api/initialize/${orderRequestId}/update-products`, 
      null, 
      { 
        params: { productCatalogCode,
          willBeDelete: true }
      }
    );
    
    console.log('Ürün silme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    throw error;
  }
};
  
export const getOrderRequest = async (orderRequestId) => {
  try {
    const response = await api.get(`/api/initialize/${orderRequestId}/get-order-request`);
    console.log('Sipariş isteği başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Sipariş isteği getirme hatası:', error);
    throw error;
  }
};

// Yeni eklenen fonksiyonlar

export const searchSpecifications = async (query) => {
  try {
    if (!query || query.length < 2) return { data: [] };
    
    const response = await api.get(`/api/specifications/search?query=${query}`);
    console.log('Spec araması başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Spec arama hatası:', error);
    throw error;
  }
};

export const getSpecificationByCode = async (code) => {
  try {
    if (!code) return null;
    
    const response = await api.get(`/api/specifications/get-by-code?code=${code}`);
    console.log('Spec getirme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Spec getirme hatası:', error);
    throw error;
  }
};

export const getProductByCode = async (code) => {
  try {
    const response = await api.get(`/api/product-catalog/get-by-code?code=${code}`);
    console.log('Ürün detayı başarıyla getirildi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün detayı getirme hatası:', error);
    throw error;
  }
};
export const deleteProductByCode = async (code) => {
  try {
    const response = await api.delete(`/api/product-catalog/delete-by-code?code=${code}`);
    console.log('Ürün silme başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    throw error;
  }
};
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/api/product-catalog/create', productData);
    console.log('Ürün oluşturma başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    throw error;
  }
};
export const searchProductCatalog = async (query) => {
  try {
    const response = await api.post('/api/product-catalog/search', query);
    console.log('Ürün arama başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ürün arama hatası:', error);
    throw error;
  }
};