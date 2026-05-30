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

  useEffect(() => { document.title = `${appName || 'CloudKitchen'} - Order Online`; }, [appName]);

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
            <span className="text-sm text-white/60">Search for products & services...</span>
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-95 transition-transform"
              >
                <div className="w-full h-16 bg-gray-50 overflow-hidden">
                  {cat.image ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <span className="text-2xl">{cat.icon || '📦'}</span>
                    </div>
                  )}
                </div>
                <div className="px-2 py-2">
                  <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight line-clamp-2">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Trust Card */}
      <section className="px-4 mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <HiOutlineBolt className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">39 Min<br/>Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <HiOutlineCurrencyDollar className="w-4.5 h-4.5 text-green-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">Best<br/>Prices</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <HiOutlineGlobeAlt className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">Nation<br/>wide</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <HiOutlineShieldCheck className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <p className="text-[10px] font-semibold text-gray-700 mt-1.5 leading-tight">Secure<br/>Payments</p>
            </div>
          </div>
          <p className="text-[9px] text-gray-400 mt-3 text-center">*T&C Applied. Delivery time varies by location.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
