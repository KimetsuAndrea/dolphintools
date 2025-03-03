export const meta = {
  name: "dolphindive",
  description: "Dive with dolphins to collect ocean treasures!",
  version: "1.0.0",
  author: "MrkimstersDev",
  usage: "{prefix}dolphindive",
  category: "Idle Accumulation Games",
  permissions: [0], // Public access
  noPrefix: "both",
  otherNames: ["ddive"],
  shopPrice: 200,
  requirement: "1.0.0",
  icon: "🐬",
};

export const style = {
  title: "Dolphin Dive 🐬",
  contentFont: "fancy",
  titleFont: "bold",
};

const diveTreasures = [
  {
    name: "Shiny Shell",
    priceA: 3,
    priceB: 8,
    delay: 0.5, // Seconds
    icon: "🐚",
    chance: 0.35,
  },
  {
    name: "Pearl",
    priceA: 5,
    priceB: 12,
    delay: 1,
    icon: "💎",
    chance: 0.30,
  },
  {
    name: "Coral Fragment",
    priceA: 10,
    priceB: 25,
    delay: 2,
    icon: "🌊",
    chance: 0.25,
  },
  {
    name: "Sunken Coin",
    priceA: 20,
    priceB: 50,
    delay: 5,
    icon: "💰",
    chance: 0.20,
  },
  {
    name: "Sea Glass",
    priceA: 15,
    priceB: 35,
    delay: 3,
    icon: "🪟",
    chance: 0.22,
  },
  {
    name: "Clam Shell",
    priceA: 8,
    priceB: 20,
    delay: 1.5,
    icon: "🦪",
    chance: 0.28,
  },
  {
    name: "Starfish",
    priceA: 25,
    priceB: 60,
    delay: 7,
    icon: "⭐",
    chance: 0.18,
  },
  {
    name: "Abalone Shard",
    priceA: 30,
    priceB: 80,
    delay: 8,
    icon: "🌈",
    chance: 0.15,
  },
  {
    name: "Mermaid’s Comb",
    priceA: 40,
    priceB: 100,
    delay: 10,
    icon: "🧜‍♀️",
    chance: 0.12,
  },
  {
    name: "Golden Anchor",
    priceA: 50,
    priceB: 120,
    delay: 12,
    icon: "⚓",
    chance: 0.10,
  },
  {
    name: "Kraken Ink",
    priceA: 70,
    priceB: 150,
    delay: 15,
    icon: "🦑",
    chance: 0.08,
  },
  {
    name: "Poseidon’s Trident Tip",
    priceA: 100,
    priceB: 200,
    delay: 18,
    icon: "🔱",
    chance: 0.06,
  },
  {
    name: "Lost Treasure Chest",
    priceA: 150,
    priceB: 300,
    delay: 20,
    icon: "📦",
    chance: 0.05,
  },
  {
    name: "Siren’s Lyre String",
    priceA: 200,
    priceB: 400,
    delay: 25,
    icon: "🎶",
    chance: 0.03,
  },
  {
    name: "Atlantis Crystal",
    priceA: 500,
    priceB: 1000,
    delay: 30,
    icon: "✨",
    chance: 0.01,
  },
];

const dolphindive = {
  key: "dolphindive",
  verb: "dive",
  verbing: "diving",
  pastTense: "dived",
  checkIcon: "✓",
  initialStorage: 50, // Increased to accommodate more items
  itemData: diveTreasures,
  actionEmoji: "🐬",
  stoData: {
    price: 2000, // Higher upgrade cost due to more valuable items
  },
};

export async function entry({ GameSimulator }) {
  const simu = new GameSimulator(dolphindive);
  await simu.simulateAction();
}