import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Sparkles, ArrowLeft } from 'lucide-react';
import Watermark from '../components/Watermark';
import Announcement from '../components/Announcement';
import FloatingControls from '../components/FloatingControls';
import Assistant from '../components/Assistant';
import { toEmbedUrl, isDirectVideoFile } from '../lib/utils';

export default function Welcome() {
  const { settings, enterJourney, currentUser } = useStore();
  const navigate = useNavigate();

  const start = async () => {
    // Force fullscreen on any device/platform
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen();
    } catch {
      /* fullscreen may be blocked, continue anyway */
    }
    enterJourney();
    navigate(currentUser ? '/home' : '/auth');
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden gradient-hero">
      <Watermark />
      <Announcement />
      <FloatingControls />
      <Assistant />

      <div className="arabesque pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-right"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full surface-card px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles size={16} />
              {settings.platformName}
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {settings.welcomeTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-lg leading-relaxed text-muted lg:mx-0">
              {settings.welcomeDescription}
            </p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={start}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl btn-primary glow px-9 py-4 text-lg font-bold shadow-xl"
            >
              {settings.welcomeButtonText}
              <ArrowLeft size={22} />
            </motion.button>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl surface-card p-2 shadow-2xl">
              {settings.welcomeVideoUrl ? (
                isDirectVideoFile(settings.welcomeVideoUrl) ? (
                  <video
                    src={settings.welcomeVideoUrl}
                    controls
                    playsInline
                    className="aspect-video w-full rounded-2xl bg-black"
                  />
                ) : (
                  <iframe
                    src={toEmbedUrl(settings.welcomeVideoUrl)}
                    className="aspect-video w-full rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="فيديو الترحيب"
                  />
                )
              ) : (
                <div className="grid aspect-video w-full place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_15%,transparent)]">
                  <Play size={64} className="text-primary" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
