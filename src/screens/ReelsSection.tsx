"use client";

import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { SECTION, SectionTitle } from "../components/SectionTitle";
import { useMediaList } from "../hooks/useMedia";
import { QA } from "../api/queryArgs";
import { Skeleton } from "../components/Skeleton";
import { embedUrl } from "../utils/embed";
import type { MediaItem } from "../utils/types";

const posterFor = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", "/video/upload/so_0,w_480,q_auto/").replace(/\.[a-z0-9]+$/i, ".jpg")
    : undefined;

const CARD = "relative aspect-[9/16] w-[240px] sm:w-[280px] h-[426px] sm:h-[497px] shrink-0 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black/10";

// Instagram / Facebook / TikTok link: the platform's own player, loaded only when it scrolls into view.
const EmbedReel = ({ src }: { src: string }) => (
  <div className={CARD}>
    <iframe src={src} title="Video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full border-0 bg-white" />
  </div>
);

const ReelCard = ({ item }: { item: MediaItem }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };

    const stopVideo = () => {
      video.pause();
      setIsPlaying(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? playVideo() : stopVideo()),
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    const handleVis = () => document.hidden && stopVideo();
    document.addEventListener("visibilitychange", handleVis);
    window.addEventListener("blur", stopVideo);
    window.addEventListener("pagehide", stopVideo);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVis);
      window.removeEventListener("blur", stopVideo);
      window.removeEventListener("pagehide", stopVideo);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className="group relative aspect-[9/16] w-[240px] sm:w-[280px] h-[426px] sm:h-[497px] shrink-0 rounded-2xl overflow-hidden cursor-pointer border border-[var(--color-border)] hover:scale-[1.02] transition-transform bg-black/10"
    >
      <video
        ref={videoRef}
        src={item.mediaUrl}
        loop
        muted={isMuted}
        playsInline
        preload="none"
        poster={posterFor(item.mediaUrl)}
        width="280"
        height="497"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover block"
      />
      <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
        <div className="p-3.5 rounded-full bg-white/20 backdrop-blur-md text-white">
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </div>
      </div>
      <button
        type="button"
        aria-label={isMuted ? "Unmute reel" : "Mute reel"}
        onClick={toggleMute}
        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition z-10"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default function ReelsSection() {
  const { mediaList, isLoadingMedia } = useMediaList(QA.reels);
  const reels = mediaList?.filter((i: MediaItem) => i.mediaType === "video" || i.mediaUrl?.match(/\.(mp4|webm|mov)$/i)).slice(0, 3) || [];

  if (!isLoadingMedia && reels.length === 0) return null; 

  return (
    <section aria-label="Videos" className={SECTION}>
      <SectionTitle title="See it in motion" subtitle="Our latest collection, on video" />
      <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide sm:justify-center sm:gap-6">
        {isLoadingMedia
          ? [1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" className="aspect-[9/16] w-[240px] sm:w-[280px] h-[426px] sm:h-[497px] shrink-0 !rounded-2xl" />)
          : reels.map((reel: MediaItem) => {
              const embed = embedUrl(reel.mediaUrl);
              return embed ? <EmbedReel key={reel._id} src={embed} /> : <ReelCard key={reel._id} item={reel} />;
            })}
      </div>
    </section>
  );
}
