export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  step: number;
  image_url?: string;
  aliases?: string;
}

export interface Catalog {
  version: string;
  items: CatalogItem[];
}
