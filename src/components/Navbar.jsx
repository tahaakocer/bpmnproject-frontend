import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;