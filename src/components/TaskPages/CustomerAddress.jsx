import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
import '../../styles/AddressForm.css';
import { sendMessage } from '../../services/taskService';
import { updateOrderRequest } from '../../services/orderService';
import {
  getCities,
  getDistrictsByCity,
  getTownshipsByDistrict,
  getVillagesByTownship,
  getNeighborhoodsByVillage,
  getStreetsByNeighborhood,
  getBuildingsByStreet,
  getApartmentsByBuilding,
  formatAddress
} from '../../services/addressService';

// Dropdown bileşeni
const AddressDropdown = ({ 
  label, 
  value, 
  options, 
  onSelect, 
  isOpen, 
  onToggle, 
  placeholder, 
  disabled, 
  error 
}) => {
  // Klavye navigasyonu için bir referans oluşturalım
  const optionsRef = React.useRef(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  
  // Dropdown açıldığında ilk öğeye odaklanmak için
  React.useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);
  
  // Klavye ile harflere basıldığında ilgili seçeneklere gitme
  const handleKeyDown = (e) => {
    if (!isOpen || !options.length) return;
    
    if (e.key === 'Escape') {
      onToggle();
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
      return;
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      return;
    }
    
    if (e.key === 'Enter' && focusedIndex >= 0) {
      onSelect(options[focusedIndex]);
      return;
    }
    
    // Klavyeden basılan harfe göre seçenekler arasında gezinme
    if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
      const char = e.key.toLowerCase();
      
      // O harfle başlayan ilk öğeyi bul
      const foundIndex = options.findIndex(option => 
        option.name.toLowerCase().startsWith(char)
      );
      
      if (foundIndex !== -1) {
        setFocusedIndex(foundIndex);
        
        // Bulunan öğeye kaydır
        if (optionsRef.current) {
          const optionElements = optionsRef.current.querySelectorAll('.dropdown-option');
          if (optionElements[foundIndex]) {
            optionElements[foundIndex].scrollIntoView({ block: 'nearest' });
          }
        }
      }
    }
  };
  
  // Odaklanan seçeneğin görünür olmasını sağlamak için
  React.useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current) {
      const optionElements = optionsRef.current.querySelectorAll('.dropdown-option');
      if (optionElements[focusedIndex]) {
        optionElements[focusedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);
  
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="dropdown-select">
        <div
          className="dropdown-selected"
          onClick={onToggle}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {value || placeholder || 'Seçiniz'}
          <span className="dropdown-arrow">▼</span>
        </div>
        {isOpen && (
          <div className="dropdown-options" ref={optionsRef}>
            {options.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={option.code}
                  className={`dropdown-option ${focusedIndex === index ? 'focused' : ''}`}
                  onClick={() => onSelect(option)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="dropdown-option disabled">{disabled}</div>
            )}
          </div>
        )}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

const CustomerAddress = ({ onComplete, initialData, loading, orderData, onGoBack }) => {
  // Adres form verileri için state
  const [formData, setFormData] = useState({
    formattedAddress: '',
    bbk: '',
    // Adres bileşenleri
    city: { code: '', name: 'Lütfen Seçiniz' },
    district: { code: '', name: 'Lütfen Seçiniz' },
    township: { code: '', name: 'Lütfen Seçiniz' },
    village: { code: '', name: 'Lütfen Seçiniz' },
    neighborhood: { code: '', name: 'Lütfen Seçiniz' },
    street: { code: '', name: 'Lütfen Seçiniz' },
    building: { code: '', name: 'Lütfen Seçiniz' },
    apartment: { code: '', name: 'Lütfen Seçiniz' }
  });

  // Dropdown seçenekleri için state'ler
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [townships, setTownships] = useState([]);
  const [villages, setVillages] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [streets, setStreets] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [apartments, setApartments] = useState([]);

  // Dropdown açık/kapalı durumları
  const [openDropdown, setOpenDropdown] = useState('');
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  // İl listesini yükle
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityList = await getCities();
        setCities(cityList);
        
        // İstanbul'un ilçelerini yükle
        if (formData.city.code === '34') {
          const districtsList = await getDistrictsByCity('34');
          setDistricts(districtsList);
        }
      } catch (error) {
        console.error('Şehir listesi yüklenirken hata:', error);
      }
    };
    
    loadCities();
  }, []);

  // Dropdown toggle işlevi
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? '' : dropdown);
  };

  // Option seçildiğinde çalışacak fonksiyon
 // handleSelect fonksiyonunu güncelleyelim - sadece bu kısmı değiştireceğiz
const handleSelect = async (field, option) => {
  // Mevcut form verisini güncelle
  const updatedFormData = {
    ...formData,
    [field]: option
  };
  
  setFormData(updatedFormData);
  
  try {
    // Seçime göre alt seviye verileri getir
    if (field === 'city') {
      const districtsList = await getDistrictsByCity(option.code);
      setDistricts(districtsList);
      
      // Alt seviyeleri temizle
      updatedFormData.district = { code: '', name: '' };
      updatedFormData.township = { code: '', name: '' };
      updatedFormData.village = { code: '', name: '' };
      updatedFormData.neighborhood = { code: '', name: '' };
      updatedFormData.street = { code: '', name: '' };
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'district') {
      const townshipsList = await getTownshipsByDistrict(option.code);
      setTownships(townshipsList);
      
      // Alt seviyeleri temizle
      updatedFormData.township = { code: '', name: '' };
      updatedFormData.village = { code: '', name: '' };
      updatedFormData.neighborhood = { code: '', name: '' };
      updatedFormData.street = { code: '', name: '' };
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'township') {
      const villagesList = await getVillagesByTownship(option.code);
      setVillages(villagesList);
      
      // Alt seviyeleri temizle
      updatedFormData.village = { code: '', name: '' };
      updatedFormData.neighborhood = { code: '', name: '' };
      updatedFormData.street = { code: '', name: '' };
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'village') {
      const neighborhoodsList = await getNeighborhoodsByVillage(option.code);
      setNeighborhoods(neighborhoodsList);
      
      // Alt seviyeleri temizle
      updatedFormData.neighborhood = { code: '', name: '' };
      updatedFormData.street = { code: '', name: '' };
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'neighborhood') {
      const streetsList = await getStreetsByNeighborhood(option.code);
      setStreets(streetsList);
      
      // Alt seviyeleri temizle
      updatedFormData.street = { code: '', name: '' };
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'street') {
      const buildingsList = await getBuildingsByStreet(option.code);
      setBuildings(buildingsList);
      
      // Alt seviyeleri temizle
      updatedFormData.building = { code: '', name: '' };
      updatedFormData.apartment = { code: '', name: '' };
      
    } else if (field === 'building') {
      const apartmentsList = await getApartmentsByBuilding(option.code);
      setApartments(apartmentsList);
      
      // Alt seviyeleri temizle
      updatedFormData.apartment = { code: '', name: '' };
    }
    
    // Formatlanmış adresi güncelle
    const formattedAddressText = formatAddress(updatedFormData);
    setFormData(prev => ({
      ...prev,
      ...updatedFormData,
      formattedAddress: formattedAddressText
    }));
    
    // Seçilen adres bilgisini kullanarak updateOrderRequest'i çağır
    const orderRequestId = orderData?.data?.orderRequestId;
    if (orderRequestId) {
      // Sadece doldurulan alanları içeren request body oluştur
      const requestBody = {
        address: {}
      };
      
      // Hangi alanların dolu olduğunu kontrol edip ekle
      if (updatedFormData.city && updatedFormData.city.code) {
        requestBody.address.cityCode = parseInt(updatedFormData.city.code, 10);
      }
      
      if (updatedFormData.district && updatedFormData.district.code) {
        requestBody.address.districtCode = parseInt(updatedFormData.district.code, 10);
      }
      
      if (updatedFormData.township && updatedFormData.township.code) {
        requestBody.address.townshipCode = parseInt(updatedFormData.township.code, 10);
      }
      
      if (updatedFormData.village && updatedFormData.village.code) {
        requestBody.address.villageCode = parseInt(updatedFormData.village.code, 10);
      }
      
      if (updatedFormData.neighborhood && updatedFormData.neighborhood.code) {
        requestBody.address.neighborhoodCode = parseInt(updatedFormData.neighborhood.code, 10);
      }
      
      if (updatedFormData.street && updatedFormData.street.code) {
        requestBody.address.streetCode = parseInt(updatedFormData.street.code, 10);
      }
      
      if (updatedFormData.building && updatedFormData.building.code) {
        requestBody.address.buildingCode = parseInt(updatedFormData.building.code, 10);
      }
      
      if (updatedFormData.apartment && updatedFormData.apartment.code) {
        requestBody.address.flat = parseInt(updatedFormData.apartment.code, 10);
      }
      
      // Sipariş güncelleme isteğini gönder
      try {
        await updateOrderRequest(orderRequestId, requestBody);
      } catch (error) {
        console.error('Adres bilgisi güncellenirken hata oluştu:', error);
      }
    }
    
  } catch (error) {
    console.error(`${field} verileri yüklenirken hata:`, error);
  }
  
  setOpenDropdown('');
};

  // BBK değerini güncelle
  const handleBbkChange = (e) => {
    const { value } = e.target;
    
    // BBK için sadece rakam girişine izin ver
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      bbk: value
    }));
    
    // Anlık validasyon için hata mesajını temizle
    if (errors.bbk) {
      setErrors(prev => ({
        ...prev,
        bbk: null
      }));
    }
  };
  
  // Dışarı tıklandığında dropdown'ları kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.dropdown-select');
      let clickedOutside = true;
      
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
          clickedOutside = false;
        }
      });
      
      if (clickedOutside) {
        setOpenDropdown('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // İlk yükleme - gelen veriler varsa
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        formattedAddress: initialData.formattedAddress || prev.formattedAddress,
        bbk: initialData.bbk ? String(initialData.bbk) : ''
      }));
    }
  }, [initialData]);

  // Form validasyonu
  const validate = () => {
    const newErrors = {};
    
    // BBK (isteğe bağlı olarak eklenmiş)
    if (formData.bbk && !/^\d+$/.test(formData.bbk)) {
      newErrors.bbk = 'BBK sadece rakamlardan oluşmalıdır';
    }
    
    // Adres bilgilerini kontrol et
    if (!formData.city.code) {
      newErrors.city = 'Şehir seçiniz';
    }
    
    if (!formData.district.code) {
      newErrors.district = 'İlçe seçiniz';
    }
    
    if (!formData.formattedAddress || formData.formattedAddress.length < 10) {
      newErrors.formattedAddress = 'Geçerli bir adres seçiniz (en az 10 karakter)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // BBK'yı sayıya çevir (eğer varsa)
      const processedData = {
        ...formData,
        bbk: formData.bbk ? parseInt(formData.bbk, 10) : null,
        addressComponents: {
          city: formData.city,
          district: formData.district,
          township: formData.township,
          village: formData.village,
          neighborhood: formData.neighborhood,
          street: formData.street,
          building: formData.building,
          apartment: formData.apartment
        }
      };
      
      onComplete(processedData);
    }
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
      const messageResponse = await sendMessage(processInstanceId, "backToContact");
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
      <h2>Adres Bilgileri</h2>
      <p className="form-description">Lütfen adres bilgilerinizi giriniz.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="address-form-container">
          {/* Şehir Dropdown */}
          <AddressDropdown
            label="* Şehir"
            value={formData.city.name}
            options={cities}
            onSelect={(option) => handleSelect('city', option)}
            isOpen={openDropdown === 'city'}
            onToggle={() => toggleDropdown('city')}
            placeholder="Şehir seçiniz"
            disabled="Şehirler yükleniyor..."
            error={errors.city}
          />

          {/* İlçe Dropdown */}
          <AddressDropdown
            label="* Semt"
            value={formData.district.name}
            options={districts}
            onSelect={(option) => handleSelect('district', option)}
            isOpen={openDropdown === 'district'}
            onToggle={() => toggleDropdown('district')}
            placeholder="İlçe seçiniz"
            disabled="Önce şehir seçiniz"
            error={errors.district}
          />

          {/* Bucak Dropdown */}
          <AddressDropdown
            label="* Bucak"
            value={formData.township.name}
            options={townships}
            onSelect={(option) => handleSelect('township', option)}
            isOpen={openDropdown === 'township'}
            onToggle={() => toggleDropdown('township')}
            placeholder="Bucak seçiniz"
            disabled="Önce ilçe seçiniz"
          />

          {/* Köy Dropdown */}
          <AddressDropdown
            label="* Köy"
            value={formData.village.name}
            options={villages}
            onSelect={(option) => handleSelect('village', option)}
            isOpen={openDropdown === 'village'}
            onToggle={() => toggleDropdown('village')}
            placeholder="Köy seçiniz"
            disabled="Önce bucak seçiniz"
          />

          {/* Mahalle Dropdown */}
          <AddressDropdown
            label="* Mahalle"
            value={formData.neighborhood.name}
            options={neighborhoods}
            onSelect={(option) => handleSelect('neighborhood', option)}
            isOpen={openDropdown === 'neighborhood'}
            onToggle={() => toggleDropdown('neighborhood')}
            placeholder="Mahalle seçiniz"
            disabled="Önce köy seçiniz"
          />

          {/* Cadde/Sokak Dropdown */}
          <AddressDropdown
            label="* Sokak/Cadde"
            value={formData.street.name}
            options={streets}
            onSelect={(option) => handleSelect('street', option)}
            isOpen={openDropdown === 'street'}
            onToggle={() => toggleDropdown('street')}
            placeholder="Sokak/Cadde seçiniz"
            disabled="Önce mahalle seçiniz"
          />

          {/* Bina Dropdown */}
          <AddressDropdown
            label="* Bina"
            value={formData.building.name}
            options={buildings}
            onSelect={(option) => handleSelect('building', option)}
            isOpen={openDropdown === 'building'}
            onToggle={() => toggleDropdown('building')}
            placeholder="Bina seçiniz"
            disabled="Önce sokak/cadde seçiniz"
          />

          {/* Apartman/Daire Dropdown */}
          <AddressDropdown
            label="* Apartman"
            value={formData.apartment.name}
            options={apartments}
            onSelect={(option) => handleSelect('apartment', option)}
            isOpen={openDropdown === 'apartment'}
            onToggle={() => toggleDropdown('apartment')}
            placeholder="Daire seçiniz"
            disabled="Önce bina seçiniz"
          />

        
        </div>
        
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
            {loading || localLoading ? 'İşlem yapılıyor...' : 'Devam Et'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerAddress;