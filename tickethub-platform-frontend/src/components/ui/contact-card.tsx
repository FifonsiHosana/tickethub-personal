import { Checkbox } from "@/components/ui/checkbox";

interface ContactCardProps{
    avatar: string;
    phoneNumber: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export const ContactCard = ({avatar, phoneNumber, checked, onCheckedChange}: ContactCardProps) => {
  return (
    <label className='flex items-center gap-3 cursor-pointer'>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="peer"
        />
        <div className='flex flex-1 items-center gap-3 p-2 border border-border card-rounded transition-colors peer-data-checked:border-primary'>
            <div className="ml-1 flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {avatar}
            </div>
            <span className='text-foreground/80'>{phoneNumber}</span>
        </div>
    </label>
  )
}
