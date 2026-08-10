import { useState, useEffect } from 'react';

export default function Countdown({ lang = 'en', targetDate: propTargetDate }) {
  const defaultDate = new Date('February 16, 2027 12:00:00 GMT+0530').getTime();
  const targetDate = propTargetDate ? new Date(propTargetDate).getTime() : defaultDate;
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate - new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft < 0) {
    return (
      <div id="countdown" className="d-flex justify-content-center">
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem',
          color: 'var(--accent-dark)',
          margin: '1.5rem 0'
        }}>
          {lang === 'fr' ? 'Les célébrations du mariage ont commencé !' : 'The Wedding Celebrations Have Begun!'}
        </p>
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div id="countdown" className="d-flex justify-content-center gap-3 my-4">
      <div className="countdown-item">
        <span id="days" className="countdown-value">{String(days).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === 'fr' ? 'Jours' : 'Days'}</span>
      </div>
      <div className="countdown-item">
        <span id="hours" className="countdown-value">{String(hours).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === 'fr' ? 'Heures' : 'Hours'}</span>
      </div>
      <div className="countdown-item">
        <span id="minutes" className="countdown-value">{String(minutes).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === 'fr' ? 'Mins' : 'Mins'}</span>
      </div>
      <div className="countdown-item">
        <span id="seconds" className="countdown-value">{String(seconds).padStart(2, '0')}</span>
        <span className="countdown-label">{lang === 'fr' ? 'Secs' : 'Secs'}</span>
      </div>
    </div>
  );
}
