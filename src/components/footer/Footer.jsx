import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Footer Legal Info */}
      <div className="row">
        <div className="col-xs-12">
          <div className="footer-text">
            <p className="footer-line-1">
              © Trusted Home Reports Inc., 30 N Gould St, Ste 26362, Sheridan, Wyoming, United States 82801
              <a href="/terms">Terms of Service</a> <a href="/privacy-policy">Privacy Policy</a>
            </p>
            <p className="footer-line-2">
              <a href="/privacy-policy#opt-out">Do Not Sell or Share My Personal Information</a>
            </p>
            <p className="footer-line-3">All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
