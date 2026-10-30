"use client";

import { useState } from "react";
import Image from "next/image";

export default function WhatsAppButton() {
  const SIZE = 56, [pos, setPos] = useState<{ x: number; y: number } | null>(null), [dragged, setDragged] = useState(false);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const sX = "touches" in e ? e.touches[0].clientX : e.clientX, sY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(), iX = pos ? pos.x : rect.left, iY = pos ? pos.y : rect.top;
    const move = (ev: MouseEvent | TouchEvent) => {
      setDragged(true);
      const cX = "touches" in ev ? ev.touches[0].clientX : ev.clientX, cY = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
      setPos({ x: Math.max(10, Math.min(window.innerWidth - SIZE - 10, iX + (cX - sX))), y: Math.max(10, Math.min(window.innerHeight - SIZE - 10, iY + (cY - sY))) });
    };
    const stop = () => {
      document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", move); document.removeEventListener("touchend", stop);
      setTimeout(() => setDragged(false), 50);
    };
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", move); document.addEventListener("touchend", stop);
  };

  return (
    <div style={pos ? { position: "fixed", left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 99999, touchAction: "none" } : { position: "fixed", bottom: "20px", right: "20px", zIndex: 99999, touchAction: "none" }} onMouseDown={startDrag} onTouchStart={startDrag}>
      <a href="https://wa.me/923433083783?text=Hi%20Bambotia%2C%20I%20have%20an%20inquiry%20regarding%20a%20product%20or%20order." target="_blank" rel="noopener noreferrer" onClick={(e) => dragged && e.preventDefault()}>
        <Image src="/whatsapp.svg" alt="Chat with Bambotia on WhatsApp" width={56} height={56} unoptimized className="w-12 h-12 md:w-14 md:h-14 select-none pointer-events-none" />
      </a>
    </div>
  );
}