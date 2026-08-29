/**
 * Vellora plate palettes.
 * Every palette is a filmic, warm-neutral grade so the whole site reads as one
 * body of photography rather than a pile of stock images.
 */
export const PALETTES = {
  dusk: {
    skyTop: "#2C2A33", skyMid: "#7A6558", skyLow: "#D6A87B",
    haze: "#8E7B6B", land: "#1A181A", landMid: "#262227",
    water: "#4A4A50", glass: "#141419", lit: "#E9C489",
    accent: "#C8A46A", ground: "#1E1B1D",
  },
  dawn: {
    skyTop: "#B9C2C4", skyMid: "#DCCFBF", skyLow: "#F0DFCB",
    haze: "#C2B7AA", land: "#4A4740", landMid: "#6A6459",
    water: "#9FAEAE", glass: "#3B3B3E", lit: "#F4E4C8",
    accent: "#B08E55", ground: "#8E8677",
  },
  noon: {
    skyTop: "#C7CDCB", skyMid: "#E3DED2", skyLow: "#F2EDE2",
    haze: "#CFC7B9", land: "#5C574D", landMid: "#7C766A",
    water: "#93A6A3", glass: "#4A4B4C", lit: "#FBF5E8",
    accent: "#B08E55", ground: "#A79E8E",
  },
  ember: {
    skyTop: "#3A2B26", skyMid: "#8E5C43", skyLow: "#D99A67",
    haze: "#A47C63", land: "#221C1B", landMid: "#332924",
    water: "#5B4A44", glass: "#171314", lit: "#F0C489",
    accent: "#D2A972", ground: "#241D1B",
  },
  olive: {
    skyTop: "#AFB3A2", skyMid: "#D3D1BE", skyLow: "#E9E4D2",
    haze: "#B7B7A4", land: "#4E5245", landMid: "#6C7060",
    water: "#8E9A8C", glass: "#3E4239", lit: "#F5EFDD",
    accent: "#9C8A55", ground: "#95977F",
  },
  ash: {
    skyTop: "#8F9296", skyMid: "#BEBDB8", skyLow: "#DAD6CD",
    haze: "#AFADA6", land: "#3E3E40", landMid: "#5C5B5B",
    water: "#7D8489", glass: "#333335", lit: "#EDE7DA",
    accent: "#A08C6A", ground: "#87857F",
  },
  night: {
    skyTop: "#0E0F14", skyMid: "#1A1C24", skyLow: "#2E2B2E",
    haze: "#3A3840", land: "#0A0A0D", landMid: "#141419",
    water: "#1D2028", glass: "#0C0C10", lit: "#E7C185",
    accent: "#C8A46A", ground: "#0D0D11",
  },
  linen: {
    skyTop: "#DAD3C6", skyMid: "#EAE4D8", skyLow: "#F6F2E9",
    haze: "#D2CABB", land: "#6E6759", landMid: "#8B8271",
    water: "#A9B3AC", glass: "#54514A", lit: "#FDFAF3",
    accent: "#B08E55", ground: "#B3AA99",
  },
};

export const INTERIOR_PALETTES = {
  warm: {
    wall: "#E4DCCD", wallShade: "#CFC5B3", floor: "#B99B77", floorDark: "#9C7E5C",
    object: "#8E8377", objectDark: "#6B6156", accent: "#B08E55",
    light: "#FBF3E4", deep: "#3A342C", textile: "#CFC2AC",
  },
  stone: {
    wall: "#DEDBD3", wallShade: "#C6C2B8", floor: "#A8A499", floorDark: "#8C887E",
    object: "#7C7970", objectDark: "#5A5852", accent: "#A08C6A",
    light: "#F7F5EF", deep: "#33322E", textile: "#C3BFB4",
  },
  ink: {
    wall: "#2A2A2E", wallShade: "#1E1E22", floor: "#4A4038", floorDark: "#332C26",
    object: "#5C5A57", objectDark: "#3C3A37", accent: "#C8A46A",
    light: "#EAD9BC", deep: "#0E0E11", textile: "#54514C",
  },
  clay: {
    wall: "#E6D9C9", wallShade: "#D0C0AC", floor: "#B08466", floorDark: "#8E6850",
    object: "#957F6C", objectDark: "#6E5B4C", accent: "#B08E55",
    light: "#FCF4E7", deep: "#3E3129", textile: "#D8C4AC",
  },
};

export const PALETTE_KEYS = Object.keys(PALETTES);
export const INTERIOR_KEYS = Object.keys(INTERIOR_PALETTES);
