export type SelectedIngredient = {
  id: string;
  name: string;
  price: number;
};

export type CartMeal = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  mealId: string;
  meal: CartMeal;
  quantity: number;
  selectedIngredients: SelectedIngredient[]; // extras only
  removedIngredients?: SelectedIngredient[]; // Default ingredients that were removed
  specialInstructions?: string;
  totalPrice: number;
};

export type Cart = {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
};
