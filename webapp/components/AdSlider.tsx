import React, { useState, useEffect, useRef } from 'react';
import { fetchBanners, addBanner, deleteBanner, uploadImage } from '../utils/api';

interface Slide {
  id: number;
  img: string;
  media?: 'image' | 'video' | 'youtube';
  target: { type: 'category' | 'store'; value: string };
  link?: string; // bosilganda ochiladigan tashqi havola (ixtiyoriy)
}

// YouTube havolasidan video ID ni ajratadi (watch, youtu.be, shorts, embed)
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// Tashqi havolani ochadi (Telegram ichida yoki oddiy brauzerda)
function openExternal(url: string) {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink && /^https?:\/\/t\.me\//i.test(url)) tg.openTelegramLink(url);
    else if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank');
  } catch {
    window.open(url, '_blank');
  }
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
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null); // hozir o'ynayotgan video/YouTube

  useEffect(() => {
    fetchBanners()
      .then((b) => { if (Array.isArray(b) && b.length) setSlides(b); else setSlides(defaultSlides); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (playingId !== null) return; // video/YouTube o'ynayapti — to'liq tomosha uchun to'xtatamiz
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, index, playingId]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  // Slayd almashganda o'ynayotgan videoni to'xtatamiz (yana surish ishlasin)
  useEffect(() => { setPlayingId(null); }, [index]);

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
      const res = await addBanner(url, { type: 'category', value: 'gold' }, isVideo ? 'video' : 'image', linkValue.trim());
      if (res.ok && res.banners) { setSlides(res.banners.length ? res.banners : defaultSlides); setLinkValue(''); }
      else alert(res.error || 'Xatolik');
    } catch (err) {
      alert(
        (isVideo
          ? "Video yuklanmadi. Vercel'da Blob store yarating YOKI '\uD83D\uDD17' tugmasi orqali video havolasini qo'shing.\n\n"
          : 'Xatolik: ') + String(err)
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Havola (URL) orqali rasm/video/YouTube qo'shish — Blob storesiz ham ishlaydi
  const handleAddUrl = async () => {
    const url = urlValue.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) { alert("To'g'ri havola kiriting (https://...)"); return; }
    const ytId = youtubeId(url);
    let media: 'image' | 'video' | 'youtube' = 'image';
    let mediaUrl = url;
    if (ytId) {
      media = 'youtube';
      mediaUrl = `https://www.youtube.com/embed/${ytId}`;
    } else if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url)) {
      media = 'video';
    }
    setUploading(true);
    try {
      const res = await addBanner(mediaUrl, { type: 'category', value: 'gold' }, media, linkValue.trim());
      if (res.ok && res.banners) {
        setSlides(res.banners.length ? res.banners : defaultSlides);
        setUrlValue('');
        setLinkValue('');
        setUrlMode(false);
      } else {
        alert(res.error || 'Xatolik');
      }
    } catch (err) {
      alert('Xatolik: ' + String(err));
    } finally {
      setUploading(false);
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

      {slides.map((slide, i) => {
        const isVideoFile = slide.media === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(slide.img);
        const isYouTube = slide.media === 'youtube';
        const isPlaying = playingId === slide.id;
        const ytId = isYouTube ? youtubeId(slide.img) : null;
        const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
        return (
          <div
            key={slide.id}
            onClick={() => { if (slide.link) openExternal(slide.link); else onBannerClick(slide.target); }}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 pointer-events-none"></div>

            {isYouTube ? (
              isPlaying ? (
                <iframe
                  src={`${slide.img}?autoplay=1&rel=0&playsinline=1`}
                  title="YouTube reklama"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img src={ytThumb} referrerPolicy="no-referrer" alt="YouTube" className="w-full h-full object-cover" />
              )
            ) : isVideoFile ? (
              isPlaying ? (
                <video
                  src={slide.img}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  controls
                />
              ) : (
                // Poster: birinchi kadr ko'rinadi, lekin touch'ni o'tkazadi (surish ishlasin)
                <video
                  src={slide.img}
                  className="w-full h-full object-cover pointer-events-none"
                  muted
                  playsInline
                  preload="metadata"
                />
              )
            ) : (
              <img src={slide.img} referrerPolicy="no-referrer" alt="Promotion" className="w-full h-full object-cover" />
            )}

            {/* Play tugmasi — video/YouTube poster ustida */}
            {(isYouTube || isVideoFile) && !isPlaying && (
              <button
                onClick={(e) => { e.stopPropagation(); setPlayingId(slide.id); }}
                className="absolute inset-0 z-20 flex items-center justify-center"
                title="O'ynatish"
              >
                <span className="w-16 h-16 rounded-full bg-black/55 backdrop-blur flex items-center justify-center border border-white/30 active:scale-90 transition-transform">
                  <i className="fas fa-play text-white text-xl ml-1"></i>
                </span>
              </button>
            )}

            {/* Yopish tugmasi — o'ynayotganda; bosilsa yana surish ishlaydi */}
            {(isYouTube || isVideoFile) && isPlaying && (
              <button
                onClick={(e) => { e.stopPropagation(); setPlayingId(null); }}
                className="absolute top-3 left-3 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur text-white border border-white/25 flex items-center justify-center active:scale-90 transition-transform"
                title="Yopish"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            )}

            {/* Tashqi havola tugmasi — bosilganda belgilangan manzilga o'tadi */}
            {slide.link && !isPlaying && (
              <button
                onClick={(e) => { e.stopPropagation(); openExternal(slide.link!); }}
                className="absolute bottom-5 left-5 z-30 px-4 py-2 rounded-full bg-[#d4af37] text-black text-[12px] font-black shadow-lg active:scale-95 transition-transform flex items-center gap-1.5"
              >
                <i className="fas fa-arrow-up-right-from-square text-[10px]"></i> Batafsil
              </button>
            )}
          </div>
        );
      })}

      {/* Admin boshqaruvi — faqat admin ko'radi */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-40 flex gap-2">
          <label
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            title="Reklama qo'shish (rasm/video fayl)"
          >
            {uploading ? <i className="fas fa-circle-notch fa-spin text-sm"></i> : <i className="fas fa-plus text-sm"></i>}
            <input type="file" hidden accept="image/*,video/*" onChange={handleAdd} />
          </label>
          <button
            onClick={(e) => { e.stopPropagation(); setUrlMode((v) => !v); }}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center active:scale-90 transition-transform"
            title="Havola (URL) orqali qo'shish"
          >
            <i className="fas fa-link text-sm"></i>
          </button>
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

      {/* Havola (URL) orqali qo'shish paneli */}
      {isAdmin && urlMode && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-16 right-3 left-3 z-40 bg-black/85 backdrop-blur-md rounded-2xl p-3 border border-[#d4af37]/30 flex flex-col gap-2"
        >
          <p className="text-[10px] text-gray-300 leading-relaxed">
            <b className="text-[#d4af37]">Media havolasi:</b> rasm, video (<span className="text-[#d4af37]">.mp4</span>) yoki <span className="text-[#d4af37]">YouTube</span> havolasi.
          </p>
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://...  (rasm / .mp4 / youtube)"
            className="text-[12px] px-3 py-2 rounded-xl bg-white/10 text-white border border-white/15 placeholder-gray-500"
          />
          <p className="text-[10px] text-gray-300 leading-relaxed">
            <b className="text-[#d4af37]">Bosilganda ochiladigan havola</b> (ixtiyoriy): masalan do'kon joylashuvi yoki Telegram. Bu fayl yuklashga (+) ham qo'llaniladi.
          </p>
          <input
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="https://maps.google.com/...  yoki  https://t.me/..."
            className="text-[12px] px-3 py-2 rounded-xl bg-white/10 text-white border border-white/15 placeholder-gray-500"
          />
          <button
            onClick={handleAddUrl}
            disabled={uploading}
            className="py-2 rounded-xl bg-[#d4af37] text-black text-[12px] font-black active:scale-95 transition-transform disabled:opacity-60"
          >
            {uploading ? <i className="fas fa-circle-notch fa-spin"></i> : "Havola orqali qo'shish"}
          </button>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-3 py-1.5 rounded-full glass-effect">
        {slides.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-[#d4af37]' : 'w-1 bg-white/30'}`}></div>
        ))}
      </div>
    </div>
  );
};
