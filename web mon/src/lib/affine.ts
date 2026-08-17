export function getAffineTransform(
  src: { x: number; y: number }[],
  dst: { x: number; y: number }[]
): number[] | null {
  if (src.length < 3 || dst.length < 3) return null;

  const x1 = src[0].x, y1 = src[0].y;
  const x2 = src[1].x, y2 = src[1].y;
  const x3 = src[2].x, y3 = src[2].y;

  const u1 = dst[0].x, v1 = dst[0].y;
  const u2 = dst[1].x, v2 = dst[1].y;
  const u3 = dst[2].x, v3 = dst[2].y;

  // X matrix:
  // [ x1 x2 x3 ]
  // [ y1 y2 y3 ]
  // [ 1  1  1  ]
  
  // Determinant of X
  const detX = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2);
  if (Math.abs(detX) < 1e-10) return null;

  // Inverse of X
  const invX = [
    [(y2 - y3) / detX, -(x2 - x3) / detX, (x2 * y3 - x3 * y2) / detX],
    [-(y1 - y3) / detX, (x1 - x3) / detX, -(x1 * y3 - x3 * y1) / detX],
    [(y1 - y2) / detX, -(x1 - x2) / detX, (x1 * y2 - x2 * y1) / detX]
  ];

  // Y matrix
  // [ u1 u2 u3 ]
  // [ v1 v2 v3 ]
  
  // T = Y * invX
  const a = u1 * invX[0][0] + u2 * invX[1][0] + u3 * invX[2][0];
  const c = u1 * invX[0][1] + u2 * invX[1][1] + u3 * invX[2][1];
  const tx = u1 * invX[0][2] + u2 * invX[1][2] + u3 * invX[2][2];

  const b = v1 * invX[0][0] + v2 * invX[1][0] + v3 * invX[2][0];
  const d = v1 * invX[0][1] + v2 * invX[1][1] + v3 * invX[2][1];
  const ty = v1 * invX[0][2] + v2 * invX[1][2] + v3 * invX[2][2];

  // transform: matrix(a, b, c, d, tx, ty)
  return [a, b, c, d, tx, ty];
}
