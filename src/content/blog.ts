export type Post = {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  sections: { heading: string; body: string[] }[];
};


export const posts: Post[] = [
  {
    slug: "how-to-choose-bridal-jewellery-set",
    title: "How to Choose a Bridal Jewellery Set for Your Wedding Outfit",
    description:
      "A practical guide to matching a bridal jewellery set with your dress colour, neckline and hairstyle, with simple rules for earrings, necklace length and bangles.",
    updated: "2026-10-28",
    sections: [
      {
        heading: "Start with the neckline, not the necklace",
        body: [
          "The neckline of your outfit decides which necklace works. A high or boat neckline sits best with a short choker or a collar-style set, because a long piece would crowd the fabric. A deep or sweetheart neckline leaves room for a longer necklace or a layered set.",
          "If you are wearing a heavily embroidered dupatta over your shoulders, keep the necklace simpler so the two do not compete.",
        ],
      },
      {
        heading: "Match the metal tone to the embroidery",
        body: [
          "Look at the thread or zari on your outfit. Gold-toned embroidery pairs naturally with warm yellow-gold jewellery, while silver or pearl-toned work suits cooler tones. Mixing tones is possible, but choose one as the main tone and keep the other to small accents.",
        ],
      },
      {
        heading: "Balance earrings with your hairstyle",
        body: [
          "With an open hairstyle, statement jhumkay or long earrings show clearly. With a bun or hair covered by a dupatta, large earrings and a matha patti can become too much, so pick one focal point and let the rest support it.",
        ],
      },
      {
        heading: "Finish with bangles and a final check",
        body: [
          "Bangles should be comfortable enough to wear for hours and sized so they do not slide over the hand. Before the day, wear the whole set with the outfit once, sit down, raise your arms and move around, so you know nothing catches or feels heavy.",
        ],
      },
    ],
  },
  {
    slug: "how-to-care-for-fashion-jewellery",
    title: "How to Care for Fashion Jewellery So It Stays Bright",
    description:
      "Simple storage and cleaning habits that slow down tarnish and keep fashion jewellery looking new: dry storage, wearing order, and what to avoid.",
    updated: "2026-10-28",
    sections: [
      {
        heading: "Keep it dry and apart",
        body: [
          "Moisture is the main cause of dulling. Store each piece in a dry pouch or box, and keep pieces from rubbing against each other, because chains tangle and stones can scratch plating.",
        ],
      },
      {
        heading: "Put jewellery on last, take it off first",
        body: [
          "Perfume, hairspray and lotion can mark plating and loosen stones. Apply them first, let them dry, then wear your jewellery. At the end of the day, wipe each piece gently with a soft dry cloth before storing it.",
        ],
      },
      {
        heading: "Avoid water, sweat and harsh cleaners",
        body: [
          "Remove jewellery before bathing, swimming or exercising. Do not use abrasive polish or strong chemicals on plated or stone-set pieces. A soft cloth is usually enough.",
        ],
      },
    ],
  },
  {
    slug: "earring-styles-guide-jhumka-studs-hoops",
    title: "Earring Styles Explained: Jhumka, Studs, Hoops and Drops",
    description:
      "What each popular earring style looks like, when to wear it, and how to pick a pair for daily wear, parties and weddings.",
    updated: "2026-10-28",
    sections: [
      {
        heading: "Studs for every day",
        body: ["Studs sit close to the ear, stay light and go with almost anything, which makes them the easiest choice for work and daily wear."],
      },
      {
        heading: "Hoops and drops for parties",
        body: ["Hoops add a bold line around the face, and drop earrings add movement. Both work well with simple outfits where the earrings can be the focus."],
      },
      {
        heading: "Jhumkay for festive and bridal wear",
        body: [
          "Jhumkay, the bell-shaped earrings, are a staple of Pakistani festive and bridal styling. Heavier pairs look best with an open hairstyle, while lighter pairs are easier to wear for a full day.",
        ],
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
