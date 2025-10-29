import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart, SelectedIngredient } from '@/types/cart';
import { calculateItemTotal } from '@/lib/utils';

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateIngredients: (itemId: string, ingredients: SelectedIngredient[]) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      itemCount: 0,

      addItem: (newItem) => {
        const items = get().items;
        const newIds = [...newItem.selectedIngredients.map((si) => si.id)].sort().join(',');
        const existingItemIndex = items.findIndex((item) => {
          const ids = [...item.selectedIngredients.map((si) => si.id)].sort().join(',');
          return item.mealId === newItem.mealId && ids === newIds;
        });

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          updatedItems[existingItemIndex].totalPrice = calculateItemTotal(
            newItem.meal.price,
            updatedItems[existingItemIndex].quantity,
            newItem.selectedIngredients
          );
          
          set({
            items: updatedItems,
            totalAmount: get().getTotalAmount(),
            itemCount: get().getItemCount(),
          });
        } else {
          // Add new item
          const cartItem: CartItem = {
            id: `${newItem.mealId}-${Date.now()}-${Math.random()}`,
            ...newItem,
            totalPrice: calculateItemTotal(
              newItem.meal.price,
              newItem.quantity,
              newItem.selectedIngredients
            ),
          };

          set({
            items: [...items, cartItem],
            totalAmount: get().getTotalAmount(),
            itemCount: get().getItemCount(),
          });
        }
      },

      removeItem: (itemId) => {
        const items = get().items.filter((item) => item.id !== itemId);
        set({
          items,
          totalAmount: get().getTotalAmount(),
          itemCount: get().getItemCount(),
        });
      },

  updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const items = get().items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, quantity };
            updatedItem.totalPrice = calculateItemTotal(
              item.meal.price,
              quantity,
              item.selectedIngredients
            );
            return updatedItem;
          }
          return item;
        });

        set({
          items,
          totalAmount: get().getTotalAmount(),
          itemCount: get().getItemCount(),
        });
      },

      updateIngredients: (itemId, ingredients) => {
        const items = get().items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, selectedIngredients: ingredients };
            updatedItem.totalPrice = calculateItemTotal(
              item.meal.price,
              item.quantity,
              ingredients
            );
            return updatedItem;
          }
          return item;
        });

        set({
          items,
          totalAmount: get().getTotalAmount(),
          itemCount: get().getItemCount(),
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          itemCount: 0,
        });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.totalPrice, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);