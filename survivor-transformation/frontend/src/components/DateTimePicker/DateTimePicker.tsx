import { Input } from '~/components/Input/Input';

export interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Simple datetime input using native datetime-local. Value/onChange use ISO-like string (YYYY-MM-DDTHH:mm). */
export function DateTimePicker({
  value,
  onChange,
  id,
  placeholder = 'Select date and time',
  className,
  disabled,
}: DateTimePickerProps) {
  return (
    <Input
      type="datetime-local"
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}
