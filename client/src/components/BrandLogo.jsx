const BrandLogo = ({
  className = '',
  textClassName = '',
  iconClassName = '',
  showText = true,
  theme = 'light',
}) => {
  const isDark = theme === 'dark'

  const baseClasses = 'inline-flex items-center gap-2'
  const iconClasses = `inline-flex h-8 w-8 items-center justify-center rounded-md font-heading text-xs font-bold tracking-wider ${
    isDark ? 'bg-accent text-accent-foreground' : 'bg-foreground text-primary-foreground'
  } ${iconClassName}`
  const textClasses = `font-heading font-bold tracking-tight ${
    isDark ? 'text-primary-foreground' : 'text-foreground'
  } ${textClassName}`

  return (
    <span className={`${baseClasses} ${className}`}>
      <span className={iconClasses} aria-hidden="true">
        EB
      </span>
      {showText && (
        <span className={textClasses}>
          EpixBox
        </span>
      )}
    </span>
  )
}

export default BrandLogo
