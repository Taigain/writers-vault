export function portraitSrc(c: { portraitBase64: string | null; gender?: string }): string {
  return (
    c.portraitBase64 ??
    (c.gender === 'female'
      ? '/portraits/female.png'
      : c.gender === 'male'
        ? '/portraits/male.png'
        : '/portraits/neutral.png')
  )
}