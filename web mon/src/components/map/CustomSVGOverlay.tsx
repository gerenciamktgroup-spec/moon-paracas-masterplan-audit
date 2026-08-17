import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "@vis.gl/react-google-maps";
import { getAffineTransform } from "../../lib/affine";
import { terrainLatLng } from "../../lib/geo";
import { XY } from "../../types/map";

interface CustomSVGOverlayProps {
  terrainSvgPoints: XY[];
  children: React.ReactNode;
}

export const CustomSVGOverlay: React.FC<CustomSVGOverlayProps> = ({ terrainSvgPoints, children }) => {
  const map = useMap();
  const [overlayDiv, setOverlayDiv] = useState<HTMLDivElement | null>(null);

  const overlay = useMemo(() => {
    if (typeof google === "undefined" || !map) return null;

    class SVGOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      private svgPoints: XY[];

      constructor(svgPoints: XY[]) {
        super();
        this.svgPoints = svgPoints;
      }

      onAdd() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.top = "0";
        this.div.style.left = "0";
        const scaleFactor = 4.0;
        this.div.style.width = `${730 * scaleFactor}px`;
        this.div.style.height = `${820 * scaleFactor}px`;
        // The transform origin must be 0 0 for our matrix to work perfectly
        this.div.style.transformOrigin = "0 0";
        this.div.style.pointerEvents = "auto"; // allow clicking on lots
        
        const panes = this.getPanes()!;
        panes.overlayMouseTarget.appendChild(this.div);
        setOverlayDiv(this.div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;

        // Convert the LatLng of the 4 terrain vertices to div pixels
        const dst = terrainLatLng.map(ll => {
          const pt = projection.fromLatLngToDivPixel(new google.maps.LatLng(ll.lat, ll.lng));
          return { x: pt?.x || 0, y: pt?.y || 0 };
        });

        const src = this.svgPoints;

        // Calculate affine transform mapping SVG coordinates to Map pixel coordinates
        const matrix = getAffineTransform(src, dst);

        if (matrix) {
          const [a, b, c, d, tx, ty] = matrix;
          const scaleFactor = 4.0;
          this.div.style.transform = `matrix(${a / scaleFactor}, ${b / scaleFactor}, ${c / scaleFactor}, ${d / scaleFactor}, ${tx}, ${ty})`;
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
        this.div = null;
        setOverlayDiv(null);
      }
    }

    return new SVGOverlay(terrainSvgPoints);
  }, [map, terrainSvgPoints]);

  useEffect(() => {
    if (overlay && map) {
      overlay.setMap(map);
      return () => overlay.setMap(null);
    }
  }, [overlay, map]);

  if (!overlayDiv) return null;
  return createPortal(children, overlayDiv);
};
