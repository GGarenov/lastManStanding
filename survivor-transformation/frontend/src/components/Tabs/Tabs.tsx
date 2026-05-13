import React, { createContext, useContext, useState, useCallback, forwardRef } from 'react';
import styles from './Tabs.module.less';
import type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs.interface';

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within Tabs');
  return ctx;
}

export function Tabs({ value: controlledValue, defaultValue = '', onValueChange, children }: TabsProps) {
  const [internalValue, setInternal] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue = useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="tablist" className={`${styles.list} ${className ?? ''}`.trim()} {...props} />
  )
);
TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, onClick, ...props }, ref) => {
    const { value: selected, setValue } = useTabs();
    const active = selected === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        className={`${styles.trigger} ${active ? styles.active : ''} ${className ?? ''}`.trim()}
        onClick={(e) => {
          setValue(value);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selected } = useTabs();
    if (selected !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={`${styles.content} ${className ?? ''}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';
