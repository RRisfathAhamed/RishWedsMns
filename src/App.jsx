import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Clock3,
  Download,
  ExternalLink,
  Heart,
  Home,
  MapPinned,
  MessageCircle,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import logoUrl from '../rm.png';
import pdfUrl from '../2026.06.06.pdf?url';


const DESTINATION = {
  lat: 7.938067381810074,
  lng: 80.59688160999525,
};
const DESTINATION_QUERY = `${DESTINATION.lat},${DESTINATION.lng}`;
const MAP_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${DESTINATION_QUERY}`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${DESTINATION_QUERY}`;
const EVENT_DATE = new Date('2026-06-06T12:30:00+05:30').getTime();
const DEFAULT_GUEST = 'Guest';

const contacts = [
  { label: 'Call us', value: '076 914 0178', href: 'tel:+94769140178' },
  { label: 'Call us', value: '077 360 4466', href: 'tel:+94773604466' },
  { label: 'Call us', value: '076 112 2292', href: 'tel:+94761122292' },
];

function getCountdownParts() {
  const diff = Math.max(0, EVENT_DATE - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function formatUnit(value) {
  return String(value).padStart(2, '0');
}

function normalizeName(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function openDirections() {
  const fallback = () => window.open(MAP_DIRECTIONS_URL, '_blank', 'noopener,noreferrer');

  if (!navigator.geolocation) {
    fallback();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const origin = `${coords.latitude},${coords.longitude}`;
      const directionsUrl = new URL('https://www.google.com/maps/dir/');
      directionsUrl.searchParams.set('api', '1');
      directionsUrl.searchParams.set('origin', origin);
      directionsUrl.searchParams.set('destination', DESTINATION_QUERY);
      window.open(directionsUrl.toString(), '_blank', 'noopener,noreferrer');
    },
    fallback,
    { enableHighAccuracy: true, maximumAge: 60000, timeout: 5000 },
  );
}

async function openPersonalizedPdf(guest) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdfWindow = window.open('', '_blank');
  if (pdfWindow) {
    pdfWindow.document.write('<title>Preparing invitation...</title><p style="font-family:serif;padding:24px">Preparing your personalized invitation...</p>');
  }
  const existingPdfBytes = await fetch(pdfUrl).then((response) => response.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const invitationPage = pdfDoc.getPage(1);
  const typedFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const displayName = guest || DEFAULT_GUEST;
  const line = { x: 120, y: 581, width: 356 };
  const bottomPadding = 8;

  let fontSize = 18;
  while (typedFont.widthOfTextAtSize(displayName, fontSize) > line.width && fontSize > 12) {
    fontSize -= 1;
  }

  invitationPage.drawText(displayName, {
    x: line.x + (line.width - typedFont.widthOfTextAtSize(displayName, fontSize)) / 2,
    y: line.y + bottomPadding,
    size: fontSize,
    font: typedFont,
    color: rgb(0.05, 0.04, 0.04),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  if (pdfWindow) {
    pdfWindow.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function Splash({ onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <main className="splash-screen" aria-label="RM invitation loading animation">
      <div className="heart-field" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            style={{
              '--delay': `${index * 0.18}s`,
              '--x': `${8 + (index % 7) * 13}%`,
            }}
          />
        ))}
      </div>
      <div className="splash-mark">
        <img src={logoUrl} alt="RM" />
        <div className="ring ring-one" />
        <div className="ring ring-two" />
      </div>
      <p>R &amp; M</p>
    </main>
  );
}

function NameGate({ onSubmit }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(normalizeName(value) || DEFAULT_GUEST);
  }

  return (
    <main className="name-screen">
      <section className="name-panel" aria-labelledby="name-title">
        <img src={logoUrl} alt="RM" className="name-logo" />
        <h1 id="name-title">Wedding Invitation</h1>
        <p>Enter your name to open your personal card.</p>
        <form onSubmit={handleSubmit} className="name-form">
          <label htmlFor="guest-name">Your name</label>
          <input
            id="guest-name"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Type your name"
            autoComplete="name"
            autoFocus
            maxLength={60}
          />
          <button type="submit">
            <Heart size={18} aria-hidden="true" />
            Open Invitation
          </button>
        </form>
      </section>
    </main>
  );
}

function Countdown() {
  const [parts, setParts] = useState(getCountdownParts);

  useEffect(() => {
    const timer = window.setInterval(() => setParts(getCountdownParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    ['Days', parts.days],
    ['Hours', parts.hours],
    ['Minutes', parts.minutes],
    ['Seconds', parts.seconds],
  ];

  return (
    <section className="countdown-band" aria-labelledby="countdown-title">
      <span className="countdown-script">Rose time</span>
      <h2 id="countdown-title">Countdown</h2>
      <div className="countdown-grid">
        {units.map(([label, value]) => (
          <div className="countdown-unit" key={label}>
            <strong>{formatUnit(value)}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemePicker({ theme, onThemeChange }) {
  const themes = [
    { id: 'rose', label: 'Rose' },
    { id: 'pearl', label: 'Pearl' },
    { id: 'garden', label: 'Garden' },
  ];

  return (
    <div className="theme-picker" aria-label="Invitation theme">
      {themes.map((item) => (
        <button
          className={theme === item.id ? 'active' : ''}
          key={item.id}
          type="button"
          onClick={() => onThemeChange(item.id)}
        >
          <span className={`theme-dot ${item.id}`} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Details() {
  const detailItems = [
    {
      icon: CalendarDays,
      label: 'Day',
      value: 'Saturday',
      note: '6th June 2026',
    },
    {
      icon: Clock3,
      label: 'Time',
      value: '12:30 PM',
      note: 'Waleema Ceremony',
    },
    {
      icon: Home,
      label: 'Venue',
      value: 'Our Residence',
      note: 'Location via QR',
      extra: '7.938067, 80.596882',
    },
  ];

  return (
    <section className="section-shell details-section" aria-labelledby="details-title">
      <div className="section-heading">
        <h2 id="details-title">When</h2>
        <p>Save the Date</p>
        <strong>06 &middot; 06 &middot; 26</strong>
      </div>
      <div className="detail-grid">
        {detailItems.map(({ icon: Icon, label, value, note, extra }) => (
          <article className="detail-card" key={label}>
            <Icon size={24} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{note}</p>
            {extra ? <small>{extra}</small> : null}
          </article>
        ))}
      </div>
      <div className="location-panel">
        <button type="button" onClick={openDirections}>
          <MapPinned size={18} aria-hidden="true" />
          Show Directions
        </button>
        <a href={MAP_SEARCH_URL} target="_blank" rel="noreferrer">
          <ExternalLink size={18} aria-hidden="true" />
          Open Location
        </a>
        <div className="qr-wrap" aria-label="Location QR code">
          <QRCodeSVG value={MAP_SEARCH_URL} size={116} level="M" marginSize={2} />
        </div>
      </div>
    </section>
  );
}

function ReachUs() {
  return (
    <section className="section-shell reach-section" aria-labelledby="reach-title">
      <div className="section-heading compact">
        <h2 id="reach-title">Reach Us</h2>
        <p>Contact Information</p>
      </div>
      <div className="contact-grid">
        {contacts.map((contact) => (
          <a className="contact-link" href={contact.href} key={contact.value}>
            <Phone size={20} aria-hidden="true" />
            <span>{contact.label}</span>
            <strong>{contact.value}</strong>
          </a>
        ))}
        <a
          className="contact-link accent"
          href="https://wa.me/94769140178"
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={20} aria-hidden="true" />
          <span>WhatsApp</span>
          <strong>Message Us</strong>
        </a>
      </div>
    </section>
  );
}

function WishForm({ guest }) {
  const [attendance, setAttendance] = useState('Yes, I will be there');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState('1');

  const whatsappUrl = useMemo(() => {
    const body = [
      'Waleema Blessing',
      `Name: ${guest}`,
      `Contact: ${phone.trim() || '-'}`,
      `Guests: ${guestCount || '1'}`,
      `Attendance: ${attendance}`,
      `Blessing: ${message.trim() || '-'}`,
    ].join('\n');
    return `https://wa.me/94769140178?text=${encodeURIComponent(body)}`;
  }, [attendance, guest, guestCount, message, phone]);

  return (
    <section className="section-shell wish-section" aria-labelledby="wish-title">
      <div className="section-heading compact">
        <h2 id="wish-title">Send a Wish</h2>
        <p>Leave your blessings for the couple</p>
      </div>
      <form className="wish-form">
        <label htmlFor="wish-name">Name</label>
        <input id="wish-name" value={guest} readOnly />

        <div className="form-row">
          <label htmlFor="wish-phone">
            Contact number
            <input
              id="wish-phone"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Your phone or WhatsApp"
            />
          </label>
          <label htmlFor="guest-count">
            Guests
            <input
              id="guest-count"
              inputMode="numeric"
              min="1"
              type="number"
              value={guestCount}
              onChange={(event) => setGuestCount(event.target.value)}
            />
          </label>
        </div>

        <fieldset>
          <legend>Will you be attending?</legend>
          <label className="choice">
            <input
              type="radio"
              name="attendance"
              checked={attendance === 'Yes, I will be there'}
              onChange={() => setAttendance('Yes, I will be there')}
            />
            <Check size={18} aria-hidden="true" />
            Yes, I will be there
          </label>
          <label className="choice">
            <input
              type="radio"
              name="attendance"
              checked={attendance === 'Unable to attend'}
              onChange={() => setAttendance('Unable to attend')}
            />
            <X size={18} aria-hidden="true" />
            Unable to attend
          </label>
        </fieldset>

        <label htmlFor="blessing">Your Blessing</label>
        <textarea
          id="blessing"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your heartfelt wishes for the couple..."
          rows={5}
        />

        <a className="send-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          <Send size={18} aria-hidden="true" />
          Send Blessing
        </a>
      </form>
    </section>
  );
}

function Invitation({ guest }) {
  const [typedName, setTypedName] = useState('');
  const [theme, setTheme] = useState('rose');
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    setTypedName('');
    const target = guest || DEFAULT_GUEST;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedName(target.slice(0, index));
      if (index >= target.length) {
        window.clearInterval(timer);
      }
    }, 85);
    return () => window.clearInterval(timer);
  }, [guest]);

  async function handlePdfOpen() {
    setIsPdfLoading(true);
    try {
      await openPersonalizedPdf(guest);
    } finally {
      setIsPdfLoading(false);
    }
  }

  return (
    <main className={`invite-page theme-${theme}`}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <ThemePicker theme={theme} onThemeChange={setTheme} />
          <p className="bismillah">
            <span className="arabic-bismillah" dir="rtl">
              بِسْمِ ٱللّٰهِ ٱلرَّحْمٰنِ ٱلرَّحِيمِ
            </span>
            <span className="english-bismillah">
              In the name of Allah, The Most Beneficent, The Most Merciful
            </span>
          </p>
          <p className="dear-line">
            Dear <span>{typedName}</span>
            <span className="caret" aria-hidden="true" />,
          </p>
          <img src={logoUrl} alt="RM" className="hero-logo" />
          <h1 id="hero-title">Wedding Invitation</h1>
          <div className="date-graphic" aria-label="2026 06 06">
            <span className="date-flourish" aria-hidden="true" />
            <div className="date-cardlet">
              <span>2026</span>
              <strong>06</strong>
              <small>June</small>
            </div>
            <span className="date-star" aria-hidden="true">&#10022;</span>
            <div className="date-cardlet focus">
              <span>Day</span>
              <strong>06</strong>
              <small>Saturday</small>
            </div>
            <span className="date-star" aria-hidden="true">&#10022;</span>
            <div className="date-cardlet">
              <span>Time</span>
              <strong>12:30</strong>
              <small>PM</small>
            </div>
            <span className="date-flourish right" aria-hidden="true" />
          </div>
          <p className="request-line">
            Request the pleasure of your presence at the Waleema Ceremony of
          </p>
          <div className="couple-block">
            <strong>Risfath Ahamed</strong>
            <span>Son of Mr &amp; Mrs Rifaideen</span>
            <em>&amp;</em>
            <strong>Seenath Maneesha</strong>
            <span>Daughter of Mr &amp; Mrs Ahamed</span>
          </div>
          <div className="hero-actions">
            <button type="button" onClick={openDirections}>
              <MapPinned size={18} aria-hidden="true" />
              Get Directions
            </button>
            <button
              className="pdf-button"
              type="button"
              onClick={handlePdfOpen}
              disabled={isPdfLoading}
            >
              <Download size={18} aria-hidden="true" />
              {isPdfLoading ? 'Preparing PDF' : 'Open PDF'}
            </button>
          </div>
        </div>
      </section>

      <Countdown />
      <Details />
      <WishForm guest={guest} />
      <ReachUs />
    </main>
  );
}

export default function App() {
  const [stage, setStage] = useState('splash');
  const [guest, setGuest] = useState(DEFAULT_GUEST);

  if (stage === 'splash') {
    return <Splash onDone={() => setStage('name')} />;
  }

  if (stage === 'name') {
    return (
      <NameGate
        onSubmit={(name) => {
          setGuest(name);
          setStage('invite');
        }}
      />
    );
  }

  return <Invitation guest={guest} />;
}
