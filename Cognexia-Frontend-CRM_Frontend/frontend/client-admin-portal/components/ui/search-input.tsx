import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  onClear?: () => void;
  debounce?: number;
  showClearButton?: boolean;
}

export function SearchInput({
  onSearch,
  onClear,
  debounce = 300,
  showClearButton = true,
  className,
  ...props
}: SearchInputProps) {
  const [value, setValue] = React.useState(props.value?.toString() || '');
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, debounce) as any;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounce, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn('pl-9 pr-9', className)}
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
