import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/MernisFeedbackStyles.css';
import './styles/OrderSummaryStyles.css';
import './styles/CharacteristicStyles.css';
import Navbar from './components/Navbar.jsx';
import CustomerIdentity from './components/TaskPages/CustomerIdentity';
import CustomerContact from './components/TaskPages/CustomerContact';
import CustomerAddress from './components/TaskPages/CustomerAddress';
import CustomerReview from './components/TaskPages/CustomerReview';
import CustomerAddProduct from './components/TaskPages/CustomerAddProduct';
import CustomerMernisFeedback from './components/TaskPages/CustomerMernisFeedback';
import OrderSummary from './components/TaskPages/OrderSummary';
import AddProduct from './components/AddProduct.jsx';
import ProductList from './components/ProductList';
import { initializeOrder, updateOrderRequest } from './services/orderService';
import { getTasksByProcessInstanceId, completeTask } from './services/taskService';
import ProgressBar from './components/ProgressBar.jsx';
import AddonProductPage from './components/AddonProductPage';
import AddonList from './components/AddonList';
import CharacteristicList from './components/CharacteristicList';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Component to conditionally render Navbar
const NavbarWrapper = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return !hideNavbar ? <Navbar /> : null;
};

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
      console.log("fetchCurrentTask çağrılıyor. ProcessInstanceId:", pInstanceId);

      // Error state'ini sıfırla
      setError(null);

      const task = await getTasksByProcessInstanceId(pInstanceId);
      console.log("getTasksByProcessInstanceId yanıtı:", task);

      if (task) {
        setCurrentTask(task);
        setCurrentTaskId(task.id);

        // Task tipine göre adımı güncelle
        switch (task.taskDefinitionKey) {
          case 'UT_CustomerIdentity':
            setStep(1);
            break;
          case 'UT_MernisFeedback':
            setStep(1);
            break;
          case 'UT_CustomerContact':
            setStep(2);
            break;
          case 'UT_CustomerAddress':
            setStep(3);
            break;
          case 'UT_ReviewIdentity':
            setStep(4);
            break;
          case 'UT_AddProduct':
            setStep(5);
            break;
          case 'UT_OrderSummary':
            setStep(6);
            break;
          default:
            console.log("Bilinmeyen task tipi:", task.taskDefinitionKey);
        }

        console.log("Task tipi:", task.taskDefinitionKey, "Yeni adım:", step);
        return task;
      } else {
        // Task yoksa işlem tamamlanmış olabilir
        console.log("Aktif task bulunamadı, işlem tamamlanmış olabilir");
        setCompleted(true);
        setStep(7);
        return null;
      }
    } catch (err) {
      console.error('Task bilgisi getirme hatası:', err);

      // Hata kodunu ve mesajını kontrol et
      const isProcessCompletedError =
        err.response?.status === 500 ||
        err.message?.includes('No task found') ||
        err.message?.includes('ProcessInstanceId not found') ||
        err.message?.toLowerCase().includes('tamamlandı');

      if (isProcessCompletedError) {
        console.log('Süreç tamamlanmış, başarı ekranı gösteriliyor');
        setCompleted(true);
        setStep(7);
        setError(null); // Hata mesajını temizle
        return null;
      }

      // Diğer hatalar için normal hata işleme
      setError('Task bilgisi alınırken bir hata oluştu: ' + err.message);
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
      const updatedCustomerData = { ...customerData, ...formData };
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
      try {
        const newTask = await fetchCurrentTask(processInstanceId);
        console.log('Yeni task bilgisi:', newTask);

        // Eğer yeni task yoksa, tüm işlem tamamlanmış demektir
        if (!newTask) {
          console.log('İşlem tamamlandı, başarı ekranına yönlendiriliyor');
          setCompleted(true);
          setStep(7); // Tamamlanma adımı
          setError(null); // Hata mesajını temizle
        }
      } catch (taskError) {
        console.error('Yeni task bilgisi alınırken hata:', taskError);

        // Özel hata durumlarını kontrol et
        const isProcessCompletedError =
          taskError.response?.status === 500 ||
          taskError.message?.includes('No task found') ||
          taskError.message?.includes('ProcessInstanceId not found') ||
          taskError.message?.toLowerCase().includes('tamamlandı');

        if (isProcessCompletedError) {
          console.log('İşlem tamamlanmış olabilir, başarı ekranına yönlendiriliyor');
          setCompleted(true);
          setStep(7);
          setError(null); // Hata mesajını temizle
        } else {
          // Süreç tamamlanmadıysa hatayı göster
          setError('Sonraki adım bilgisi alınırken bir hata oluştu: ' + taskError.message);
        }
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
    if (!currentTask) {
      console.log("renderCurrentStep: currentTask bulunamadı");
      return null;
    }

    console.log("renderCurrentStep: Mevcut Task:", currentTask.taskDefinitionKey);

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
      case 'UT_MernisFeedback':
        return (
          <CustomerMernisFeedback
            onComplete={handleCompleteStep}
            initialData={customerData}
            orderData={{ orderData }}
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
      case 'UT_OrderSummary':
        console.log("UT_OrderSummary bileşeni render ediliyor, orderData:", orderData);
        return (
          <OrderSummary
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
          <ProgressBar step={step} totalSteps={7} />
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
        <NavbarWrapper />
        <header className="app-header"></header>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OrderProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urunler"
            element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urun-ekle"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addon-ekle"
            element={
              <ProtectedRoute>
                <AddonProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addonlar"
            element={
              <ProtectedRoute>
                <AddonList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/karakteristikler"
            element={
              <ProtectedRoute>
                <CharacteristicList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;