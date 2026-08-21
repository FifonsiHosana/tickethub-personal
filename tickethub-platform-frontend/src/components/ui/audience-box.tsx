export const AudienceBox = () => {
  return (
    <div className='w-full border-1 border-border bg-background px-5 h-10 focus-within:border-primary normal-rounded flex items-center'>
        <input 
        type="text" 
        className='flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70'
        placeholder='Send to...'
        />
    </div>
  )
}
