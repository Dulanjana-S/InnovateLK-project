/**
 * Wrapper for lucide-react icons to filter out Figma-specific props.
 * This file re-exports lucide icons with prop filtering applied.
 */
import * as React from "react";
import * as LucideIcons from "lucide-react";

// Helper to filter Figma props
function filterProps<T extends Record<string, any>>(props: T) {
  const { _fgT, _fgS, _fgB, ...rest } = props as any;
  return rest;
}

// Create a wrapper for any lucide icon
function createCleanIcon(Icon: React.ComponentType<any>) {
  return React.forwardRef<SVGSVGElement, any>((props, ref) => {
    return <Icon ref={ref} {...filterProps(props)} />;
  });
}

// Export commonly used icons with filtering
export const CheckIcon = createCleanIcon(LucideIcons.Check);
export const ChevronDownIcon = createCleanIcon(LucideIcons.ChevronDown);
export const ChevronUpIcon = createCleanIcon(LucideIcons.ChevronUp);
export const ChevronRightIcon = createCleanIcon(LucideIcons.ChevronRight);
export const ChevronLeftIcon = createCleanIcon(LucideIcons.ChevronLeft);
export const CircleIcon = createCleanIcon(LucideIcons.Circle);
export const XIcon = createCleanIcon(LucideIcons.X);
export const SearchIcon = createCleanIcon(LucideIcons.Search);
export const MinusIcon = createCleanIcon(LucideIcons.Minus);
export const MoreHorizontalIcon = createCleanIcon(LucideIcons.MoreHorizontal);
export const PanelLeftIcon = createCleanIcon(LucideIcons.PanelLeft);
export const ArrowLeft = createCleanIcon(LucideIcons.ArrowLeft);
export const ArrowRight = createCleanIcon(LucideIcons.ArrowRight);
export const GripVerticalIcon = createCleanIcon(LucideIcons.GripVertical);

// Re-export everything else from lucide-react for convenience
export * from "lucide-react";
