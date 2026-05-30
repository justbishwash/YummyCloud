import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMoon,
  HiOutlineBell,
  HiOutlineBolt,
  HiOutlineCurrencyDollar,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import useAuthStore from '../store/useAuthStore';
import useAppStore from '../store/useAppStore';
import api from '../services/api';

function Home() {
  const { user } = useAuthStore();
  const appName = useAppStore((s) => s.appName);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const firstName = user?.name?.split(' ')[0] || 'Guest';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [storeClosed, setStoreClosed] = useState(false);
  const [storeOpenTime, setStoreOpenTime] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => { document.title = `${appName || 'Store'} - Order Online`; }, [appName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, settingsRes] = await Promise.all([
          api.getCategories(),
          api.getPublicSettings(),
        ]);
        setCategories(catRes.categories || []);
        const s = settingsRes.settings || {};
        if (s.banner_enabled === 'true' && s.banner_title) {
          setBanner({ title: s.banner_title, subtitle: s.banner_subtitle });
        }
        if (s.notice_enabled === 'true' && s.notice_text) {
          setNotice(s.notice_text);
        }
        if (s.store_open_time && s.store_close_time) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const [openH, openM] = s.store_open_time.split(':').map(Number);
          const [closeH, closeM] = s.store_close_time.split(':').map(Number);
          const openMinutes = openH * 60 + (openM || 0);
          const closeMinutes = closeH * 60 + (closeM || 0);
          let isOpen;
          if (closeMinutes < openMinutes) {
            isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
          } else {
            isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
          }
          setStoreClosed(!isOpen);
          setStoreOpenTime(s.store_open_time);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pb-4">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary to-primary-dark text-white px-5 pt-6 pb-8 rounded-b-[32px] relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-20px] left-[20%] w-24 h-24 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-white/70 font-medium">{getGreeting()}</p>
              <h1 className="text-lg font-bold mt-0.5">{firstName}</h1>
            </div>
            <Link
              to="/messages"
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <HiOutlineBell className="w-5 h-5" />
            </Link>
          </div>

          {/* Search Bar */}
          <Link
            to="/menu"
            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3.5 border border-white/10"
          >
            <HiOutlineMagnifyingGlass className="w-5 h-5 text-white/60" />
            <span className="text-sm text-white/60">Search for products...</span>
          </Link>
        </div>
      </header>

      {/* Store Closed Notice */}
      {storeClosed && (
        <div className="px-4 mt-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <HiOutlineMoon className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">We're currently closed</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Opens at {storeOpenTime ? (() => {
                    const h = parseInt(storeOpenTime.split(':')[0]);
                    const m = storeOpenTime.split(':')[1] || '00';
                    return `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
                  })() : 'later'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      {notice && (
        <div className="px-4 mt-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <HiOutlineBell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">{notice}</p>
          </div>
        </div>
      )}

      {/* Offers Banner */}
      {banner && (
        <section className="px-4 mt-4">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Offers</p>
              <p className="text-lg font-bold mt-1.5">{banner.title}</p>
              {banner.subtitle && <p className="text-xs mt-1.5 opacity-80">{banner.subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Services / Categories Grid - Super App Style */}
      <section className="px-4 mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">What do you need?</h2>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.id}`}
                className="relative rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform aspect-square"
              >
                {cat.image ? (
                  <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-3xl">{cat.icon || '📦'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <p className="absolute bottom-2 left-0 right-0 text-[11px] font-bold text-white text-center px-1 leading-tight drop-shadow-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="px-4 mt-6">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Why choose us</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <HiOutlineBolt className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] font-medium text-white/90">45 Min Delivery</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <HiOutlineCurrencyDollar className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] font-medium text-white/90">Best Prices</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <HiOutlineGlobeAlt className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] font-medium text-white/90">Nationwide</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <HiOutlineShieldCheck className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] font-medium text-white/90">Secure Pay</p>
              </div>
            </div>
            <p className="text-[9px] text-white/40 mt-4">*T&C Applied. Delivery time varies by location.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
