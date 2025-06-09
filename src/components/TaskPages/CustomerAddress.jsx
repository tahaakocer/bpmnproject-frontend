import React, { useState, useEffect } from 'react';
import '../../styles/FormStyles.css';
import '../../styles/AddressForm.css';
import { sendMessage } from '../../services/taskService';
import { updateOrderRequest } from '../../services/orderService';
import {
  getCities,
  getDistrictsByCity,
  getTownshipsByDistrict,
  getNeighborhoodsByTownship,
  getStreetsByNeighborhood,
  getBuildingsByStreet,
  getBbkByBuilding,
  formatAddress
} from '../../services/addressService';
import { getInfrastructureInfo } from '../../services/infrastructureService';

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
    neighborhood: { code: '', name: 'Lütfen Seçiniz' },
    street: { code: '', name: 'Lütfen Seçiniz' },
    building: { code: '', name: 'Lütfen Seçiniz' },
    bbkInfo: { code: '', name: 'Lütfen Seçiniz' }
  });

  // Dropdown seçenekleri için state'ler
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [townships, setTownships] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [streets, setStreets] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [bbkOptions, setBbkOptions] = useState([]);
  const [infrastructureInfo, setInfrastructureInfo] = useState(null);

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

        // Altyapı bilgilerini getirme ve API'ye gönderme
  const fetchInfrastructureInfo = async (bbkCode) => {
    if (!bbkCode) return;

    try {
      setLocalLoading(true);
      const infraData = await getInfrastructureInfo(bbkCode);
      setInfrastructureInfo(infraData);
      
      // Altyapı bilgilerini API'ye gönder
      if (infraData && orderData?.data?.orderRequestId) {
        const orderRequestId = orderData.data.orderRequestId;
        
        // Yalnızca altyapı (SAC) bilgilerini içeren bir request oluştur
        const sacInfoRequest = {
          address: {
            sacInfo: infraData.toSacInfoDto()
          }
        };
        
        console.log('Altyapı bilgisi gönderiliyor:', sacInfoRequest);
        await updateOrderRequest(orderRequestId, sacInfoRequest);
      }
    } catch (error) {
      console.error('Altyapı bilgisi alınırken hata:', error);
      setInfrastructureInfo(null);
    } finally {
      setLocalLoading(false);
    }
  };

  // Option seçildiğinde çalışacak fonksiyon
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
        updatedFormData.neighborhood = { code: '', name: '' };
        updatedFormData.street = { code: '', name: '' };
        updatedFormData.building = { code: '', name: '' };
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'district') {
        const townshipsList = await getTownshipsByDistrict(option.code);
        setTownships(townshipsList);

        // Alt seviyeleri temizle
        updatedFormData.township = { code: '', name: '' };
        updatedFormData.neighborhood = { code: '', name: '' };
        updatedFormData.street = { code: '', name: '' };
        updatedFormData.building = { code: '', name: '' };
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'township') {
        const neighborhoodsList = await getNeighborhoodsByTownship(option.code);
        setNeighborhoods(neighborhoodsList);

        // Alt seviyeleri temizle
        updatedFormData.neighborhood = { code: '', name: '' };
        updatedFormData.street = { code: '', name: '' };
        updatedFormData.building = { code: '', name: '' };
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'neighborhood') {
        const streetsList = await getStreetsByNeighborhood(option.code);
        setStreets(streetsList);

        // Alt seviyeleri temizle
        updatedFormData.street = { code: '', name: '' };
        updatedFormData.building = { code: '', name: '' };
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'street') {
        const buildingsList = await getBuildingsByStreet(option.code);
        setBuildings(buildingsList);

        // Alt seviyeleri temizle
        updatedFormData.building = { code: '', name: '' };
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'building') {
        const bbkList = await getBbkByBuilding(option.code);
        setBbkOptions(bbkList);

        // Alt seviyeleri temizle
        updatedFormData.bbkInfo = { code: '', name: '' };

      } else if (field === 'bbkInfo') {
        // BBK seçildiğinde altyapı bilgisini getir
        updatedFormData.bbk = option.code;
        await fetchInfrastructureInfo(option.code);
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

        // Hem kod hem de ad değerlerini ekle
        if (updatedFormData.city && updatedFormData.city.code) {
          requestBody.address.cityCode = parseInt(updatedFormData.city.code, 10);
          requestBody.address.cityName = updatedFormData.city.name;
        }

        if (updatedFormData.district && updatedFormData.district.code) {
          requestBody.address.districtCode = parseInt(updatedFormData.district.code, 10);
          requestBody.address.districtName = updatedFormData.district.name;
        }

        if (updatedFormData.township && updatedFormData.township.code) {
          requestBody.address.townshipCode = parseInt(updatedFormData.township.code, 10);
          requestBody.address.townshipName = updatedFormData.township.name;
        }

        if (updatedFormData.neighborhood && updatedFormData.neighborhood.code) {
          requestBody.address.neighborhoodCode = parseInt(updatedFormData.neighborhood.code, 10);
          requestBody.address.neighborhoodName = updatedFormData.neighborhood.name;
        }

        if (updatedFormData.street && updatedFormData.street.code) {
          requestBody.address.streetCode = parseInt(updatedFormData.street.code, 10);
          requestBody.address.streetName = updatedFormData.street.name;
        }

        if (updatedFormData.building && updatedFormData.building.code) {
          requestBody.address.buildingCode = parseInt(updatedFormData.building.code, 10);
          // Bina adı veya numarası
          // DTO'da buildingName yerine blokName olarak tanımlanmış
          requestBody.address.blokName = updatedFormData.building.name;
        }

        if (updatedFormData.bbkInfo && updatedFormData.bbkInfo.code) {
          requestBody.address.bbk = updatedFormData.bbkInfo.code;
          // BBK info'nun içinde daire numarası olabilir
          // DTO'da flatNo veya interiorDoorNo olarak tanımlanmış
          requestBody.address.flatNo = parseInt(updatedFormData.bbkInfo.name, 10) || null;
          
          // NOT: Altyapı bilgileri ayrı bir request ile gönderildiği için
          // burada tekrar altyapı bilgisi eklemeye gerek yok
        }

        // Formatlanmış adresi de ekleyelim
        requestBody.address.formattedAddress = formattedAddressText;

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

    // BBK kontrolü
    if (!formData.bbkInfo || !formData.bbkInfo.code) {
      newErrors.bbk = 'BBK seçimi zorunludur';
    }

    // Adres bilgilerini kontrol et
    if (!formData.city.code) {
      newErrors.city = 'Şehir seçiniz';
    }

    if (!formData.district.code) {
      newErrors.district = 'İlçe seçiniz';
    }

    if (!formData.township.code) {
      newErrors.township = 'Bucak seçiniz';
    }

    if (!formData.neighborhood.code) {
      newErrors.neighborhood = 'Mahalle seçiniz';
    }

    if (!formData.street.code) {
      newErrors.street = 'Sokak/Cadde seçiniz';
    }

    if (!formData.building.code) {
      newErrors.building = 'Bina seçiniz';
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
      const processedData = {
        ...formData,
        bbk: formData.bbkInfo ? formData.bbkInfo.code : null,
        addressComponents: {
          city: formData.city,
          district: formData.district,
          township: formData.township,
          neighborhood: formData.neighborhood,
          street: formData.street,
          building: formData.building,
          bbkInfo: formData.bbkInfo
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
            error={errors.township}
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
            disabled="Önce bucak seçiniz"
            error={errors.neighborhood}
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
            error={errors.street}
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
            error={errors.building}
          />

          {/* BBK Dropdown */}
          <AddressDropdown
            label="* Daire No"
            value={formData.bbkInfo.name}
            options={bbkOptions}
            onSelect={(option) => handleSelect('bbkInfo', option)}
            isOpen={openDropdown === 'bbkInfo'}
            onToggle={() => toggleDropdown('bbkInfo')}
            placeholder="Daire seçiniz"
            disabled="Önce bina seçiniz"
            error={errors.bbk}
          />
        </div>

        {/* Formatlanmış adres gösterimi */}
        {formData.formattedAddress && (
          <div className="formatted-address-section">
            <label>Oluşturulan Adres:</label>
            <div className="formatted-address">{formData.formattedAddress}</div>
            {errors.formattedAddress && <span className="error-text">{errors.formattedAddress}</span>}
          </div>
        )}

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