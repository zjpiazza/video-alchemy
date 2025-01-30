import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { effects, Effect } from './effects'

interface EffectSelectorProps {
  value: Effect;
  onChange: (value: Effect) => void;
}

export default function EffectSelector({ value, onChange }: EffectSelectorProps) {
    return (
        <Select 
          value={value} 
          onValueChange={(value: string) => onChange(value as Effect)}
        >
            <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Select effect" />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(effects).map(([key, effect]) => (
                    <SelectItem 
                        key={key} 
                        value={key as Effect}
                        className="text-foreground"
                    >
                        {effect.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
