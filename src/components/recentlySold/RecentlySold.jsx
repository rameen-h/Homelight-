import { useState, useEffect } from 'react';
import './RecentlySold.css';

const RecentlySold = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const soldProperties = [
    {
      id: 1,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306595849/property_image_Sandicor_306595849_0.jpg',
      location: '5705  Mistridge Rancho Palos Verdes, CA',
      price: '$6,000',
      beds: 4,
      baths: 4,
      sqft: 2197,
      url: 'https://www.homelight.com/homes/los-angeles-county-ca/5705-mistridge-rancho-palos-verdes-ca-90275-a35d21660c1d11e881a1128184e0bc72',
      label: 'Sold in under 3 days'
    },
    {
      id: 2,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306595384/property_image_Sandicor_306595384_0.jpg',
      location: '77  Clouds Irvine, CA',
      price: '$4,600',
      beds: 2,
      baths: 2,
      sqft: 1244,
      url: 'https://www.homelight.com/homes/orange-county-va/77-clouds-irvine-va-92603-ce61104c0d4f11e8883b128184e0bc72',
      label: 'Sold in under 10 days'
    },
    {
      id: 3,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306594613/property_image_Sandicor_306594613_0.jpg',
      location: '22511  Eddridge Drive Diamond Bar, CA',
      price: '$3,995',
      beds: 4,
      baths: 2,
      sqft: 1600,
      url: 'https://www.homelight.com/homes/los-angeles-county-ca/22511-eddridge-drive-diamond-bar-ca-91765-bea139200bec11e8a11c128184e0bc72',
      label: 'Sold in under 8 days'
    },
    {
      id: 4,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306594307/property_image_Sandicor_306594307_0.jpg',
      location: '12571  Heartleaf Moreno Valley, CA',
      price: '$2,950',
      beds: 4,
      baths: 2,
      sqft: 1755,
      url: 'https://www.homelight.com/homes/riverside-county-ca/12571-heartleaf-moreno-valley-ca-92553-633f2184c3c211e9be8012b09cbafc98',
      label: 'Sold in under 8 days'
    },
    {
      id: 5,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306593162/property_image_Sandicor_306593162_0.jpg',
      location: '13259  Norton Chino, CA',
      price: '$2,500',
      beds: 2,
      baths: 1,
      sqft: 960,
      url: 'https://www.homelight.com/homes/san-bernardino-county-ca/13259-norton-chino-ca-91710-ebfb4ba80c0b11e89bfb128184e0bc72',
      label: 'Sold in under 9 days'
    },
    {
      id: 6,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306592809/property_image_Sandicor_306592809_0.jpg',
      location: '13332  Savanna Tustin, CA',
      price: '$3,300',
      beds: 2,
      baths: 2,
      sqft: 1105,
      url: 'https://www.homelight.com/homes/orange-county-va/13332-savanna-tustin-va-92782-9cda06280d6311e8bff8128184e0bc72',
      label: 'Sold in under 11 days'
    },
    {
      id: 7,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590605/property_image_Sandicor_306590605_0.jpg',
      location: '10515  Valjean Avenue Granada Hills, CA',
      price: '$4,500',
      beds: 3,
      baths: 2,
      sqft: 1465,
      url: 'https://www.homelight.com/homes/los-angeles-county-ca/10515-valjean-avenue-granada-hills-ca-91344-736ecaf40d5311e8accd128184e0bc72',
      label: 'Sold in under 27 days'
    },
    {
      id: 8,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590015/property_image_Sandicor_306590015_0.jpg',
      location: '564 N Bellflower 316 Long Beach, CA',
      price: '$2,200',
      beds: 1,
      baths: 1,
      sqft: 693,
      url: '"https://www.homelight.com/homes/los-angeles-county-ca/564-n-bellflower-316-long-beach-ca-90814-4b2a9328a26a11e8aa38128184e0bc72',
      label: 'Sold in under 9 days'
    },
    {
      id: 9,
      image: 'https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590053/property_image_Sandicor_306590053_0.jpg',
      location: '1070 E Woodbury Road Pasadena, CA',
      price: '$3,300',
      beds: 1,
      baths: 1,
      sqft: 800,
      url: 'https://www.homelight.com/homes/los-angeles-county-ca/1070-e-woodbury-road-pasadena-ca-91104-31a070297777a990a6d8dcc6e0ad79fe',
      label: 'Sold in under 17 days'
    },
    {
      "id": 10,
      "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306595849/property_image_Sandicor_306595849_0.jpg",
      "location": "5705 Mistridge Rancho Palos Verdes, CA",
      "price": "$6,000",
      "beds": 4,
      "baths": 4,
      "sqft": 2197,
      "url": "https://www.homelight.com/homes/los-angeles-county-ca/5705-mistridge-rancho-palos-verdes-ca-90275-a35d21660c1d11e881a1128184e0bc72",
      "label": "Sold in under 3 days"
    },
    {
      "id": 11,
      "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306595384/property_image_Sandicor_306595384_0.jpg",
      "location": "77 Clouds Irvine, CA",
      "price": "$4,600",
      "beds": 2,
      "baths": 2,
      "sqft": 1244,
      "url": "https://www.homelight.com/homes/orange-county-va/77-clouds-irvine-va-92603-ce61104c0d4f11e8883b128184e0bc72",
      "label": "Sold in under 10 days"
    },
    {
      "id": 12,
      "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306594613/property_image_Sandicor_306594613_0.jpg",
      "location": "22511 Eddridge Drive Diamond Bar, CA",
      "price": "$3,995",
      "beds": 4,
      "baths": 2,
      "sqft": 1600,
      "url": "https://www.homelight.com/homes/los-angeles-county-ca/22511-eddridge-drive-diamond-bar-ca-91765-bea139200bec11e8a11c128184e0bc72",
      "label": "Sold in under 8 days"
    },
    {
    "id": 13,
    "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306594307/property_image_Sandicor_306594307_0.jpg",
    "location": "12571 Heartleaf Moreno Valley, CA",
    "price": "$2,950",
    "beds": 4,
    "baths": 2,
    "sqft": 1105,
    "url": "https://www.homelight.com/homes/riverside-county-ca/12571-heartleaf-moreno-valley-ca-92553-633f2184c3c211e9be8012b09cbafc98",
    "label": "Sold in under 8 days"
  },
  {
  "id": 14,
  "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306593162/property_image_Sandicor_306593162_0.jpg",
  "location": "13259 Norton Chino, CA",
  "price": "$2,500",
  "beds": 2,
  "baths": 1,
  "sqft": 960,
  "url": "https://www.homelight.com/homes/san-bernardino-county-ca/13259-norton-chino-ca-91710-ebfb4ba80c0b11e89bfb128184e0bc72",
  "label": "Sold in under 9 days"
},
{
  "id": 15,
  "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306592809/property_image_Sandicor_306592809_0.jpg",
  "location": "13332 Savanna Tustin, CA",
  "price": "$3,300",
  "beds": 2,
  "baths": 2,
  "sqft": 1105,
  "url": "https://www.homelight.com/homes/orange-county-va/13332-savanna-tustin-va-92782-9cda06280d6311e8bff8128184e0bc72",
  "label": "Sold in under 11 days"
},
{
  "id": 16,
  "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590605/property_image_Sandicor_306590605_0.jpg",
  "location": "10515 Valjean Avenue Granada Hills, CA",
  "price": "$4,500",
  "beds": 3,
  "baths": 2,
  "sqft": 1465,
  "url": "https://www.homelight.com/homes/los-angeles-county-ca/10515-valjean-avenue-granada-hills-ca-91344-736ecaf40d5311e8accd128184e0bc72",
  "label": "Sold in under 27 days"
},
{
  "id": 17,
  "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590015/property_image_Sandicor_306590015_0.jpg",
  "location": "564 N Bellflower 316 Long Beach, CA",
  "price": "$2,200",
  "beds": 1,
  "baths": 1,
  "sqft": 693,
  "url": "https://www.homelight.com/homes/los-angeles-county-ca/564-n-bellflower-316-long-beach-ca-90814-4b2a9328a26a11e8aa38128184e0bc72",
  "label": "Sold in under 9 days"
},{
  "id": 18,
  "image": "https://mls-media.homelight.com/sandicor/property/image/property_image_Sandicor_306590053/property_image_Sandicor_306590053_0.jpg",
  "location": "1070 E Woodbury Road Pasadena, CA",
  "price": "$3,300",
  "beds": 1,
  "baths": 1,
  "sqft": 800,
  "url": "https://www.homelight.com/homes/los-angeles-county-ca/1070-e-woodbury-road-pasadena-ca-91104-31a070297777a990a6d8dcc6e0ad79fe",
  "label": "Sold in under 17 days"
}
  ];

  // Change items per slide based on screen size
  const itemsPerSlide = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(soldProperties.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentProperties = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return soldProperties.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div className="recently-sold-section">
      <div className="recently-sold-container">
        {/* Header */}
        <div className="recently-sold-header">
          <h2 className="recently-sold-title">
            Recently Sold with Simple Sale<sup>®</sup>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="carousel-wrapper">
          {/* Previous Arrow */}
          <button
            className="carousel-arrow carousel-arrow-prev"
            onClick={prevSlide}
            aria-label="Previous properties"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Property Grid */}
          <div className="recently-sold-grid">
            {getCurrentProperties().map((property) => (
              <div key={property.id}>
                <a href={property.url || '#'} className="property-card">
                  <img
                    className="property-card__img"
                    src={property.image}
                    alt={property.label || `Property in ${property.location}`}
                  />
                  <div className="property-card__overlay"></div>
                  {property.label && (
                    <div className="property-card__label">{property.label}</div>
                  )}
                  <div className="property-card__specs">
                    <span className="property-card__specs__price">{property.price}</span>
                    <span className="property-card__specs__address">{property.location}</span>
                    <div className="property-card__specs__areas">
                      <div>
                        <svg className="beds-light-icon" viewBox="0 0 14 12" role="img">
                          <title>Beds</title>
                          <path d="M2.14286 3.42857C2.14286 3.20124 2.23316 2.98323 2.39391 2.82248C2.55465 2.66173 2.77267 2.57143 3 2.57143H5.57143C5.79876 2.57143 6.01677 2.66173 6.17752 2.82248C6.33827 2.98323 6.42857 3.20124 6.42857 3.42857V4.28571H7.28571V3.42857C7.28571 3.20124 7.37602 2.98323 7.53677 2.82248C7.69751 2.66173 7.91553 2.57143 8.14286 2.57143H10.7143C10.9416 2.57143 11.1596 2.66173 11.3204 2.82248C11.4811 2.98323 11.5714 3.20124 11.5714 3.42857V4.28571H12.8571V0.857143C12.8571 0.629814 12.7668 0.411797 12.6061 0.251051C12.4453 0.0903058 12.2273 0 12 0H1.71429C1.48696 0 1.26894 0.0903058 1.10819 0.251051C0.947449 0.411797 0.857143 0.629814 0.857143 0.857143V4.28571H2.14286V3.42857ZM12 5.14286H1.71429C1.25963 5.14286 0.823594 5.32347 0.502103 5.64496C0.180612 5.96645 0 6.40249 0 6.85714L0 11.5714C0 11.6851 0.0451529 11.7941 0.125526 11.8745C0.205898 11.9548 0.314907 12 0.428571 12H1.28571C1.39938 12 1.50839 11.9548 1.58876 11.8745C1.66913 11.7941 1.71429 11.6851 1.71429 11.5714V10.2857H12V11.5714C12 11.6851 12.0452 11.7941 12.1255 11.8745C12.2059 11.9548 12.3149 12 12.4286 12H13.2857C13.3994 12 13.5084 11.9548 13.5888 11.8745C13.6691 11.7941 13.7143 11.6851 13.7143 11.5714V6.85714C13.7143 6.40249 13.5337 5.96645 13.2122 5.64496C12.8907 5.32347 12.4547 5.14286 12 5.14286Z"></path>
                        </svg>
                        {property.beds}
                      </div>
                      <div>
                        <svg className="baths-light-icon" viewBox="0 0 14 14" role="img">
                          <title>Baths</title>
                          <path d="M0.87499 10.5C0.875743 10.8674 0.954077 11.2304 1.10486 11.5654C1.25565 11.9004 1.47548 12.1998 1.74998 12.4439V13.5625C1.74998 13.6785 1.79607 13.7898 1.87812 13.8719C1.96017 13.9539 2.07144 14 2.18748 14H3.06247C3.1785 14 3.28978 13.9539 3.37182 13.8719C3.45387 13.7898 3.49996 13.6785 3.49996 13.5625V13.125H10.4999V13.5625C10.4999 13.6785 10.546 13.7898 10.628 13.8719C10.7101 13.9539 10.8213 14 10.9374 14H11.8124C11.9284 14 12.0397 13.9539 12.1217 13.8719C12.2038 13.7898 12.2499 13.6785 12.2499 13.5625V12.4439C12.5244 12.1998 12.7442 11.9004 12.895 11.5654C13.0458 11.2304 13.1241 10.8674 13.1249 10.5V9.18755H0.87499V10.5ZM13.5623 7.00008H2.18748V1.89369C2.18772 1.77887 2.22197 1.66669 2.2859 1.57131C2.34983 1.47592 2.44057 1.40161 2.54668 1.35774C2.6528 1.31386 2.76952 1.3024 2.88214 1.32479C2.99476 1.34718 3.09823 1.40242 3.1795 1.48354L3.7064 2.01017C3.34738 2.8272 3.49832 3.62644 3.9421 4.19027L3.93746 4.19491C3.85572 4.27692 3.80983 4.38798 3.80983 4.50376C3.80983 4.61954 3.85572 4.7306 3.93746 4.8126L4.24671 5.12186C4.28734 5.16249 4.33557 5.19473 4.38866 5.21672C4.44174 5.23871 4.49864 5.25003 4.5561 5.25003C4.61356 5.25003 4.67046 5.23871 4.72355 5.21672C4.77663 5.19473 4.82487 5.16249 4.86549 5.12186L7.74667 2.24068C7.78731 2.20005 7.81954 2.15182 7.84153 2.09873C7.86353 2.04565 7.87485 1.98875 7.87485 1.93129C7.87485 1.87383 7.86353 1.81693 7.84153 1.76384C7.81954 1.71076 7.78731 1.66252 7.74667 1.6219L7.43742 1.31264C7.35538 1.23066 7.24414 1.1846 7.12816 1.1846C7.01218 1.1846 6.90095 1.23066 6.81891 1.31264L6.81426 1.31729C6.25044 0.873507 5.45174 0.722571 4.63417 1.08159L4.10753 0.554682C3.84272 0.289835 3.50531 0.109468 3.13798 0.0363931C2.77065 -0.0366822 2.3899 0.000816319 2.04388 0.144146C1.69786 0.287476 1.40212 0.530199 1.19406 0.841618C0.985996 1.15304 0.874959 1.51916 0.87499 1.89369V7.00008H0.437495C0.321464 7.00008 0.210186 7.04617 0.128139 7.12822C0.0460931 7.21026 0 7.32154 0 7.43757L0 7.87507C0 7.9911 0.0460931 8.10238 0.128139 8.18443C0.210186 8.26647 0.321464 8.31256 0.437495 8.31256H13.5623C13.6784 8.31256 13.7897 8.26647 13.8717 8.18443C13.9538 8.10238 13.9998 7.9911 13.9998 7.87507V7.43757C13.9998 7.32154 13.9538 7.21026 13.8717 7.12822C13.7897 7.04617 13.6784 7.00008 13.5623 7.00008Z"></path>
                        </svg>
                        {property.baths}
                      </div>
                      {property.sqft && (
                        <div>
                          <svg viewBox="0 0 14 14" role="img">
                            <path d="M13.717 12.3616L12.3181 10.9627L11.2634 12.0173C11.1781 12.1026 11.0395 12.1026 10.9542 12.0173L10.6449 11.708C10.5596 11.6227 10.5596 11.4841 10.6449 11.3988L11.6996 10.3441L10.1527 8.79731L9.09809 9.85195C9.01277 9.93727 8.87414 9.93727 8.78883 9.85195L8.47957 9.5427C8.39426 9.45738 8.39426 9.31875 8.47957 9.23344L9.53422 8.17879L7.98738 6.63195L6.93273 7.6866C6.84742 7.77191 6.70879 7.77191 6.62348 7.6866L6.31422 7.37734C6.22891 7.29203 6.22891 7.1534 6.31422 7.06809L7.36887 6.01344L5.82203 4.4666L4.76738 5.52125C4.68207 5.60656 4.54344 5.60656 4.45812 5.52125L4.14887 5.21199C4.06355 5.12668 4.06355 4.98805 4.14887 4.90273L5.20352 3.84809L3.65586 2.3007L2.60121 3.35535C2.5159 3.44066 2.37727 3.44066 2.29195 3.35535L1.9827 3.04609C1.89738 2.96078 1.89738 2.82215 1.9827 2.73684L3.03734 1.68219L1.63816 0.283008C1.44266 0.0875 1.2023 0 0.966601 0C0.47332 0 0 0.383086 0 0.96168V13.0402C0 13.5704 0.42957 14 0.959766 14H13.0383C13.8934 14 14.3216 12.9664 13.717 12.3616ZM3.5 10.5V7.09461L6.90539 10.5H3.5Z"></path>
                          </svg>
                          {property.sqft}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Next Arrow */}
          <button
            className="carousel-arrow carousel-arrow-next"
            onClick={nextSlide}
            aria-label="Next properties"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlySold;
