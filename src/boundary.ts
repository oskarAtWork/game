

export type Boundary = {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const centerX = (b: Boundary): number => {
  return (b.left + b.right) / 2;
}

export const centerY = (b: Boundary): number => {
  return (b.top + b.bottom) / 2
}

export const animBoundary = (from: Boundary, to: Boundary): Boundary => {
  return {
    left: from.left * 0.95 + to.left * 0.05,
    right: from.right * 0.95 + to.right * 0.05,
    top: from.top * 0.95 + to.top * 0.05,
    bottom: from.bottom * 0.95 + to.bottom * 0.05,
  }
}