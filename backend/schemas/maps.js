// @ts-check
import z from "zod"

// taken from https://zod.dev/codecs#stringtonumber
const stringToNumber = z.codec(z.string().regex(z.regexes.number), z.number(), {
  decode: (str) => Number.parseFloat(str),
  encode: (num) => num.toString()
})

export const LngLat = z.object({
  lng: stringToNumber,
  lat: stringToNumber
})
