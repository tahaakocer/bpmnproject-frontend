import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/App.css';
import Navbar from './components/Navbar';
import CustomerIdentity from './components/TaskPages/CustomerIdentity';
import CustomerContact from './components/TaskPages/CustomerContact';
import CustomerAddress from './components/TaskPages/CustomerAddress';
import CustomerReview from './components/TaskPages/CustomerReview';
import CustomerAddProduct from './components/TaskPages/CustomerAddProduct';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import { initializeOrder, updateOrderRequest } from './services/orderService';
import { getTasksByProcessInstanceId, completeTask } from './services/taskService';
import ProgressBar from './components/ProgressBar';

function App() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [processInstanceId, setProcessInstanceId] = useState(null);
  const [customerData, setCustomerData] = useState({
    tckn: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    formattedAddress: '',
    selectedProducts: []
  });
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Siparişi başlat
  const handleInitializeOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await initializeOrder();
      console.log("initializeOrder sonucu:", response);
      console.log("processInstanceId:", response?.data?.processInstanceId);
      setOrderData(response);
      setProcessInstanceId(response.data.processInstanceId);
      
      // Task bilgisini getir
      await fetchCurrentTask(response.data.processInstanceId);
      setStep(1);
    } catch (err) {
      setError('Sipariş başlatma sırasında bir hata oluştu: ' + err.message);
      console.error('Sipariş başlatma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mevcut task bilgisini getir
  const fetchCurrentTask = async (pInstanceId) => {
    try {
      setLoading(true);
      const task = await getTasksByProcessInstanceId(pInstanceId);
      if (task) {
        setCurrentTask(task);
        setCurrentTaskId(task.id);
        
        // Task tipine göre adımı güncelle
        if (task.taskDefinitionKey === 'UT_CustomerIdentity') setStep(1);
        else if (task.taskDefinitionKey === 'UT_CustomerContact') setStep(2);
        else if (task.taskDefinitionKey === 'UT_CustomerAddress') setStep(3);
        else if (task.taskDefinitionKey === 'UT_ReviewIdentity') setStep(4);
        else if (task.taskDefinitionKey === 'UT_AddProduct') setStep(5);
        
        return task;
      } else {
        // Task yoksa işlem tamamlanmış olabilir
        setCompleted(true);
        return null;
      }
    } catch (err) {
      setError('Task bilgisi alınırken bir hata oluştu: ' + err.message);
      console.error('Task bilgisi getirme hatası:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Task bilgisini yenile (geri dönüş sonrası)
  useEffect(() => {
    const refreshTask = async () => {
      if (processInstanceId && !currentTask) {
        console.log("UseEffect içinde task yenileme çalışıyor. processInstanceId:", processInstanceId);
        await fetchCurrentTask(processInstanceId);
      }
    };
    
    refreshTask();
  }, [processInstanceId, currentTask]);

  // Formu tamamlama ve sonraki adıma geçme
  const handleCompleteStep = async (formData) => {
    try {
      setLoading(true);
      
      // Müşteri bilgilerini güncelle
      const updatedCustomerData = {...customerData, ...formData};
      setCustomerData(updatedCustomerData);
      
      console.log('Müşteri bilgileri güncellendi:', updatedCustomerData);
      
      // API'ye güncelleme isteği gönder
      const updateBody = {
        engagedParty: updatedCustomerData
      };
      
      console.log('API güncelleme isteği gönderiliyor. OrderRequestId:', orderData.data.orderRequestId);
      const updateResponse = await updateOrderRequest(orderData.data.orderRequestId, updateBody);
      console.log('Sipariş güncelleme yanıtı:', updateResponse);
      
      // Task'ı tamamla
      console.log('Task tamamlanıyor. TaskId:', currentTaskId);
      await completeTask(currentTaskId);
      
      // Mevcut task'ı temizle
      setCurrentTask(null);
      setCurrentTaskId(null);
      
      console.log('Task bilgisi temizlendi, yeni task bilgisi getiriliyor...');
      
      // Yeni task bilgisini getir
      const newTask = await fetchCurrentTask(processInstanceId);
      console.log('Yeni task bilgisi:', newTask);
      
      // Eğer yeni task yoksa, tüm işlem tamamlanmış demektir
      if (!newTask) {
        console.log('İşlem tamamlandı, başarı ekranına yönlendiriliyor');
        setCompleted(true);
        setStep(6); // Tamamlanma adımı
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + err.message);
      console.error('Task tamamlama hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Geri dön butonu sonrası task güncelleme
  const handleTaskUpdate = async () => {
    try {
      console.log("Task güncelleme işlemi başlatılıyor...");
      // Mevcut task'ı temizleme
      setCurrentTask(null);
      setCurrentTaskId(null);
      
      // Task bilgisini güncelleme
      if (processInstanceId) {
        console.log("processInstanceId ile task bilgisi yenileniyor:", processInstanceId);
        const updatedTask = await fetchCurrentTask(processInstanceId);
        console.log("Güncellenen task bilgisi:", updatedTask);
      }
    } catch (error) {
      console.error("Task güncelleme hatası:", error);
      setError("Sayfa güncelleme sırasında bir hata oluştu: " + error.message);
    }
  };

  const renderCurrentStep = () => {
    if (!currentTask) return null;

    // Task ID'ye göre uygun bileşeni göster
    switch (currentTask.taskDefinitionKey) {
      case 'UT_CustomerIdentity':
        return (
          <CustomerIdentity 
            onComplete={handleCompleteStep}
            initialData={customerData}
            loading={loading}
          />
        );
      case 'UT_CustomerContact':
        return (
          <CustomerContact 
            onComplete={handleCompleteStep}
            initialData={customerData}
            orderData={orderData}
            loading={loading}
            onGoBack={handleTaskUpdate}
          />
        );
      case 'UT_CustomerAddress':
        return (
          <CustomerAddress 
            onComplete={handleCompleteStep}
            initialData={customerData}
            orderData={orderData}
            loading={loading}
            onGoBack={handleTaskUpdate}
          />
        );
      case 'UT_ReviewIdentity':
        return (
          <CustomerReview
            onComplete={handleCompleteStep}
            customerData={customerData}
            orderData={orderData}
            loading={loading}
            onGoBack={handleTaskUpdate}
          />
        );
      case 'UT_AddProduct':
        return (
          <CustomerAddProduct
            onComplete={handleCompleteStep}
            orderData={orderData}
            loading={loading}
            onGoBack={handleTaskUpdate}
          />
        );
      default:
        return <div className="task-message">Bilinmeyen görev tipi: {currentTask.taskDefinitionKey}</div>;
    }
  };

  const OrderProcess = () => (
    <div className="main-content">
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => setError(null)} className="error-close">Kapat</button>
        </div>
      )}

      {!orderData && !loading && (
        <div className="welcome-container">
          <h2>Hoş Geldiniz</h2>
          <p>Müşteri bilgilerinizi girmek için lütfen aşağıdaki butona tıklayın.</p>
          <button 
            onClick={handleInitializeOrder} 
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'İşlem yapılıyor...' : 'Başla'}
          </button>
        </div>
      )}

      {orderData && !completed && (
        <div className="form-container">
          <ProgressBar step={step} totalSteps={5} />
          <div className="form-content">
            {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
            {renderCurrentStep()}
          </div>
        </div>
      )}
      
      {completed && (
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>Tebrikler!</h2>
          <p>Tüm bilgiler başarıyla kaydedildi.</p>
          <div className="summary">
            <h3>Girilen Bilgiler:</h3>
            <p><strong>TC Kimlik No:</strong> {customerData.tckn}</p>
            <p><strong>Ad:</strong> {customerData.firstName}</p>
            <p><strong>Soyad:</strong> {customerData.lastName}</p>
            <p><strong>Telefon:</strong> {customerData.phoneNumber}</p>
            <p><strong>Email:</strong> {customerData.email}</p>
            <p><strong>Adres:</strong> {customerData.formattedAddress}</p>
            {customerData.selectedProducts && customerData.selectedProducts.length > 0 && (
              <>
                <h3>Seçilen Ürünler:</h3>
                {customerData.selectedProducts.map(product => (
                  <p key={product.id}><strong>{product.name}</strong></p>
                ))}
              </>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="primary-button"
          >
            Yeni Kayıt Başlat
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <header className="app-header">
     
        </header>
        <Routes>
          <Route path="/" element={<OrderProcess />} />
          <Route path="/urunler" element={<ProductList />} />
          <Route path="/urun-ekle" element={<AddProduct />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;