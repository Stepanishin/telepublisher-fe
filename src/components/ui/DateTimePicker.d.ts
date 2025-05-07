import { FC } from 'react';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

declare const DateTimePicker: FC<DateTimePickerProps>;

export default DateTimePicker; 