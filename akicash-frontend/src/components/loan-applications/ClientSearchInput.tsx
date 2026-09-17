import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSearchInput({ value, onChange }: ClientSearchInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="client-search" className="text-[11px] tracking-wide text-ak-subtle">
        BUSCAR CLIENTE
      </Label>
      <Input
        id="client-search"
        type="text"
        placeholder="Nombre del cliente..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full text-[13px] sm:w-[200px]"
      />
    </div>
  );
}
