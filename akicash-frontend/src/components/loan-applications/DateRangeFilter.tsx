import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  from: string;
  until: string;
  onFromChange: (value: string) => void;
  onUntilChange: (value: string) => void;
}

export function DateRangeFilter({ from, until, onFromChange, onUntilChange }: DateRangeFilterProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
      <div className="flex flex-col gap-1">
        <Label htmlFor="from-date" className="text-[11px] tracking-wide text-ak-subtle">
          DESDE
        </Label>
        <Input
          id="from-date"
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          className="h-9 w-full text-[13px] sm:w-[150px]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="until-date" className="text-[11px] tracking-wide text-ak-subtle">
          HASTA
        </Label>
        <Input
          id="until-date"
          type="date"
          value={until}
          onChange={(event) => onUntilChange(event.target.value)}
          className="h-9 w-full text-[13px] sm:w-[150px]"
        />
      </div>
    </div>
  );
}
