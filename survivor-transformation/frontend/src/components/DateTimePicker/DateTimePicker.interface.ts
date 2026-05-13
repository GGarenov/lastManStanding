export interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
