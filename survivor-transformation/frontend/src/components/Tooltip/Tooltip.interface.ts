import type { HTMLAttributes } from 'react';

export interface TooltipProviderProps {
  children: React.ReactNode;
  /** Delay in ms before showing tooltip (optional) */
  delayDuration?: number;
}

export interface TooltipProps {
  children: React.ReactNode;
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLDivElement> {}
export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}
