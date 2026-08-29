import { img } from "@/lib/images";
import type { Neighborhood } from "@/types";

/**
 * Six districts of Marivane — the fictional coastal city Vellora represents.
 * Rename `siteConfig.market.city` and edit these entries to move the whole
 * site to your own market.
 */
export const neighborhoods: Neighborhood[] = [
  {
    id: "n-01",
    slug: "waterfront",
    name: "Waterfront",
    tagline: "Glass, water and long light",
    summary:
      "A reclaimed dock quarter rebuilt as the city's most architecturally ambitious address, where every terrace faces the estuary.",
    overview: [
      "Twenty years ago the Waterfront was a working dock: cranes, container yards and a sea wall nobody walked along. The regeneration that followed was unusually patient. Rather than clearing the site, the city invited six studios to work within the existing grid, keeping the granite quays and the rhythm of the warehouse bays.",
      "The result is a district that feels considered rather than developed. Buildings sit low and wide, glass is deep-set to control the afternoon glare, and the promenade runs uninterrupted for two and a half kilometres. Residents talk about the light more than anything else — it arrives twice, once directly and once off the water.",
    ],
    lifestyle: [
      "Mornings belong to the promenade. By seven the rowing clubs are out and the coffee window at the old customs house has a queue.",
      "The Saturday produce market under the viaduct is the district's living room — thirty stalls, most of them from farms within an hour of the city.",
      "Evenings are quiet by design: the planning code caps late licences, so the restaurants close at midnight and the water stays still.",
    ],
    hero: img("coastal-01", "Terraced waterfront residences stepping down toward the estuary at dusk"),
    portrait: img("tall-05", "A waterfront residence above the estuary"),
    images: [
      img("coastal-03", "The Waterfront promenade at low tide"),
      img("aerial-01", "Aerial view of the Waterfront's low, wide building grid"),
      img("detail-01", "Deep-set glazing and bronze fins on a Waterfront facade"),
    ],
    coordinates: { lat: 38.6961, lng: -9.1739 },
    averagePrice: 2_450_000,
    pricePerArea: 9_800,
    yearOnYear: 6.4,
    walkScore: 92,
    highlights: [
      { name: "Sal & Brasa", category: "Restaurant", note: "Two Michelin stars; the tasting menu is booked eight weeks out." },
      { name: "The Customs House", category: "Culture", note: "Contemporary art in the restored 1890s bonded warehouse." },
      { name: "Marivane International School", category: "School", note: "IB curriculum, ten minutes on foot from the quay." },
      { name: "Estuary Baths", category: "Wellness", note: "Tidal saltwater pool, open year round." },
      { name: "Dock 7 Market", category: "Retail", note: "Saturday produce and flower market beneath the viaduct." },
      { name: "The Long Walk", category: "Outdoors", note: "2.5km of uninterrupted waterside promenade." },
    ],
    transport: [
      { mode: "Metro", name: "Waterfront (Blue line)", time: "3 min walk" },
      { mode: "Tram", name: "Route 12 — Old Town", time: "9 min" },
      { mode: "Ferry", name: "North Bank crossing", time: "6 min" },
      { mode: "Airport", name: "Marivane International", time: "24 min by car" },
    ],
    bestFor: ["Architecture", "Waterside living", "Restaurants", "Families"],
    featured: true,
  },
  {
    id: "n-02",
    slug: "old-town",
    name: "Old Town",
    tagline: "Six centuries, still occupied",
    summary:
      "Cobbled lanes, tiled facades and courtyard houses that have been quietly, expensively restored one at a time.",
    overview: [
      "The Old Town survived the earthquake of 1755 largely because it sits on rock. What stands today is the oldest continuously inhabited quarter in the region: a dense weave of lanes, stairs and courtyards where the streets were laid out for handcarts and never widened.",
      "Restoration here is a craft trade. Facade tiles are matched at a kiln two streets away, ironwork is repaired rather than replaced, and the planning office keeps a register of original window profiles. Buyers are not acquiring square metres so much as custody.",
    ],
    lifestyle: [
      "Nothing is more than eight minutes away on foot, and almost nothing is reachable by car.",
      "The bakeries open at six and the last tables are cleared by eleven — this is a residential quarter that happens to be beautiful, not a nightlife district.",
      "Neighbours are a fact of life here. Courtyards are shared, and so are the jacaranda trees in them.",
    ],
    hero: img("town-01", "Restored tiled facades along an Old Town lane"),
    portrait: img("tall-07", "Restored facades along an Old Town lane"),
    images: [
      img("town-04", "Wrought-iron balconies above a narrow cobbled street"),
      img("detail-03", "Hand-glazed azulejo tilework on a restored facade"),
      img("interior-05", "A restored Old Town reception room with tall shuttered windows"),
    ],
    coordinates: { lat: 38.7115, lng: -9.1301 },
    averagePrice: 1_680_000,
    pricePerArea: 8_200,
    yearOnYear: 4.1,
    walkScore: 98,
    highlights: [
      { name: "Casa Deveza", category: "Restaurant", note: "Twelve covers, one seating, no menu." },
      { name: "Museu da Cidade", category: "Culture", note: "The city archive and its cloistered garden." },
      { name: "Liceu Santa Clara", category: "School", note: "Bilingual primary in a converted convent." },
      { name: "Rua dos Ourives", category: "Retail", note: "Goldsmiths and bookbinders, mostly third generation." },
      { name: "Miradouro do Norte", category: "Outdoors", note: "The viewpoint locals use, not the one on the postcards." },
      { name: "Termas Velhas", category: "Wellness", note: "1920s bathhouse, restored in 2019." },
    ],
    transport: [
      { mode: "Tram", name: "Route 12 & 28", time: "2 min walk" },
      { mode: "Metro", name: "Sé (Green line)", time: "7 min walk" },
      { mode: "Rail", name: "Marivane Central", time: "12 min" },
      { mode: "Airport", name: "Marivane International", time: "31 min by car" },
    ],
    bestFor: ["Period property", "Walkability", "Culture", "Restoration projects"],
    featured: true,
  },
  {
    id: "n-03",
    slug: "central-district",
    name: "Central District",
    tagline: "The city at full volume",
    summary:
      "Boulevards, embassies and the tall, quiet apartments above them — the most conventionally prime address in Marivane.",
    overview: [
      "Laid out in the 1880s on a Haussmann model, the Central District is where the city put its money when it had some. The boulevards are forty metres wide, the plane trees are original, and the apartment buildings behind them were built with ceiling heights that no contemporary code would require.",
      "It remains the address for anyone whose life runs on proximity: to the courts, to the banks, to the theatres. Stock is tightly held. In a typical year fewer than forty apartments above 250 m² change hands here.",
    ],
    lifestyle: [
      "A district of long lunches and short commutes; most residents walk to work.",
      "The Teatro Nacional, the opera and four of the city's five concert halls sit within the same square kilometre.",
      "Ground-floor retail is regulated — no chains on the boulevards, which is why the bookshops survived.",
    ],
    hero: img("town-02", "A wide Central District boulevard lined with plane trees"),
    portrait: img("tall-01", "A nineteenth-century boulevard elevation"),
    images: [
      img("tower-01", "Nineteenth-century apartment buildings against the evening sky"),
      img("interior-11", "A Central District salon with original mouldings"),
      img("detail-05", "Bronze and stone detailing on a boulevard entrance"),
    ],
    coordinates: { lat: 38.7223, lng: -9.1441 },
    averagePrice: 2_150_000,
    pricePerArea: 8_900,
    yearOnYear: 3.2,
    walkScore: 96,
    highlights: [
      { name: "Teatro Nacional", category: "Culture", note: "1846 opera house; the season runs September to June." },
      { name: "Livraria Bertrand", category: "Retail", note: "Six rooms of books, four of them on architecture." },
      { name: "Colégio Avenida", category: "School", note: "Selective secondary with a strong music programme." },
      { name: "Café Império", category: "Restaurant", note: "The city's oldest dining room, unchanged since 1902." },
      { name: "Jardim Botânico", category: "Outdoors", note: "Eleven hectares behind the university." },
      { name: "Clube Atlântico", category: "Wellness", note: "Private members' club with a 25m pool." },
    ],
    transport: [
      { mode: "Metro", name: "Avenida (Blue & Yellow)", time: "1 min walk" },
      { mode: "Rail", name: "Marivane Central", time: "5 min" },
      { mode: "Road", name: "A5 westbound", time: "8 min" },
      { mode: "Airport", name: "Marivane International", time: "19 min by car" },
    ],
    bestFor: ["Lateral apartments", "Culture", "Investment", "Pied-à-terre"],
    featured: true,
  },
  {
    id: "n-04",
    slug: "the-hills",
    name: "The Hills",
    tagline: "Above the weather",
    summary:
      "Ten minutes and two hundred metres above the city: pine, cooler air, and the largest private plots within the municipal boundary.",
    overview: [
      "The Hills were farmland until the 1930s, when the first families built summer houses along the ridge to escape the August heat. Those houses are still there, and so is the reason for them — the ridge sits above the humidity line and catches the northern breeze.",
      "Plots are large by any European standard, typically 2,000 to 8,000 m², and the tree preservation orders that cover the pine woodland mean they will stay that way. Nothing here is dense, and nothing here is quick to buy.",
    ],
    lifestyle: [
      "Life is organised around gardens, pools and the school run — this is the family district.",
      "The ridge road is a cycling route on Sunday mornings and empty the rest of the week.",
      "Two supermarkets, one very good butcher, and a wine merchant who delivers. Everything else is a short drive down.",
    ],
    hero: img("villa-02", "A modernist villa set into the pine woodland of The Hills"),
    portrait: img("tall-10", "A modernist house in the pine woodland"),
    images: [
      img("estate-02", "A ridge-top estate with formal approach"),
      img("land-01", "Open plots along the ridge above the city"),
      img("interior-17", "A garden room opening onto the terrace"),
    ],
    coordinates: { lat: 38.7402, lng: -9.1912 },
    averagePrice: 3_900_000,
    pricePerArea: 6_400,
    yearOnYear: 7.8,
    walkScore: 41,
    highlights: [
      { name: "Serra International", category: "School", note: "The city's largest international school, K–13." },
      { name: "Quinta do Pinhal", category: "Restaurant", note: "Wood-fired cooking in a converted farmhouse." },
      { name: "Parque da Serra", category: "Outdoors", note: "Four hundred hectares of protected pine woodland." },
      { name: "Clube de Ténis", category: "Wellness", note: "Twelve clay courts and a padel academy." },
      { name: "Mercado do Alto", category: "Retail", note: "Small covered market, open Wednesday and Saturday." },
      { name: "Observatório", category: "Culture", note: "1928 observatory, open to the public on clear Fridays." },
    ],
    transport: [
      { mode: "Road", name: "Ridge road to Central", time: "12 min by car" },
      { mode: "Metro", name: "Alto (Green line)", time: "9 min by car" },
      { mode: "Rail", name: "Marivane Central", time: "22 min" },
      { mode: "Airport", name: "Marivane International", time: "28 min by car" },
    ],
    bestFor: ["Families", "Large plots", "Privacy", "New build"],
    featured: true,
  },
  {
    id: "n-05",
    slug: "downtown",
    name: "Downtown",
    tagline: "Where the city works",
    summary:
      "Warehouses turned studios, towers turned residences, and the highest concentration of everything in the region.",
    overview: [
      "Downtown was industrial until it wasn't. The shift happened building by building through the 2000s: printworks became studios, a cold store became a gallery, and the 1970s office towers along the canal were stripped back to their frames and rebuilt as apartments.",
      "It is the youngest district by median age and the most mixed by use. Ground floors are commercial, upper floors are residential, and the two are not politely separated. If you want quiet, this is not the address. If you want to be able to eat at eleven and buy a lamp at midnight, it is the only one.",
    ],
    lifestyle: [
      "Lateral warehouse conversions with 4m ceilings, and tower apartments with the whole city below.",
      "Fourteen galleries within four blocks, most of them free and open late on Thursdays.",
      "The canal path is the fastest route across the city on a bicycle — eleven minutes end to end.",
    ],
    hero: img("tower-02", "Downtown residential towers above the canal at dusk"),
    portrait: img("tall-04", "Downtown towers above the canal at dusk"),
    images: [
      img("tower-05", "Converted industrial frames along the canal"),
      img("interior-03", "A warehouse conversion with exposed structure"),
      img("aerial-04", "The Downtown grid from above"),
    ],
    coordinates: { lat: 38.7078, lng: -9.1543 },
    averagePrice: 1_240_000,
    pricePerArea: 7_100,
    yearOnYear: 9.2,
    walkScore: 97,
    highlights: [
      { name: "Galeria Norte", category: "Culture", note: "The anchor gallery of the canal-side arts quarter." },
      { name: "Fábrica", category: "Restaurant", note: "Open kitchen in a former printworks; no bookings after 9pm." },
      { name: "Escola do Canal", category: "School", note: "Progressive primary with a design curriculum." },
      { name: "The Depot", category: "Retail", note: "Forty independent units in a restored goods yard." },
      { name: "Canal Path", category: "Outdoors", note: "6km of car-free cycling through the city." },
      { name: "Banho Frio", category: "Wellness", note: "Cold plunge and sauna club under the railway arches." },
    ],
    transport: [
      { mode: "Metro", name: "Canal (Red line)", time: "4 min walk" },
      { mode: "Tram", name: "Route 3", time: "2 min walk" },
      { mode: "Rail", name: "Marivane Central", time: "9 min" },
      { mode: "Airport", name: "Marivane International", time: "22 min by car" },
    ],
    bestFor: ["Conversions", "First purchase", "Rental yield", "Nightlife"],
  },
  {
    id: "n-06",
    slug: "harbour-point",
    name: "Harbour Point",
    tagline: "A working harbour that kept its manners",
    summary:
      "The southern headland: a sailing harbour, a lighthouse, and eighty houses that have never all been on the market at once.",
    overview: [
      "Harbour Point is a headland with a marina at its foot and a lighthouse at its tip. The sailing club was founded in 1907 and still runs the moorings, which is why the harbour has fewer than three hundred berths and no plans for more.",
      "The housing is a mix of nineteenth-century pilot cottages along the harbour wall and a small number of contemporary houses on the cliff above, each one individually commissioned. Turnover is glacial. Most sales here happen before a listing is ever published.",
    ],
    lifestyle: [
      "The harbour sets the rhythm: tides, race days, and the chandlery that also sells the best coffee on the point.",
      "Swimming from the east cove is possible eight months a year; the water in the harbour is too busy for it.",
      "It is twenty-five minutes from the Central District, and it feels like a different country.",
    ],
    hero: img("coastal-04", "Pilot cottages along the harbour wall at Harbour Point"),
    portrait: img("tall-03", "A contemporary house above the harbour"),
    images: [
      img("coastal-07", "The marina and lighthouse at the tip of the headland"),
      img("villa-08", "A contemporary cliff house above the harbour"),
      img("detail-07", "Stone and lime render on a harbour-side elevation"),
    ],
    coordinates: { lat: 38.6802, lng: -9.2114 },
    averagePrice: 3_100_000,
    pricePerArea: 8_600,
    yearOnYear: 5.5,
    walkScore: 68,
    highlights: [
      { name: "Clube Naval", category: "Wellness", note: "Sailing club, founded 1907; the moorings are theirs." },
      { name: "O Farol", category: "Restaurant", note: "Fish landed that morning, cooked over charcoal." },
      { name: "Escola do Mar", category: "School", note: "Small primary with a sailing programme." },
      { name: "East Cove", category: "Outdoors", note: "Sheltered swimming from April to November." },
      { name: "The Chandlery", category: "Retail", note: "Rope, charts, and the best coffee on the point." },
      { name: "Farol Museum", category: "Culture", note: "The lighthouse keeper's cottage, open weekends." },
    ],
    transport: [
      { mode: "Ferry", name: "Harbour Point to Waterfront", time: "14 min" },
      { mode: "Road", name: "Coast road to Central", time: "25 min by car" },
      { mode: "Rail", name: "Ponta (regional line)", time: "18 min" },
      { mode: "Airport", name: "Marivane International", time: "38 min by car" },
    ],
    bestFor: ["Waterside", "Sailing", "Second homes", "Privacy"],
  },
];

export const neighborhoodBySlug = (slug: string) =>
  neighborhoods.find((n) => n.slug === slug);

export const neighborhoodName = (slug: string) =>
  neighborhoodBySlug(slug)?.name ?? slug;
