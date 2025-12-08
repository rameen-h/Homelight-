import React, { useState, useEffect } from 'react';
import './notification.css';

const Notification = () => {
  const notifications = [
    {
      clientName: "Adriana F.",
      city: "Seymour",
      state: "Indiana",
      action: "just sold a home using HomeLight",
      time: "2 hours ago"
    },
    {
      clientName: "Ghodrat O.",
      city: "Baton Rouge",
      state: "Louisiana",
      action: "just sold a home using HomeLight",
      time: "5 hours ago"
    },
    {
      clientName: "Randall B.",
      city: "Cartersville",
      state: "Georgia",
      action: "just sold a home using HomeLight",
      time: "4 hours ago"
    }
  ];

  const [currentNotification, setCurrentNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const showNotification = () => {
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);

        setTimeout(() => {
          setCurrentNotification((prev) =>
            (prev + 1) % notifications.length
          );
        }, 500);
      }, 4000);
    };

    showNotification();
    const interval = setInterval(showNotification, 8500);

    return () => clearInterval(interval);
  }, []);

  if (!notifications || notifications.length === 0) return null;

  const notification = notifications[currentNotification];

  return (
    <div className={`proof unfixed ${isVisible ? 'visible' : ''}`}>
      <div className="proof-image">
        <span className="icon">
          <svg className="sale-sign-icon" viewBox="0 0 20 21">
            <path d="M19.3749538,3.00003576 C19.5572452,3.00003576 19.7069843,3.05862937 19.8241715,3.17581659 C19.9413587,3.29300381 19.9999523,3.44274284 19.9999523,3.62503427 L19.9999523,4.87503129 C19.9999523,5.05732272 19.9413587,5.20706175 19.8241715,5.32424897 C19.7069843,5.44143619 19.5572452,5.5000298 19.3749538,5.5000298 L4.99998808,5.5000298 L4.99998808,19.8749955 C4.99998808,20.057287 4.94139447,20.207026 4.82420725,20.3242132 C4.70702003,20.4414004 4.557281,20.499994 4.37498957,20.499994 L3.12499255,20.499994 C2.94270112,20.499994 2.79296209,20.4414004 2.67577487,20.3242132 C2.55858765,20.207026 2.49999404,20.057287 2.49999404,19.8749955 L2.49999404,5.5000298 L0.62499851,5.5000298 C0.442707079,5.5000298 0.292968052,5.44143619 0.175780831,5.32424897 C0.0585936103,5.20706175 0,5.05732272 0,4.87503129 L0,3.62503427 C0,3.44274284 0.0585936103,3.29300381 0.175780831,3.17581659 C0.292968052,3.05862937 0.442707079,3.00003576 0.62499851,3.00003576 L2.49999404,3.00003576 L2.49999404,1.12504023 C2.49999404,0.942748802 2.55858765,0.793009775 2.67577487,0.675822554 C2.79296209,0.558635334 2.94270112,0.500041723 3.12499255,0.500041723 L4.37498957,0.500041723 C4.557281,0.500041723 4.70702003,0.558635334 4.82420725,0.675822554 C4.94139447,0.793009775 4.99998808,0.942748802 4.99998808,1.12504023 L4.99998808,3.00003576 L19.3749538,3.00003576 Z M6.2499851,15.500006 L6.2499851,6.75002682 L18.7499553,6.75002682 L18.7499553,15.500006 L6.2499851,15.500006 Z"></path>
          </svg>
        </span>
      </div>
      <div className="proof-content">
        <div className="client-details">
          <strong className="client_name">{notification.clientName}</strong>
          &nbsp;from&nbsp;
          <strong className="city">{notification.city}</strong>
          <strong>,&nbsp;</strong>
          <strong className="state">{notification.state}</strong>
        </div>
        <div className="client-action">{notification.action}</div>
        <em className="time">{notification.time}</em>
      </div>
    </div>
  );
};

export default Notification;
