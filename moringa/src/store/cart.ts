import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart, SelectedIngredient } from '@/types/cart';
import { calculateItemTotal } from '@/lib/utils';

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateIngredients: (itemId: string, ingredients: SelectedIngredient[], removedIngredients?: SelectedIngredient[]) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalAmount: () => number;
}

// Migration function to fix old cart items with multilingual meal names
function migrateCartItems(items: any[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    // If meal.name is an object, convert it to English string
    if (item?.meal?.name && typeof item.meal.name === 'object' && item.meal.name !== null) {
      const nameObj = item.meal.name as any;
      const englishName = nameObj.en || nameObj.ar || nameObj.he || '';
      console.log('[Cart Migration] Converting meal name from object to string:', nameObj, '→', englishName);
      return {
        ...item,
        meal: {
          ...item.meal,
          name: englishName
        }
      };
    }
    return item;
  });
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
        const newRemovedIds = [...(newItem.removedIngredients || []).map((ri) => ri.id)].sort().join(',');
        // Always store meal.name as a string (English)
        let mealName = newItem.meal.name;
        if (mealName && typeof mealName === 'object' && mealName !== null) {
          const nameObj = mealName as any;
          mealName = nameObj.en || nameObj.ar || nameObj.he || '';
        }
        const normalizedMeal = { ...newItem.meal, name: mealName as string };
        const normalizedNewItem = { ...newItem, meal: normalizedMeal };
        const existingItemIndex = items.findIndex((item) => {
          const ids = [...item.selectedIngredients.map((si) => si.id)].sort().join(',');
          const removedIds = [...(item.removedIngredients || []).map((ri) => ri.id)].sort().join(',');
          return item.mealId === newItem.mealId && ids === newIds && removedIds === newRemovedIds;
        });

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          updatedItems[existingItemIndex].totalPrice = calculateItemTotal(
            normalizedMeal.price,
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
            ...normalizedNewItem,
            totalPrice: calculateItemTotal(
              normalizedMeal.price,
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

      updateIngredients: (itemId, ingredients, removedIngredients) => {
        const items = get().items.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { 
              ...item, 
              selectedIngredients: ingredients,
              removedIngredients: removedIngredients && removedIngredients.length > 0 ? removedIngredients : undefined,
            };
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
      version: 4,
      migrate: (persistedState: any, version: number) => {
        console.log('[Cart Migration] Running migration from version', version, 'to 4');
        if (persistedState?.items) {
          console.log('[Cart Migration] Found', persistedState.items.length, 'items to migrate');
          persistedState.items = migrateCartItems(persistedState.items);
          console.log('[Cart Migration] Migration complete, migrated items:', persistedState.items.map((it: any) => ({ id: it.id, name: it.meal?.name, type: typeof it.meal?.name })));
        }
        return persistedState;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('[Cart] Rehydration error:', error);
            return;
          }
          if (state?.items && state.items.length > 0) {
            console.log('[Cart] Checking for items needing migration after rehydration, found', state.items.length, 'items');
            // Force fix any items with object names (runtime safety check)
            const needsFix = state.items.some(item => 
              item?.meal?.name && typeof item.meal.name === 'object'
            );
            if (needsFix) {
              console.error('[Cart] CRITICAL: Found items with object names! Clearing cart for safety...');
              // Clear the cart completely to avoid backend errors
              useCartStore.setState({ items: [], totalAmount: 0, itemCount: 0 });
              console.warn('[Cart] Cart cleared. Please add items again.');
              // Show user-friendly message
              if (typeof window !== 'undefined') {
                setTimeout(() => {
                  alert('Your cart has been cleared due to a data format update. Please add items again.');
                }, 100);
              }
            } else {
              console.log('[Cart] All items already have string names');
            }
          }
        };
      },
    }
  )
);