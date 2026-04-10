import { readFileSync } from "node:fs";
import path from "node:path";
import { runInNewContext } from "node:vm";

const PRODUCT_SEED_FILE =
  "Pasted-const-productData-id-1-name-Jumboo-Red-Dragon-Fruit-Pla_1774988555520.txt";
const DEFAULT_PRODUCT_IMAGE = "/opengraph.jpg";
const DEFAULT_UNIT = "plant";
const DEFAULT_HAPPY_CUSTOMERS = 500;
const DEFAULT_YEARS_OF_FARMING = 12;
const DEFAULT_CITIES_DELIVERED = 25;

interface SeedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  imageUrl1: string;
  imageUrl2: string | null;
  imageUrl3: string | null;
  imageUrl4: string | null;
  imageUrl5: string | null;
  badge: string | null;
  inStock: boolean;
  featured: boolean;
  createdAt: Date;
}

export interface MockProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl1: string;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  imageUrl4?: string | null;
  imageUrl5?: string | null;
  badge?: string | null;
  inStock?: boolean;
  featured?: boolean;
}

export interface MockReview {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface MockGalleryImage {
  id: number;
  imageUrl: string;
  caption: string;
  category: string;
}

const badgeById = new Map<number, string>([
  [1, "Top Seller"],
  [2, "Best Product"],
  [8, "Premium"],
  [17, "Rare"],
  [42, "Collector"],
]);

const featuredIds = new Set([1, 2, 5, 8, 13, 17, 21, 42]);

const fallbackSeedProducts: SeedProduct[] = [
  {
    id: 1,
    name: "Jumbo Red Dragon Fruit Plant",
    description:
      "A bold red variety with sweet flesh, strong stems, and reliable production for home growers.",
    price: 100,
    image: "/images/gallery-1.png",
  },
  {
    id: 2,
    name: "Moroccan Red Dragon Fruit Plant",
    description:
      "A bright red favorite with balanced sweetness and a striking look in the nursery and on the plate.",
    price: 100,
    image: "/images/gallery-2.png",
  },
  {
    id: 3,
    name: "Vietnamese White Dragon Fruit Plant",
    description:
      "A classic white-fleshed variety known for crisp texture, easy handling, and dependable harvests.",
    price: 180,
    image: "/images/gallery-3.png",
  },
  {
    id: 4,
    name: "Palora Dragon Fruit Plant",
    description:
      "A yellow-skinned variety with sweet flesh and a premium profile for collectors and first-time buyers alike.",
    price: 350,
    image: "/images/gallery-4.png",
  },
  {
    id: 5,
    name: "Desert King Dragon Fruit Plant",
    description:
      "A large, juicy cultivar that performs well in warm climates and stands out for early, heavy fruiting.",
    price: 600,
    image: "/images/gallery-5.png",
  },
  {
    id: 6,
    name: "American Beauty Dragon Fruit Plant",
    description:
      "A popular nursery staple with vivid color, sweet flesh, and a dependable growth habit.",
    price: 300,
    image: "/images/gallery-6.png",
  },
];

const mockReviews: MockReview[] = [
  {
    id: 1,
    customerName: "Ritika Sharma",
    rating: 5,
    comment:
      "Healthy plants, careful packaging, and very helpful support after delivery.",
    avatarUrl: null,
    createdAt: new Date("2026-01-12T08:00:00.000Z"),
  },
  {
    id: 2,
    customerName: "Arjun Verma",
    rating: 5,
    comment:
      "The plants arrived fresh and started adapting quickly. Great nursery quality.",
    avatarUrl: null,
    createdAt: new Date("2026-02-03T08:00:00.000Z"),
  },
  {
    id: 3,
    customerName: "Sneha Patel",
    rating: 4,
    comment:
      "Nice variety selection and fast WhatsApp support. I will order again.",
    avatarUrl: null,
    createdAt: new Date("2026-02-21T08:00:00.000Z"),
  },
  {
    id: 4,
    customerName: "Vikram Singh",
    rating: 5,
    comment:
      "Beautiful plants and clear instructions. The premium varieties looked even better than expected.",
    avatarUrl: null,
    createdAt: new Date("2026-03-07T08:00:00.000Z"),
  },
];

const mockGallery: MockGalleryImage[] = [
  {
    id: 1,
    imageUrl: "/images/gallery-1.png",
    caption: "Fresh red-flesh dragon fruit cut open in the middle of the farm",
    category: "Fresh Cut",
  },
  {
    id: 2,
    imageUrl: "/images/gallery-2.png",
    caption: "Heavy fruit cluster ripening naturally on the dragon fruit plant",
    category: "Harvest",
  },
  {
    id: 3,
    imageUrl: "/images/gallery-3.png",
    caption: "Green shaded farm pathway showing healthy plantation rows",
    category: "Farm Walk",
  },
  {
    id: 4,
    imageUrl: "/images/gallery-4.png",
    caption: "Flowering rows during peak growth season",
    category: "Farm",
  },
  {
    id: 5,
    imageUrl: "/images/gallery-5.png",
    caption: "Wide nursery field view with lush rows spread across the landscape",
    category: "Plantation",
  },
  {
    id: 6,
    imageUrl: "/images/gallery-6.png",
    caption: "Packaged orders heading out for doorstep delivery",
    category: "Delivery",
  },
];

let productStore: MockProduct[] | null = null;

function cloneProduct(product: MockProduct): MockProduct {
  return {
    ...product,
    createdAt: new Date(product.createdAt),
  };
}

function resolveProductSeedPath(): string {
  return path.resolve(
    process.cwd(),
    "..",
    "..",
    "attached_assets",
    PRODUCT_SEED_FILE,
  );
}

function getFallbackImageForIndex(index: number): string {
  const imageNumber = (index % 6) + 1;
  return `/images/gallery-${imageNumber}.png`;
}

function normalizeImageUrl(imageUrl: string | undefined, index: number): string {
  const value = imageUrl?.trim();

  if (!value) {
    return getFallbackImageForIndex(index);
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("/")
  ) {
    return value;
  }

  if (value.startsWith("img/")) {
    return getFallbackImageForIndex(index);
  }

  return DEFAULT_PRODUCT_IMAGE;
}

function loadSeedProducts(): SeedProduct[] {
  try {
    const source = readFileSync(resolveProductSeedPath(), "utf8");
    const result = runInNewContext(`${source}\nproductData;`) as unknown;

    if (Array.isArray(result)) {
      return result as SeedProduct[];
    }
  } catch {
    // Fall back to a small local seed set when the pasted asset is unavailable.
  }

  return fallbackSeedProducts;
}

function buildMockProducts(): MockProduct[] {
  return loadSeedProducts().map((product, index) => {
    const primaryImage = normalizeImageUrl(product.image, index);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      unit: DEFAULT_UNIT,
      imageUrl: primaryImage,
      imageUrl1: primaryImage,
      imageUrl2: null,
      imageUrl3: null,
      imageUrl4: null,
      imageUrl5: null,
      badge: badgeById.get(product.id) ?? null,
      inStock: true,
      featured: featuredIds.has(product.id),
      createdAt: new Date(Date.UTC(2026, 0, index + 1)),
    };
  });
}

function ensureProductStore(): MockProduct[] {
  if (!productStore) {
    productStore = buildMockProducts();
  }

  return productStore;
}

export function getMockProducts(): MockProduct[] {
  return ensureProductStore().map(cloneProduct);
}

export function getMockProductById(id: number): MockProduct | null {
  const product = ensureProductStore().find((item) => item.id === id);
  return product ? cloneProduct(product) : null;
}

export function createMockProduct(input: MockProductInput): MockProduct {
  const store = ensureProductStore();
  const nextId = store.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1;
  const createdProduct: MockProduct = {
    id: nextId,
    name: input.name,
    description: input.description,
    price: Number(input.price),
    unit: input.unit || DEFAULT_UNIT,
    imageUrl: input.imageUrl1 || DEFAULT_PRODUCT_IMAGE,
    imageUrl1: input.imageUrl1 || DEFAULT_PRODUCT_IMAGE,
    imageUrl2: input.imageUrl2 ?? null,
    imageUrl3: input.imageUrl3 ?? null,
    imageUrl4: input.imageUrl4 ?? null,
    imageUrl5: input.imageUrl5 ?? null,
    badge: input.badge ?? null,
    inStock: input.inStock ?? true,
    featured: input.featured ?? false,
    createdAt: new Date(),
  };

  store.unshift(createdProduct);
  return cloneProduct(createdProduct);
}

export function updateMockProduct(
  id: number,
  input: MockProductInput,
): MockProduct | null {
  const store = ensureProductStore();
  const productIndex = store.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return null;
  }

  const updatedProduct: MockProduct = {
    ...store[productIndex],
    name: input.name,
    description: input.description,
    price: Number(input.price),
    unit: input.unit || DEFAULT_UNIT,
    imageUrl: input.imageUrl1 || DEFAULT_PRODUCT_IMAGE,
    imageUrl1: input.imageUrl1 || DEFAULT_PRODUCT_IMAGE,
    imageUrl2: input.imageUrl2 ?? null,
    imageUrl3: input.imageUrl3 ?? null,
    imageUrl4: input.imageUrl4 ?? null,
    imageUrl5: input.imageUrl5 ?? null,
    badge: input.badge ?? null,
    inStock: input.inStock ?? true,
    featured: input.featured ?? false,
  };

  store[productIndex] = updatedProduct;
  return cloneProduct(updatedProduct);
}

export function deleteMockProduct(id: number): boolean {
  const store = ensureProductStore();
  const productIndex = store.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return false;
  }

  store.splice(productIndex, 1);
  return true;
}

export function getMockReviews(): MockReview[] {
  return mockReviews.map((review) => ({
    ...review,
    createdAt: new Date(review.createdAt),
  }));
}

export function getMockGallery(): MockGalleryImage[] {
  return mockGallery.map((image) => ({ ...image }));
}

export function getMockStoreStats() {
  return {
    totalProducts: ensureProductStore().length,
    happyCustomers: DEFAULT_HAPPY_CUSTOMERS,
    yearsOfFarming: DEFAULT_YEARS_OF_FARMING,
    citiesDelivered: DEFAULT_CITIES_DELIVERED,
  };
}
