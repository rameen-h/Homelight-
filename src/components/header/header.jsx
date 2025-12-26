import React, { useEffect, useState } from "react";
import "./header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const header = document.querySelector(".page-header-component.hlca-experiment");
    const topLogo = document.querySelector("img.logo.top");
    const scrolledLogo = document.querySelector("img.logo.scrolled");

    const onScrollTransformations = () => {
      header.classList.add("scrolled");
      topLogo.classList.remove("show");
      scrolledLogo.classList.add("show");
    };

    const removeOnScrollTransformations = () => {
      header.classList.remove("scrolled");
      topLogo.classList.add("show"); 
      scrolledLogo.classList.remove("show");
    };

    const handleScroll = () => {
      if (window.scrollY >= 10) {
        setScrolled(true);
        onScrollTransformations();
      } else {
        setScrolled(false);
        removeOnScrollTransformations();
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initialize the scroll state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Placeholder for firePhoneButtonClick()
  const firePhoneButtonClick = (e) => {
    e.preventDefault();
    console.log("Phone button clicked");
    window.location.href = "tel:+19033005827";
  };

  return (
    <nav
      className={`page-header-component hlca-experiment clearfix ${
        scrolled ? "scrolled" : ""
      }`}
      id="global-header"
    >
      <div className="header-container">
        <div className="menu-logo">
          <a className="header-logo-component" href="/">
            <img
              alt="Homelight Logo"
              className={`logo top ${!scrolled ? "show" : ""}`}
              src="/logo_normal.png"
              width="153"
            />
            <img
              alt="Homelight Logo"
              className={`logo scrolled ${scrolled ? "show" : ""}`}
              src="/logo-new.png"
              width="153"
            />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
