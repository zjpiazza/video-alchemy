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
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select effect" />
            </SelectTrigger>
            <SelectContent className="bg-white">
                {Object.entries(effects).map(([key, effect]) => (
                    <SelectItem key={key} value={key as Effect}>
                        {effect.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
