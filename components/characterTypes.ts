export type CharRow = {
  id: string
  bookId: string
  name: string
  role: string
  bio: string
  appearance: string
  personality: string
  decisions: string
  arc: string
  aliases: string
  portraitBase64: string | null
  age: string
  gender: string
  birth: string
  race: string
  country: string
  language: string
  archetype: string
  goal: string
  conflict: string
  trauma: string
  obsession: string
  strengths: string
  weaknesses: string
  height: string
  weight: string
  build: string
  eyes: string
  hair: string
  clothing: string
  posture: string
  voice: string
  boardX: number | null
  boardY: number | null
  soul: { id: string; name: string; books: string[] } | null
  seriesCharId: string | null
}

export type CharRelation = {
  id: string
  characterId: string
  relatedId: string
  note: string
}