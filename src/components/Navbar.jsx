import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Piacell Portalı
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Sipariş Oluştur
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/urunler" className="nav-link">
              Ürünler
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/urun-ekle" className="nav-link">
              Ürün Ekle
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/addon-ekle" className="nav-link">
              Addon Ekle
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/addonlar" className="nav-link">Addon Listesi</Link>
          </li>
          <li className="nav-item">
            <Link to="/karakteristikler" className="nav-link">Karakteristikler</Link>
          </li>
          <li className="nav-item">
            <Link to="/kullanici-ara" className="nav-link">
              Kullanıcı Ara
            </Link>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Çıkış Yap
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;