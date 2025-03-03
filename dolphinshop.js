export const meta = {
  name: "dolphinshop",
  description: "A sea-bound shop run by Captain Flipper, offering oceanic treasures and gear!",
  version: "1.0.0",
  author: "MrkimstersDev",
  usage: "{prefix}dolphinshop",
  category: "Shop",
  permissions: [0], // Public access
  noPrefix: false,
};

const dolphinShop = {
  key: "dolphinShop",
  itemData: [
    // Consumables (10 items)
    {
      icon: "🍤",
      name: "Shrimp Snack",
      key: "shrimpSnack",
      type: "food",
      flavorText: "A tasty treat dolphins love. Restores 20 HP.",
      price: 200,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Shrimp Snack",
          key: "shrimpSnack",
          flavorText: "A tasty treat dolphins love. Restores 20 HP.",
          icon: "🍤",
          type: "food",
          heal: 20,
          sellPrice: 100,
        });
      },
    },
    {
      icon: "🐟",
      name: "Fresh Mackerel",
      key: "freshMackerel",
      type: "food",
      flavorText: "A dolphin’s favorite catch. Restores 40 HP.",
      price: 500,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Fresh Mackerel",
          key: "freshMackerel",
          flavorText: "A dolphin’s favorite catch. Restores 40 HP.",
          icon: "🐟",
          type: "food",
          heal: 40,
          sellPrice: 250,
        });
      },
    },
    {
      icon: "🌊",
      name: "Ocean Dew",
      key: "oceanDew",
      type: "food",
      flavorText: "Pure water from the deep sea. Restores 60 HP.",
      price: 1000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Ocean Dew",
          key: "oceanDew",
          flavorText: "Pure water from the deep sea. Restores 60 HP.",
          icon: "🌊",
          type: "food",
          heal: 60,
          sellPrice: 500,
        });
      },
    },
    {
      icon: "🍈",
      name: "Kelp Smoothie",
      key: "kelpSmoothie",
      type: "food",
      flavorText: "A nutritious blend from the sea. Restores 80 HP.",
      price: 1500,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Kelp Smoothie",
          key: "kelpSmoothie",
          flavorText: "A nutritious blend from the sea. Restores 80 HP.",
          icon: "🍈",
          type: "food",
          heal: 80,
          sellPrice: 750,
        });
      },
    },
    {
      icon: "⭐",
      name: "Starfish Essence",
      key: "starfishEssence",
      type: "food",
      flavorText: "A glowing extract that boosts energy. Restores 100 HP.",
      price: 2500,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Starfish Essence",
          key: "starfishEssence",
          flavorText: "A glowing extract that boosts energy. Restores 100 HP.",
          icon: "⭐",
          type: "food",
          heal: 100,
          sellPrice: 1250,
        });
      },
    },
    {
      icon: "🪸",
      name: "Coral Tonic",
      key: "coralTonic",
      type: "food",
      flavorText: "A vibrant drink from coral reefs. Restores 120 HP.",
      price: 4000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Coral Tonic",
          key: "coralTonic",
          flavorText: "A vibrant drink from coral reefs. Restores 120 HP.",
          icon: "🪸",
          type: "food",
          heal: 120,
          sellPrice: 2000,
        });
      },
    },
    {
      icon: "💧",
      name: "Siren’s Tear",
      key: "sirenTear",
      type: "food",
      flavorText: "A mystical drop said to heal all wounds. Restores 150 HP.",
      price: 6000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Siren’s Tear",
          key: "sirenTear",
          flavorText: "A mystical drop said to heal all wounds. Restores 150 HP.",
          icon: "💧",
          type: "food",
          heal: 150,
          sellPrice: 3000,
        });
      },
    },
    {
      icon: "🌙",
      name: "Moonlit Jelly",
      key: "moonlitJelly",
      type: "food",
      flavorText: "A glowing jellyfish treat. Restores 200 HP.",
      price: 10000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Moonlit Jelly",
          key: "moonlitJelly",
          flavorText: "A glowing jellyfish treat. Restores 200 HP.",
          icon: "🌙",
          type: "food",
          heal: 200,
          sellPrice: 5000,
        });
      },
    },
    {
      icon: "🌞",
      name: "Sunken Sunfruit",
      key: "sunkenSunfruit",
      type: "food",
      flavorText: "A radiant fruit from the ocean depths. Restores 250 HP.",
      price: 15000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Sunken Sunfruit",
          key: "sunkenSunfruit",
          flavorText: "A radiant fruit from the ocean depths. Restores 250 HP.",
          icon: "🌞",
          type: "food",
          heal: 250,
          sellPrice: 7500,
        });
      },
    },
    {
      icon: "✨",
      name: "Dolphin Spark",
      key: "dolphinSpark",
      type: "food",
      flavorText: "A magical essence from a dolphin’s leap. Restores 300 HP.",
      price: 20000,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Dolphin Spark",
          key: "dolphinSpark",
          flavorText: "A magical essence from a dolphin’s leap. Restores 300 HP.",
          icon: "✨",
          type: "food",
          heal: 300,
          sellPrice: 10000,
        });
      },
    },

    // Armor (10 items)
    {
      icon: "🛡️",
      name: "Shell Shield",
      key: "shellShield",
      type: "armor",
      flavorText: "A sturdy shield made from seashells. Boosts DEF by 5.",
      price: 800,
      def: 5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Shell Shield",
          key: "shellShield",
          flavorText: "A sturdy shield made from seashells. Boosts DEF by 5.",
          icon: "🛡️",
          type: "armor",
          def: 5,
          sellPrice: 400,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Coral Armor",
      key: "coralArmor",
      type: "armor",
      flavorText: "Light armor crafted from coral. Boosts DEF by 10.",
      price: 1500,
      def: 10,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Coral Armor",
          key: "coralArmor",
          flavorText: "Light armor crafted from coral. Boosts DEF by 10.",
          icon: "🛡️",
          type: "armor",
          def: 10,
          sellPrice: 750,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Pearl Plate",
      key: "pearlPlate",
      type: "armor",
      flavorText: "A shimmering plate of pearl. Boosts DEF by 15.",
      price: 3000,
      def: 15,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Pearl Plate",
          key: "pearlPlate",
          flavorText: "A shimmering plate of pearl. Boosts DEF by 15.",
          icon: "🛡️",
          type: "armor",
          def: 15,
          sellPrice: 1500,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Tide Guard",
      key: "tideGuard",
      type: "armor",
      flavorText: "Armor blessed by the tides. Boosts DEF by 20.",
      price: 5000,
      def: 20,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Tide Guard",
          key: "tideGuard",
          flavorText: "Armor blessed by the tides. Boosts DEF by 20.",
          icon: "🛡️",
          type: "armor",
          def: 20,
          sellPrice: 2500,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Abyss Scale",
      key: "abyssScale",
      type: "armor",
      flavorText: "Scales from the deep sea. Boosts DEF by 25.",
      price: 8000,
      def: 25,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Abyss Scale",
          key: "abyssScale",
          flavorText: "Scales from the deep sea. Boosts DEF by 25.",
          icon: "🛡️",
          type: "armor",
          def: 25,
          sellPrice: 4000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Kraken Hide",
      key: "krakenHide",
      type: "armor",
      flavorText: "Tough hide from a legendary beast. Boosts DEF by 30.",
      price: 12000,
      def: 30,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Kraken Hide",
          key: "krakenHide",
          flavorText: "Tough hide from a legendary beast. Boosts DEF by 30.",
          icon: "🛡️",
          type: "armor",
          def: 30,
          sellPrice: 6000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Siren Veil",
      key: "sirenVeil",
      type: "armor",
      flavorText: "A mystical veil that wards off harm. Boosts DEF by 35.",
      price: 18000,
      def: 35,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Siren Veil",
          key: "sirenVeil",
          flavorText: "A mystical veil that wards off harm. Boosts DEF by 35.",
          icon: "🛡️",
          type: "armor",
          def: 35,
          sellPrice: 9000,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Neptune’s Crest",
      key: "neptuneCrest",
      type: "armor",
      flavorText: "A regal shield from the sea god. Boosts DEF by 40.",
      price: 25000,
      def: 40,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Neptune’s Crest",
          key: "neptuneCrest",
          flavorText: "A regal shield from the sea god. Boosts DEF by 40.",
          icon: "🛡️",
          type: "armor",
          def: 40,
          sellPrice: 12500,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Atlantis Mantle",
      key: "atlantisMantle",
      type: "armor",
      flavorText: "A lost city’s protective cloak. Boosts DEF by 50.",
      price: 35000,
      def: 50,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Atlantis Mantle",
          key: "atlantisMantle",
          flavorText: "A lost city’s protective cloak. Boosts DEF by 50.",
          icon: "🛡️",
          type: "armor",
          def: 50,
          sellPrice: 17500,
        });
      },
    },
    {
      icon: "🛡️",
      name: "Dolphin Fin Aegis",
      key: "dolphinFinAegis",
      type: "armor",
      flavorText: "A sacred shield shaped like a dolphin fin. Boosts DEF by 60.",
      price: 50000,
      def: 60,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Dolphin Fin Aegis",
          key: "dolphinFinAegis",
          flavorText: "A sacred shield shaped like a dolphin fin. Boosts DEF by 60.",
          icon: "🛡️",
          type: "armor",
          def: 60,
          sellPrice: 25000,
        });
      },
    },

    // Weapons (10 items)
    {
      icon: "⚔️",
      name: "Coral Dagger",
      key: "coralDagger",
      type: "weapon",
      flavorText: "A sharp dagger carved from coral. ATK +5.",
      price: 1000,
      atk: 5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Coral Dagger",
          key: "coralDagger",
          flavorText: "A sharp dagger carved from coral. ATK +5.",
          icon: "⚔️",
          type: "weapon",
          atk: 5,
          sellPrice: 500,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Wave Slicer",
      key: "waveSlicer",
      type: "weapon",
      flavorText: "A blade that cuts like the tide. ATK +10.",
      price: 2000,
      atk: 10,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Wave Slicer",
          key: "waveSlicer",
          flavorText: "A blade that cuts like the tide. ATK +10.",
          icon: "⚔️",
          type: "weapon",
          atk: 10,
          sellPrice: 1000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Pearl Harpoon",
      key: "pearlHarpoon",
      type: "weapon",
      flavorText: "A harpoon tipped with pearl. ATK +15.",
      price: 3500,
      atk: 15,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Pearl Harpoon",
          key: "pearlHarpoon",
          flavorText: "A harpoon tipped with pearl. ATK +15.",
          icon: "⚔️",
          type: "weapon",
          atk: 15,
          sellPrice: 1750,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Tidal Trident",
      key: "tidalTrident",
      type: "weapon",
      flavorText: "A trident infused with tidal power. ATK +20.",
      price: 6000,
      atk: 20,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Tidal Trident",
          key: "tidalTrident",
          flavorText: "A trident infused with tidal power. ATK +20.",
          icon: "⚔️",
          type: "weapon",
          atk: 20,
          sellPrice: 3000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Abyss Blade",
      key: "abyssBlade",
      type: "weapon",
      flavorText: "A dark blade from the ocean depths. ATK +25.",
      price: 10000,
      atk: 25,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Abyss Blade",
          key: "abyssBlade",
          flavorText: "A dark blade from the ocean depths. ATK +25.",
          icon: "⚔️",
          type: "weapon",
          atk: 25,
          sellPrice: 5000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Kraken Fang",
      key: "krakenFang",
      type: "weapon",
      flavorText: "A jagged tooth-turned-weapon. ATK +30.",
      price: 15000,
      atk: 30,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Kraken Fang",
          key: "krakenFang",
          flavorText: "A jagged tooth-turned-weapon. ATK +30.",
          icon: "⚔️",
          type: "weapon",
          atk: 30,
          sellPrice: 7500,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Siren Songblade",
      key: "sirenSongblade",
      type: "weapon",
      flavorText: "A blade that sings with enchantment. ATK +35.",
      price: 20000,
      atk: 35,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Siren Songblade",
          key: "sirenSongblade",
          flavorText: "A blade that sings with enchantment. ATK +35.",
          icon: "⚔️",
          type: "weapon",
          atk: 35,
          sellPrice: 10000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Neptune’s Spear",
      key: "neptuneSpear",
      type: "weapon",
      flavorText: "A divine spear of the sea king. ATK +40.",
      price: 30000,
      atk: 40,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Neptune’s Spear",
          key: "neptuneSpear",
          flavorText: "A divine spear of the sea king. ATK +40.",
          icon: "⚔️",
          type: "weapon",
          atk: 40,
          sellPrice: 15000,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Atlantis Edge",
      key: "atlantisEdge",
      type: "weapon",
      flavorText: "A lost relic of a sunken city. ATK +50.",
      price: 45000,
      atk: 50,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Atlantis Edge",
          key: "atlantisEdge",
          flavorText: "A lost relic of a sunken city. ATK +50.",
          icon: "⚔️",
          type: "weapon",
          atk: 50,
          sellPrice: 22500,
        });
      },
    },
    {
      icon: "⚔️",
      name: "Dolphin Tail Blade",
      key: "dolphinTailBlade",
      type: "weapon",
      flavorText: "A swift blade mimicking a dolphin’s tail. ATK +60.",
      price: 60000,
      atk: 60,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          name: "Dolphin Tail Blade",
          key: "dolphinTailBlade",
          flavorText: "A swift blade mimicking a dolphin’s tail. ATK +60.",
          icon: "⚔️",
          type: "weapon",
          atk: 60,
          sellPrice: 30000,
        });
      },
    },
  ],
  // Shop Dialogues
  sellTexts: [
    "🐬 Arr! I don’t buy back treasures—me stock’s for sellin’ only!",
    "🐬 Feast yer eyes on me wares, matey! What’ll it be?",
  ],
  talkTexts: [
    {
      name: "Captain’s Tale",
      responses: [
        "🐬 I’ve sailed the seven seas with me dolphin crew, gatherin’ these riches!",
        "🐬 Once wrestled a kraken for that Fang—worth every splash!",
      ],
      icon: "⚓",
    },
    {
      name: "Item Legends",
      responses: [
        "🐬 The Dolphin Spark? Caught it mid-leap under a full moon!",
        "🐬 That Atlantis Edge be from a city lost to the waves—rare as a calm sea!",
      ],
      icon: "📜",
    },
  ],
  buyTexts: [
    "🐬 A fine pick, sailor! Dive into adventure with it!",
    "🐬 Ye’ve got a keen eye! That’ll serve ye well!",
  ],
  welcomeTexts: [
    "🐬 Ahoy, matey! Welcome to Captain Flipper’s Dolphin Shop!",
    "🐬 Step aboard me sea stall—treasures await ye!",
  ],
  goBackTexts: [
    "🐬 Back to the waves, eh? Come again soon!",
    "🐬 No rush—me treasures’ll wait fer ye!",
  ],
  askTalkTexts: [
    "🐬 Want to hear a sailor’s yarn ‘bout me goods?",
    "🐬 Curious ‘bout the tales these treasures hold?",
  ],
  thankTexts: [
    "🐬 Fair winds to ye, mate! Thanks fer shoppin’!",
    "🐬 Swim back anytime, ye hearty adventurer!",
  ],
};

export async function entry({ UTShop }) {
  const shop = new UTShop(dolphinShop);
  return shop.onPlay();
}