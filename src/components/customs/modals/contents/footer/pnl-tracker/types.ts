import { ResizableProps } from "re-resizable";
import { ReactNode } from "react";

export type ResizeHandler = NonNullable<ResizableProps["onResizeStop"]>;
export type Size = { width: number; height: number };
export type Display = "USD" | "SOL" | "Both";

export type CommonCardThemeProps = {
  size: Size;
  position: { x: number; y: number };
  isDragging: boolean;
  handleDragStart: (e: React.MouseEvent) => void;
  handleResizeStart: () => void;
  handleResize: ResizeHandler;
  onClose: () => void;
};

export interface PnLTrackerCardProps extends CommonCardThemeProps {
  minSize: Size;
  maxWidth?: number;
  maxHeight?: number;
  children: ReactNode;
}
