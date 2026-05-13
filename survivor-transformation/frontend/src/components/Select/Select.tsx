import React, { createContext, useContext, useState, useEffect, useId, useRef, forwardRef } from 'react';
import styles from './Select.module.less';
import type { SelectProps } from './Select.interface';

type SelectContextValue = {
  value: string;
  onValueChange: (v: string) => void;
  setOptions: (opts: { value: string; label: React.ReactNode }[]) => void;
  options: { value: string; label: React.ReactNode }[];
  id: string;
  placeholder?: string;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select components must be used within Select');
  return ctx;
}

export function Select({
  value = '',
  onValueChange,
  children,
}: Omit<SelectProps, 'placeholder'> & { value?: string; onValueChange?: (v: string) => void }) {
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const id = useId();
  const value2 = value ?? '';
  return (
    <SelectContext.Provider
      value={{
        value: value2,
        onValueChange: onValueChange ?? (() => {}),
        setOptions,
        options,
        id,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

function getPlaceholderFromChildren(children: React.ReactNode): string | undefined {
  let placeholder: string | undefined;
  React.Children.forEach(children, (c) => {
    if (React.isValidElement(c) && (c.type as { displayName?: string })?.displayName === 'SelectValue') {
      placeholder = (c.props as { placeholder?: string }).placeholder;
    }
  });
  return placeholder;
}

export const SelectTrigger = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }
>(function SelectTrigger({ className, id: idProp, children, ...props }, ref) {
  const { value, onValueChange, options, id } = useSelectContext();
  const placeholder = getPlaceholderFromChildren(children);
  const resolvedId = idProp ?? id;
  return (
    <select
      ref={ref}
      id={resolvedId}
      className={`${styles.select} ${className ?? ''}`.trim()}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {typeof opt.label === 'string' ? opt.label : String(opt.label)}
        </option>
      ))}
    </select>
  );
});

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return null;
}
SelectValue.displayName = 'SelectValue';

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { setOptions } = useSelectContext();
  const prevValuesRef = useRef<string>('');
  useEffect(() => {
    const items: { value: string; label: React.ReactNode }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && (child.type as { displayName?: string })?.displayName === 'SelectItem') {
        const p = child.props as { value: string; children?: React.ReactNode };
        items.push({ value: p.value, label: p.children ?? p.value });
      }
    });
    const key = items.map((i) => i.value).join(',');
    if (key !== prevValuesRef.current) {
      prevValuesRef.current = key;
      setOptions(items);
    }
  }, [children, setOptions]);
  return null;
}

export function SelectItem({ value, children }: { value: string; children?: React.ReactNode }) {
  return null;
}
SelectItem.displayName = 'SelectItem';

// Legacy export: native select for direct use
export const SelectNative = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, placeholder, children, ...props }, ref) => (
    <select
      ref={ref}
      className={`${styles.select} ${className ?? ''}`.trim()}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  )
);
SelectNative.displayName = 'SelectNative';
