import React, { useState, useEffect, useRef } from 'react';
import { fetchBanners, addBanner, deleteBanner, uploadImage } from '../utils/api';

interface Slide {
  id: number;
  img: string;
  media?: 'image' | 'video';
  target: { type: 'category' | 'store'; value: string };
}

// Bazada banner bo'lmasa ko'rsatiladigan standart rasmlar
const defaultSlides: Slide[] = [
  { id: 1, img: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1200", target: { type: 'store', value: 'LM Gold' } },
  { id: 2, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200", target: { type: 'store', value: 'Fonon' } },
  { id: 3, img: "https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&q=80&w=1200", target: { type: 'category', value: 'silver' } },
  { id: 4, img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200", target: { type: 'store', value: 'Zarbazzar' } },
];

interface AdSliderProps {
  onBannerClick: (target: { type: 'category' | 'store'; value: string }) => void;
  isAdmin?: boolean;
}

export const AdSlider: React.FC<AdSliderProps> = ({ onBannerClick, isAdmin = false }) => {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners()
      .then((b) => { if (Array.isArray(b) && b.length) setSlides(b); else setSlides(defaultSlides); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (slides.length ? (prev + 1) % slides.length : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    setUploading(true);
    try {
      let url = '';
      if (isVideo) {
        // Video katta bo'lgani uchun to'g'ridan-to'g'ri Vercel Blob'ga yuklaymiz
        const { upload } = await import('@vercel/blob/client');
        const blob = await upload(`banners/${Date.now()}-${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/blob-upload',
        });
        url = blob.url;
      } else {
        const up = await uploadImage(file);
        if (!up.ok || !up.url) { alert('Rasm yuklanmadi: ' + (up.error || '')); return; }
        url = up.url;
      }
      const res = await addBanner(url, { type: 'category', value: 'gold' }, isVideo ? 'video' : 'image');
      if (res.ok && res.banners) setSlides(res.banners.length ? res.banners : defaultSlides);
      else alert(res.error || 'Xatolik');
    } catch (err) {
      alert((isVideo ? "Video yuklanmadi (Vercel'da Blob store yarating): " : 'Xatolik: ') + String(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteBanner(id);
    if (res.ok) setSlides(res.banners && res.banners.length ? res.banners : defaultSlides);
    else alert(res.error || 'Xatolik');
  };

  // Qo'lda surish (chap/o'ng)
  const touchX = useRef(0);
  const goNext = () => setIndex((p) => (slides.length ? (p + 1) % slides.length : 0));
  const goPrev = () => setIndex((p) => (slides.length ? (p - 1 + slides.length) % slides.length : 0));
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50 && slides.length > 1) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  return (
    <div
      className="relative h-80 m-4 rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] group cursor-pointer transition-all"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-sm"></div>

      {slides.map((slide, i) => (
        <div
          key={slide.id}
          onClick={() => onBannerClick(slide.target)}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 pointer-events-none"></div>
          {(slide.media === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(slide.img)) ? (
            <video
              src={slide.img}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          ) : (
            <img src={slide.img} referrerPolicy="no-referrer" alt="Promotion" className="w-full h-full object-cover" />
          )}
        </div>
      ))}

      {/* Admin boshqaruvi — faqat admin ko'radi */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-40 flex gap-2">
          <label
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            title="Reklama qo'shish"
          >
            {uploading ? <i className="fas fa-circle-notch fa-spin text-sm"></i> : <i className="fas fa-plus text-sm"></i>}
            <input type="file" hidden accept="image/*,video/*" onChange={handleAdd} />
          </label>
          {slides.length > 0 && slides[index] && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(slides[index].id); }}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur text-red-400 border border-red-400/40 flex items-center justify-center active:scale-90 transition-transform"
              title="Joriy reklamani o'chirish"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          )}
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center active:scale-90 transition-transform">
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center active:scale-90 transition-transform">
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-3 py-1.5 rounded-full glass-effect">
        {slides.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-[#d4af37]' : 'w-1 bg-white/30'}`}></div>
        ))}
      </div>
    </div>
  );
};
