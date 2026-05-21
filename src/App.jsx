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
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || '/api/mock-sheets';

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
    pdfWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Preparing your Invitation…</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#080604;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;font-family:'Cormorant Garamond',Georgia,serif}

/* ── Floating petals ── */
.petal{position:fixed;border-radius:50% 0 50% 0;opacity:0;animation:fall linear infinite;pointer-events:none}
@keyframes fall{
  0%{transform:translateY(-80px) rotate(0deg);opacity:0}
  8%{opacity:.75}
  88%{opacity:.45}
  100%{transform:translateY(110vh) rotate(720deg);opacity:0}
}

/* ── Sparkles ── */
.sparkle{position:fixed;border-radius:50%;background:#f0d8b8;animation:twinkle ease-in-out infinite;pointer-events:none}
@keyframes twinkle{
  0%,100%{opacity:0;transform:scale(0)}
  50%{opacity:1;transform:scale(1)}
}

/* ── Photo ── */
.photo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:24px}
.photo-frame{position:relative;width:130px;height:130px;animation:floatIn 1.2s cubic-bezier(.34,1.56,.64,1) forwards,floatY 4s ease-in-out 1.2s infinite}
@keyframes floatIn{from{opacity:0;transform:scale(.6) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.shimmer-ring{position:absolute;inset:-5px;border-radius:50%;border:1.5px solid transparent;background:linear-gradient(#080604,#080604) padding-box,conic-gradient(#c89060,#f0d08050,#c89060,#f0d08050,#c89060) border-box;animation:shimSpin 4s linear infinite}
@keyframes shimSpin{to{transform:rotate(360deg)}}
.glow-bg{position:absolute;inset:-20px;border-radius:50%;background:radial-gradient(circle,rgba(200,140,90,.22) 0%,transparent 70%);animation:glowPulse 3s ease-in-out infinite}
@keyframes glowPulse{0%,100%{opacity:.6;transform:scale(.95)}50%{opacity:1;transform:scale(1.05)}}
.photo{width:130px;height:130px;border-radius:50%;object-fit:cover;object-position:center center;border:2px solid rgba(200,140,90,.4);box-shadow:0 8px 32px rgba(0,0,0,.6),0 0 20px rgba(200,140,90,.2);display:block;position:relative;z-index:1}

/* ── Text ── */
.names{font-family:'Great Vibes',cursive;font-size:44px;color:#c89060;letter-spacing:2px;animation:riseIn 1s ease .5s both}
.divider{display:flex;align-items:center;gap:10px;justify-content:center;margin:10px 0;animation:riseIn 1s ease .7s both}
.divider::before,.divider::after{content:'';flex:1;max-width:50px;height:1px;background:linear-gradient(90deg,transparent,rgba(200,140,90,.5))}
.date{font-size:12px;letter-spacing:5px;color:rgba(200,160,110,.7);text-transform:uppercase}
.msg{font-size:12px;letter-spacing:3.5px;text-transform:uppercase;color:rgba(200,160,110,.45);margin-top:28px;animation:riseIn 1s ease .9s both}
@keyframes riseIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

/* ── Bouncing dots ── */
.dots{display:flex;gap:7px;justify-content:center;margin-top:14px;animation:riseIn 1s ease 1.1s both}
.dot{width:6px;height:6px;border-radius:50%;background:#c89060;animation:bounce 1.6s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.25s}.dot:nth-child(3){animation-delay:.5s}
@keyframes bounce{0%,100%{transform:translateY(0);opacity:.3}50%{transform:translateY(-7px);opacity:1}}
</style>
</head>
<body>
<div style="text-align:center;position:relative;z-index:10">
  <div class="photo-wrap">
    <div class="photo-frame">
      <div class="glow-bg"></div>
      <div class="shimmer-ring"></div>
      <img class="photo" src="${logoUrl}" alt="Risfath & Maneesha"/>
    </div>
  </div>
  <div class="names">Risfath &amp; Maneesha</div>
  <div class="divider"><span class="date">06 · 06 · 2026</span></div>
  <div class="msg">Crafting your invitation</div>
  <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
</div>
<script>
  // petals
  const colors=['#f4c2c2','#f0b8b8','#e8d0c0','#f8e0d0'];
  for(let i=0;i<22;i++){
    const p=document.createElement('div');
    p.className='petal';
    const s=6+Math.random()*9;
    p.style.cssText='left:'+Math.random()*100+'vw;width:'+s+'px;height:'+(s*1.4)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation-duration:'+(7+Math.random()*9)+'s;animation-delay:'+(Math.random()*8)+'s';
    document.body.appendChild(p);
  }
  // sparkles
  for(let i=0;i<35;i++){
    const sp=document.createElement('div');
    sp.className='sparkle';
    const s=2+Math.random()*4;
    sp.style.cssText='left:'+Math.random()*100+'vw;top:'+Math.random()*100+'vh;width:'+s+'px;height:'+s+'px;animation-duration:'+(2+Math.random()*3)+'s;animation-delay:'+(Math.random()*5)+'s';
    document.body.appendChild(sp);
  }
<\/script>
</body>
</html>`);
    pdfWindow.document.close();
  }
  const [existingPdfBytes] = await Promise.all([
    fetch(pdfUrl).then((response) => response.arrayBuffer()),
    new Promise((resolve) => window.setTimeout(resolve, 4000)),
  ]);
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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const whatsappUrl = useMemo(() => {
    const body = [
      'Waleema RSVP & Blessing',
      `Name: ${guest}`,
      `Contact: ${phone.trim() || '-'}`,
      `Guests: ${guestCount || '1'}`,
      `Attendance: ${attendance}`,
      `Blessing: ${message.trim() || '-'}`,
    ].join('\n');
    return `https://wa.me/94769140178?text=${encodeURIComponent(body)}`;
  }, [attendance, guest, guestCount, message, phone]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!SCRIPT_URL) {
      // If SCRIPT_URL is not configured, fall back to open WhatsApp directly
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setSubmitting(true);
    setSubmitError(false);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'rsvp',
          name: guest,
          phone: phone,
          guestsCount: guestCount,
          attendance: attendance,
          message: message,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.warn('Error saving RSVP to Google Sheets:', error);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-shell wish-section" aria-labelledby="wish-title">
      <div className="section-heading compact">
        <h2 id="wish-title">Send a Wish</h2>
        <p>Leave your blessings for the couple</p>
      </div>
      {submitted ? (
        <div className="wish-success-card">
          <div className="success-icon-ring">
            <Check size={36} className="success-check" aria-hidden="true" />
          </div>
          <h3>Blessing Sent!</h3>
          <p>Your RSVP details have been recorded successfully. Thank you for your warm wishes!</p>
          <div className="success-actions">
            <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={18} aria-hidden="true" />
              Also Notify via WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="wish-form">
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

          {submitError && (
            <p className="error-note" role="alert">
              Unable to save to Google Sheets. You can retry, or send directly via WhatsApp below!
            </p>
          )}

          <div className="wish-actions-row">
            <button type="submit" className="send-button" disabled={submitting}>
              <Send size={18} aria-hidden="true" />
              {submitting ? 'Saving...' : 'Send Blessing'}
            </button>

            {submitError && (
              <a className="whatsapp-fallback-button" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={18} aria-hidden="true" />
                Send via WhatsApp
              </a>
            )}
          </div>
        </form>
      )}
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
            <strong>Zeenath Maneesha</strong>
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
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get('g') || params.get('name') || params.get('guest') || params.get('to');
      if (nameParam) {
        const cleanName = normalizeName(nameParam);
        if (cleanName) {
          setGuest(cleanName);
          setIsPrefilled(true);
        }
      }
    } catch (error) {
      console.warn('Failed to parse guest name from URL parameters:', error);
    }
  }, []);

  useEffect(() => {
    if (stage === 'invite' && isPrefilled && guest && guest !== DEFAULT_GUEST && SCRIPT_URL) {
      // Fire-and-forget logging to track who opened the link
      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'open',
          name: guest,
        }),
      }).catch((error) => {
        console.warn('Google Sheets open logging skipped or failed:', error);
      });
    }
  }, [stage, isPrefilled, guest]);

  if (stage === 'splash') {
    return <Splash onDone={() => setStage(isPrefilled ? 'invite' : 'name')} />;
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
