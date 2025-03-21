import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { currentUser } = useAppContext();
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Rewards Dashboard</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} 
                to="/profile"
              >
                My Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/activities' ? 'active' : ''}`} 
                to="/activities"
              >
                Activities
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/rewards' ? 'active' : ''}`} 
                to="/rewards"
              >
                Rewards
              </Link>
            </li>
            {currentUser && currentUser.role === 'admin' && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} 
                  to="/admin"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
          {currentUser && (
            <div className="d-flex align-items-center text-white">
              <span className="me-3">{currentUser.name}</span>
              <span className="badge bg-success rounded-pill">
                {currentUser.points} Points
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;