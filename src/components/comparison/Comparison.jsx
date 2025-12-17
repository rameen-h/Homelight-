import './Comparison.css';
import { useState, useEffect } from 'react';

const Comparison = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 430);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const comparisonData = [
    {
      feature: 'Cash offer within a week',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'No repairs or updates',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'No listing or showings',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'No offer negotiation or buyer demands',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'No home sale contingency on next home purchase',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'No expensive double mortgage, bridge loan, or interim housing',
      simpleSale: true,
      traditional: false
    },
    {
      feature: 'Close in as little as 10 days',
      simpleSale: true,
      traditional: false
    }
  ];

  if (isMobile) {
    return (
      <div className="comparison-section">
        <div className="comparison-container">
          <div className="comparison-header">
            <h2 className="comparison-title">
              HomeLight Simple Sale<sup>®</sup> vs Traditional Sale
            </h2>
            <p className="comparison-subtitle">
              See how HomeLight Simple Sale compares to the traditional way of selling your home
            </p>
          </div>

          <div className="mobile-comparison-boxes">
            {/* Traditional Sale Box */}
            <div className="comparison-box traditional-box">
              <h3 className="box-header">Traditional Sale</h3>
              <ul className="feature-list">
                {comparisonData.map((item, index) => (
                  <li key={index} className="feature-item">
                    {item.traditional ? (
                      <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="check-icon">
                        <circle cx="9" cy="9" r="9" fill="#1192E5"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.95891 13.7654L14.6363 7.088C14.8631 6.86126 14.8631 6.4936 14.6363 6.26686L13.8152 5.44572C13.5884 5.21894 13.2208 5.21894 12.994 5.44572L7.54832 10.8914L5.00586 8.34891C4.77911 8.12217 4.41146 8.12217 4.18468 8.34891L3.36354 9.17005C3.1368 9.39679 3.1368 9.76445 3.36354 9.99119L7.13773 13.7654C7.36451 13.9922 7.73213 13.9922 7.95891 13.7654Z" fill="white"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="x-icon">
                        <circle cx="9" cy="9" r="9" fill="#C5C8CD"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.1528 9.0376L12.6775 6.51295C12.8235 6.36694 12.8235 6.12999 12.6775 5.98374L12.0909 5.39711C11.9449 5.25109 11.7079 5.25109 11.5617 5.39711L9.03724 7.92199L6.51259 5.39734C6.36658 5.25133 6.12963 5.25133 5.98338 5.39734L5.39699 5.98374C5.25097 6.12975 5.25097 6.3667 5.39699 6.51295L7.92163 9.0376L5.39699 11.5622C5.25097 11.7083 5.25097 11.9452 5.39699 12.0915L5.98362 12.6781C6.12963 12.8241 6.36658 12.8241 6.51283 12.6781L9.03724 10.1532L11.5619 12.6779C11.7079 12.8239 11.9449 12.8239 12.0911 12.6779L12.6777 12.0912C12.8237 11.9452 12.8237 11.7083 12.6777 11.562L10.1528 9.0376Z" fill="white"></path>
                      </svg>
                    )}
                    <span>{item.feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simple Sale Box */}
            <div className="comparison-box simplesale-box">
              <h3 className="box-header">HomeLight Simple Sale<sup>®</sup></h3>
              <ul className="feature-list">
                {comparisonData.map((item, index) => (
                  <li key={index} className="feature-item">
                    {item.simpleSale ? (
                      <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="check-icon">
                        <circle cx="9" cy="9" r="9" fill="#1192E5"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.95891 13.7654L14.6363 7.088C14.8631 6.86126 14.8631 6.4936 14.6363 6.26686L13.8152 5.44572C13.5884 5.21894 13.2208 5.21894 12.994 5.44572L7.54832 10.8914L5.00586 8.34891C4.77911 8.12217 4.41146 8.12217 4.18468 8.34891L3.36354 9.17005C3.1368 9.39679 3.1368 9.76445 3.36354 9.99119L7.13773 13.7654C7.36451 13.9922 7.73213 13.9922 7.95891 13.7654Z" fill="white"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="x-icon">
                        <circle cx="9" cy="9" r="9" fill="#C5C8CD"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.1528 9.0376L12.6775 6.51295C12.8235 6.36694 12.8235 6.12999 12.6775 5.98374L12.0909 5.39711C11.9449 5.25109 11.7079 5.25109 11.5617 5.39711L9.03724 7.92199L6.51259 5.39734C6.36658 5.25133 6.12963 5.25133 5.98338 5.39734L5.39699 5.98374C5.25097 6.12975 5.25097 6.3667 5.39699 6.51295L7.92163 9.0376L5.39699 11.5622C5.25097 11.7083 5.25097 11.9452 5.39699 12.0915L5.98362 12.6781C6.12963 12.8241 6.36658 12.8241 6.51283 12.6781L9.03724 10.1532L11.5619 12.6779C11.7079 12.8239 11.9449 12.8239 12.0911 12.6779L12.6777 12.0912C12.8237 11.9452 12.8237 11.7083 12.6777 11.562L10.1528 9.0376Z" fill="white"></path>
                      </svg>
                    )}
                    <span>{item.feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-section">
      <div className="comparison-container">
        {/* Header */}
        <div className="comparison-header">
          <h2 className="comparison-title">
            HomeLight Simple Sale<sup>®</sup> vs Traditional Sale
          </h2>
          <p className="comparison-subtitle">
            See how HomeLight Simple Sale compares to the traditional way of selling your home
          </p>
        </div>

        {/* Comparison Table */}
        <div className="comparison-table">
          {/* Table Headers */}
          <div className="comparison-table-header">
            <div className="feature-column header-cell"></div>
            <div className="traditional-column header-cell">Traditional Sale</div>
            <div className="simple-sale-column header-cell">
              HomeLight Simple Sale<sup>®</sup>
            </div>
          </div>

          {/* Table Rows */}
          <div className="comparison-table-body">
            {comparisonData.map((item, index) => (
              <div key={index} className="comparison-row">
                <div className="feature-column">{item.feature}</div>
                <div className="traditional-column">
                  {item.traditional ? (
                    <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="check-icon">
                      <circle cx="9" cy="9" r="9" fill="#1192E5"></circle>
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.95891 13.7654L14.6363 7.088C14.8631 6.86126 14.8631 6.4936 14.6363 6.26686L13.8152 5.44572C13.5884 5.21894 13.2208 5.21894 12.994 5.44572L7.54832 10.8914L5.00586 8.34891C4.77911 8.12217 4.41146 8.12217 4.18468 8.34891L3.36354 9.17005C3.1368 9.39679 3.1368 9.76445 3.36354 9.99119L7.13773 13.7654C7.36451 13.9922 7.73213 13.9922 7.95891 13.7654Z" fill="white"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="x-icon">
                      <circle cx="9" cy="9" r="9" fill="#C5C8CD"></circle>
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.1528 9.0376L12.6775 6.51295C12.8235 6.36694 12.8235 6.12999 12.6775 5.98374L12.0909 5.39711C11.9449 5.25109 11.7079 5.25109 11.5617 5.39711L9.03724 7.92199L6.51259 5.39734C6.36658 5.25133 6.12963 5.25133 5.98338 5.39734L5.39699 5.98374C5.25097 6.12975 5.25097 6.3667 5.39699 6.51295L7.92163 9.0376L5.39699 11.5622C5.25097 11.7083 5.25097 11.9452 5.39699 12.0915L5.98362 12.6781C6.12963 12.8241 6.36658 12.8241 6.51283 12.6781L9.03724 10.1532L11.5619 12.6779C11.7079 12.8239 11.9449 12.8239 12.0911 12.6779L12.6777 12.0912C12.8237 11.9452 12.8237 11.7083 12.6777 11.562L10.1528 9.0376Z" fill="white"></path>
                    </svg>
                  )}
                </div>
                <div className="simple-sale-column">
                  {item.simpleSale ? (
                    <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="check-icon">
                      <circle cx="9" cy="9" r="9" fill="#1192E5"></circle>
                      <path fillRule="evenodd" clipRule="evenodd" d="M7.95891 13.7654L14.6363 7.088C14.8631 6.86126 14.8631 6.4936 14.6363 6.26686L13.8152 5.44572C13.5884 5.21894 13.2208 5.21894 12.994 5.44572L7.54832 10.8914L5.00586 8.34891C4.77911 8.12217 4.41146 8.12217 4.18468 8.34891L3.36354 9.17005C3.1368 9.39679 3.1368 9.76445 3.36354 9.99119L7.13773 13.7654C7.36451 13.9922 7.73213 13.9922 7.95891 13.7654Z" fill="white"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="x-icon">
                      <circle cx="9" cy="9" r="9" fill="#C5C8CD"></circle>
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.1528 9.0376L12.6775 6.51295C12.8235 6.36694 12.8235 6.12999 12.6775 5.98374L12.0909 5.39711C11.9449 5.25109 11.7079 5.25109 11.5617 5.39711L9.03724 7.92199L6.51259 5.39734C6.36658 5.25133 6.12963 5.25133 5.98338 5.39734L5.39699 5.98374C5.25097 6.12975 5.25097 6.3667 5.39699 6.51295L7.92163 9.0376L5.39699 11.5622C5.25097 11.7083 5.25097 11.9452 5.39699 12.0915L5.98362 12.6781C6.12963 12.8241 6.36658 12.8241 6.51283 12.6781L9.03724 10.1532L11.5619 12.6779C11.7079 12.8239 11.9449 12.8239 12.0911 12.6779L12.6777 12.0912C12.8237 11.9452 12.8237 11.7083 12.6777 11.562L10.1528 9.0376Z" fill="white"></path>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
