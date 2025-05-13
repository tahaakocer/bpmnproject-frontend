import axios from 'axios';
import api from './apiClient';

// Base URL backend'iniz için
const API_BASE_URL = 'http://localhost:8383/api/bbk-service';

// Türkiye'deki 81 ilin listesini getir
export const getCities = () => {
  const turkishCities = [
    { code: '01', name: 'Adana' },
    { code: '02', name: 'Adıyaman' },
    { code: '03', name: 'Afyon' },
    { code: '04', name: 'Ağrı' },
    { code: '05', name: 'Amasya' },
    { code: '06', name: 'Ankara' },
    { code: '07', name: 'Antalya' },
    { code: '08', name: 'Artvin' },
    { code: '09', name: 'Aydın' },
    { code: '10', name: 'Balıkesir' },
    { code: '11', name: 'Bilecik' },
    { code: '12', name: 'Bingöl' },
    { code: '13', name: 'Bitlis' },
    { code: '14', name: 'Bolu' },
    { code: '15', name: 'Burdur' },
    { code: '16', name: 'Bursa' },
    { code: '17', name: 'Çanakkale' },
    { code: '18', name: 'Çankırı' },
    { code: '19', name: 'Çorum' },
    { code: '20', name: 'Denizli' },
    { code: '21', name: 'Diyarbakır' },
    { code: '22', name: 'Edirne' },
    { code: '23', name: 'Elazığ' },
    { code: '24', name: 'Erzincan' },
    { code: '25', name: 'Erzurum' },
    { code: '26', name: 'Eskişehir' },
    { code: '27', name: 'Gaziantep' },
    { code: '28', name: 'Giresun' },
    { code: '29', name: 'Gümüşhane' },
    { code: '30', name: 'Hakkari' },
    { code: '31', name: 'Hatay' },
    { code: '32', name: 'Isparta' },
    { code: '33', name: 'İçel' },
    { code: '34', name: 'İstanbul' },
    { code: '35', name: 'İzmir' },
    { code: '36', name: 'Kars' },
    { code: '37', name: 'Kastamonu' },
    { code: '38', name: 'Kayseri' },
    { code: '39', name: 'Kırklareli' },
    { code: '40', name: 'Kırşehir' },
    { code: '41', name: 'Kocaeli' },
    { code: '42', name: 'Konya' },
    { code: '43', name: 'Kütahya' },
    { code: '44', name: 'Malatya' },
    { code: '45', name: 'Manisa' },
    { code: '46', name: 'Kahramanmaraş' },
    { code: '47', name: 'Mardin' },
    { code: '48', name: 'Muğla' },
    { code: '49', name: 'Muş' },
    { code: '50', name: 'Nevşehir' },
    { code: '51', name: 'Niğde' },
    { code: '52', name: 'Ordu' },
    { code: '53', name: 'Rize' },
    { code: '54', name: 'Sakarya' },
    { code: '55', name: 'Samsun' },
    { code: '56', name: 'Siirt' },
    { code: '57', name: 'Sinop' },
    { code: '58', name: 'Sivas' },
    { code: '59', name: 'Tekirdağ' },
    { code: '60', name: 'Tokat' },
    { code: '61', name: 'Trabzon' },
    { code: '62', name: 'Tunceli' },
    { code: '63', name: 'Şanlıurfa' },
    { code: '64', name: 'Uşak' },
    { code: '65', name: 'Van' },
    { code: '66', name: 'Yozgat' },
    { code: '67', name: 'Zonguldak' },
    { code: '68', name: 'Aksaray' },
    { code: '69', name: 'Bayburt' },
    { code: '70', name: 'Karaman' },
    { code: '71', name: 'Kırıkkale' },
    { code: '72', name: 'Batman' },
    { code: '73', name: 'Şırnak' },
    { code: '74', name: 'Bartın' },
    { code: '75', name: 'Ardahan' },
    { code: '76', name: 'Iğdır' },
    { code: '77', name: 'Yalova' },
    { code: '78', name: 'Karabük' },
    { code: '79', name: 'Kilis' },
    { code: '80', name: 'Osmaniye' },
    { code: '81', name: 'Düzce' }
  ];
  
  return Promise.resolve(turkishCities);
};

// Şehir koduna göre ilçeler (semtler)
export const getDistrictsByCity = async (cityCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/districts`, {
      params: { cityCode },
    });

    if (response.data && response.data.Data) {
      const districts = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return districts;
    }
    return [];
  } catch (error) {
    console.error('İlçe verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// İlçe koduna göre bucaklar
export const getTownshipsByDistrict = async (districtCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/townships`, {
      params: { districtCode },
    });

    if (response.data && response.data.Data) {
      const townships = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return townships;
    }
    return [];
  } catch (error) {
    console.error('Bucak verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// Bucak koduna göre mahalleler
export const getNeighborhoodsByTownship = async (townshipCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/neighborhoods`, {
      params: { townshipCode },
    });

    if (response.data && response.data.Data) {
      const neighborhoods = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return neighborhoods;
    }
    return [];
  } catch (error) {
    console.error('Mahalle verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// Mahalle koduna göre sokaklar/caddeler
export const getStreetsByNeighborhood = async (neighborhoodCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/streets`, {
      params: { neighborhoodCode },
    });

    if (response.data && response.data.Data) {
      const streets = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return streets;
    }
    return [];
  } catch (error) {
    console.error('Sokak/Cadde verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// Sokak/Cadde koduna göre binalar
export const getBuildingsByStreet = async (streetCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/buildings`, {
      params: { streetCode },
    });

    if (response.data && response.data.Data) {
      const buildings = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return buildings;
    }
    return [];
  } catch (error) {
    console.error('Bina verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// Bina koduna göre BBK kodu
export const getBbkByBuilding = async (buildingCode) => {
  try {
    const response = await api.get(`${API_BASE_URL}/bbk`, {
      params: { buildingCode },
    });

    if (response.data && response.data.Data) {
      const bbkList = response.data.Data.map(item => ({
        code: item.Code,
        name: item.Name
      }));
      return bbkList;
    }
    return [];
  } catch (error) {
    console.error('BBK verileri alınırken hata oluştu:', error);
    throw error;
  }
};

// Formatlanmış adres oluşturma
export const formatAddress = (addressData) => {
  const addressParts = [];
  
  if (addressData.neighborhood && addressData.neighborhood.name) addressParts.push(`${addressData.neighborhood.name} Mah.`);
  if (addressData.street && addressData.street.name) addressParts.push(`${addressData.street.name}`);
  if (addressData.building && addressData.building.name) addressParts.push(`${addressData.building.name}`);
  if (addressData.bbkInfo && addressData.bbkInfo.name) addressParts.push(`${addressData.bbkInfo.name}`);
  if (addressData.township && addressData.township.name && addressData.township.name !== 'MERKEZ') addressParts.push(`${addressData.township.name}`);
  if (addressData.district && addressData.district.name) addressParts.push(`${addressData.district.name}`);
  if (addressData.city && addressData.city.name) addressParts.push(addressData.city.name);
  
  return addressParts.join(', ');
};