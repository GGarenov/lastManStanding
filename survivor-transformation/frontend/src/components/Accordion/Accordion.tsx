import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.less';
import type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps } from './Accordion.interface';

type AccordionContextValue = {
  type: 'single' | 'multiple';
  collapsible: boolean;
  value: string | string[];
  setValue: (v: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string>('');

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion components must be used within Accordion');
  return ctx;
}

export function Accordion({
  type = 'single',
  collapsible = false,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: AccordionProps) {
  const [internalValue, setInternal] = useState<string | string[]>(type === 'single' ? '' : []);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback(
    (v: string) => {
      if (type === 'single') {
        const next = collapsible && (value as string) === v ? '' : v;
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
      } else {
        const arr = (value as string[]) || [];
        const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
      }
    },
    [type, collapsible, value, isControlled, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ type, collapsible, value, setValue }}>
      <div className={`${styles.root} ${className ?? ''}`.trim()}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={value}>
      <div ref={ref} className={`${styles.item} ${className ?? ''}`.trim()} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const itemValue = useContext(AccordionItemContext);
    const { value, setValue, type } = useAccordion();
    const open = type === 'single' ? value === itemValue : (value as string[])?.includes(itemValue);

    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ''} ${className ?? ''}`.trim()}
        onClick={() => setValue(itemValue)}
        aria-expanded={open}
        {...props}
      >
        {children}
        <ChevronDown className={styles.chevron} />
      </button>
    );
  }
);
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const itemValue = useContext(AccordionItemContext);
    const { value, type } = useAccordion();
    const open = type === 'single' ? value === itemValue : (value as string[])?.includes(itemValue);

    if (!open) return null;
    return (
      <div ref={ref} className={styles.content} {...props}>
        <div className={`${styles.contentInner} ${className ?? ''}`.trim()}>{children}</div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';
