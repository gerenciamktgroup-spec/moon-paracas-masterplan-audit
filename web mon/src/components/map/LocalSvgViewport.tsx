import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type PropsWithChildren, type WheelEvent } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { MapDetailLevel } from "./mapVisuals";

type ViewTransform = {
  x: number;
  y: number;
  scale: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

interface LocalSvgViewportProps extends PropsWithChildren {
  onDetailLevelChange: (level: MapDetailLevel) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function detailLevelForScale(scale: number): MapDetailLevel {
  if (scale >= 2.35) return "close";
  if (scale >= 1.45) return "detail";
  return "overview";
}

export function LocalSvgViewport({ children, onDetailLevelChange }: LocalSvgViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const pinchRef = useRef<{ center: PointerPosition; distance: number } | null>(null);
  const movedRef = useRef(false);
  const [view, setView] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    onDetailLevelChange(detailLevelForScale(view.scale));
  }, [onDetailLevelChange, view.scale]);

  const zoomAt = useCallback((nextScale: number, origin?: PointerPosition) => {
    setView((current) => {
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const bounds = containerRef.current?.getBoundingClientRect();
      const anchor = origin ?? {
        x: (bounds?.width ?? 0) / 2,
        y: (bounds?.height ?? 0) / 2,
      };
      const ratio = scale / current.scale;
      return {
        scale,
        x: anchor.x - (anchor.x - current.x) * ratio,
        y: anchor.y - (anchor.y - current.y) * ratio,
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setView({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const origin = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const factor = event.deltaY < 0 ? 1.16 : 1 / 1.16;
    zoomAt(view.scale * factor, origin);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    movedRef.current = false;
    setIsDragging(true);

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchRef.current = {
        center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
        distance: Math.hypot(first.x - second.x, first.y - second.y),
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointersRef.current.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, current);

    if (pointersRef.current.size === 1) {
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      if (Math.hypot(dx, dy) > 1) movedRef.current = true;
      setView((state) => ({ ...state, x: state.x + dx, y: state.y + dy }));
      return;
    }

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      const previousGesture = pinchRef.current;
      if (previousGesture && previousGesture.distance > 0) {
        movedRef.current = true;
        setView((state) => {
          const nextScale = clamp(state.scale * (distance / previousGesture.distance), MIN_SCALE, MAX_SCALE);
          const ratio = nextScale / state.scale;
          return {
            scale: nextScale,
            x: center.x - (previousGesture.center.x - state.x) * ratio,
            y: center.y - (previousGesture.center.y - state.y) * ratio,
          };
        });
      }
      pinchRef.current = { center, distance };
    }
  };

  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      setIsDragging(false);
      window.setTimeout(() => {
        movedRef.current = false;
      }, 0);
    }
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const panStep = 28;
    if (event.key === "+" || event.key === "=") zoomAt(view.scale * 1.2);
    else if (event.key === "-") zoomAt(view.scale / 1.2);
    else if (event.key === "0") resetView();
    else if (event.key === "ArrowLeft") setView((state) => ({ ...state, x: state.x + panStep }));
    else if (event.key === "ArrowRight") setView((state) => ({ ...state, x: state.x - panStep }));
    else if (event.key === "ArrowUp") setView((state) => ({ ...state, y: state.y + panStep }));
    else if (event.key === "ArrowDown") setView((state) => ({ ...state, y: state.y - panStep }));
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      data-testid="local-svg-viewport"
      className={`absolute inset-0 overflow-hidden bg-[#e6e0d3] outline-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      role="application"
      aria-label="Masterplan interactivo local. Usa la rueda, los botones o los gestos táctiles para ampliar y desplazar."
      tabIndex={0}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onDoubleClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        zoomAt(view.scale * 1.35, { x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      }}
      onClickCapture={(event) => {
        if (!movedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyDown={handleKeyboard}
    >
      <div
        className="absolute inset-0 origin-top-left transform-gpu will-change-transform"
        style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
      >
        {children}
      </div>

      <div className="absolute bottom-3 right-3 z-30 flex flex-col overflow-hidden rounded-md border border-[#18353b]/15 bg-[#f7f5ef]/95 shadow-lg backdrop-blur-md sm:bottom-4 sm:right-4">
        <button type="button" onClick={() => zoomAt(view.scale * 1.2)} className="inline-flex h-10 w-10 items-center justify-center text-[#344c4a] hover:bg-white" aria-label="Acercar plano">
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => zoomAt(view.scale / 1.2)} className="inline-flex h-10 w-10 items-center justify-center border-y border-[#18353b]/10 text-[#344c4a] hover:bg-white" aria-label="Alejar plano">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={resetView} className="inline-flex h-10 w-10 items-center justify-center text-[#344c4a] hover:bg-white" aria-label="Reajustar plano">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
