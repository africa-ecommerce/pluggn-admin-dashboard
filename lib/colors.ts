export interface ColorOption {
  name: string;
  value: string;
  hex: string;
}

export const PREDEFINED_COLORS: ColorOption[] = [
  // Primary Colors
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Purple", value: "purple", hex: "#a855f7" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Orange", value: "orange", hex: "#f97316" },

  // Neutral Basics
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Gray", value: "gray", hex: "#6b7280" },
  { name: "Light Gray", value: "light-gray", hex: "#d1d5db" },
  { name: "Silver", value: "silver", hex: "#c0c0c0" },
  { name: "Charcoal", value: "charcoal", hex: "#36454f" },
  { name: "Brown", value: "brown", hex: "#8b4513" },
  { name: "Tan", value: "tan", hex: "#d2b48c" },

  // Fashion / Lifestyle
  { name: "Navy Blue", value: "navy-blue", hex: "#1e3a8a" },
  { name: "Wine Red", value: "wine-red", hex: "#7c2d12" }, // renamed from burgundy
  { name: "Beige", value: "beige", hex: "#f5f5dc" },
  { name: "Cream", value: "cream", hex: "#fffdd0" },
  { name: "Khaki", value: "khaki", hex: "#f0e68c" },
  { name: "Olive Green", value: "olive-green", hex: "#808000" },
  { name: "Teal", value: "teal", hex: "#008080" },

  // Popular Product Colors
  { name: "Rose Gold", value: "rose-gold", hex: "#e8b4b8" },
  { name: "Space Gray", value: "space-gray", hex: "#4a4a4a" },
  { name: "Midnight Blue", value: "midnight-blue", hex: "#191970" },
  { name: "Dark Green", value: "dark-green", hex: "#228b22" }, // renamed from forest green
  { name: "Coral", value: "coral", hex: "#ff7f50" },
  { name: "Turquoise", value: "turquoise", hex: "#40e0d0" },
  { name: "Lavender", value: "lavender", hex: "#e6e6fa" },
  { name: "Mint Green", value: "mint-green", hex: "#98fb98" },
  { name: "Peach", value: "peach", hex: "#ffe5b4" },
  { name: "Sky Blue", value: "sky-blue", hex: "#87ceeb" },
  { name: "Light Pink", value: "light-pink", hex: "#ffb6c1" },
  { name: "Gold", value: "gold", hex: "#ffd700" },
  { name: "Bronze", value: "bronze", hex: "#cd7f32" },
  { name: "Ivory", value: "ivory", hex: "#fffff0" },
];
