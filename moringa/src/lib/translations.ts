// Common UI translations for the app
export const translations = {
  // Order Statuses
  orderStatus: {
    PENDING: {
      en: 'Pending',
      ar: 'قيد الانتظار',
      he: 'ממתין'
    },
    CONFIRMED: {
      en: 'Confirmed',
      ar: 'مؤكد',
      he: 'אושר'
    },
    PREPARING: {
      en: 'Preparing',
      ar: 'قيد التحضير',
      he: 'בהכנה'
    },
    READY: {
      en: 'Ready',
      ar: 'جاهز',
      he: 'מוכן'
    },
    OUT_FOR_DELIVERY: {
      en: 'Out for Delivery',
      ar: 'قيد التوصيل',
      he: 'במשלוח'
    },
    DELIVERED: {
      en: 'Delivered',
      ar: 'تم التوصيل',
      he: 'נמסר'
    },
    CANCELLED: {
      en: 'Cancelled',
      ar: 'ملغى',
      he: 'בוטל'
    }
  },

  // Order Types
  orderType: {
    DELIVERY: {
      en: 'Delivery',
      ar: 'توصيل',
      he: 'משלוח'
    },
    DINE_IN: {
      en: 'Dine In',
      ar: 'تناول في المطعم',
      he: 'אכילה במקום'
    },
    TAKE_AWAY: {
      en: 'Take Away',
      ar: 'استلام ذاتي',
      he: 'איסוף עצמי'
    }
  },

  // Payment Methods
  paymentMethod: {
    CASH: {
      en: 'Cash',
      ar: 'نقدي',
      he: 'מזומן'
    },
    CARD: {
      en: 'Card',
      ar: 'بطاقة',
      he: 'כרטיס'
    },
    MOBILE_MONEY: {
      en: 'Mobile Money',
      ar: 'محفظة إلكترونية',
      he: 'ארנק דיגיטלי'
    }
  },

  // Common UI elements
  common: {
    addToCart: {
      en: 'Add to Cart',
      ar: 'أضف إلى السلة',
      he: 'הוסף לעגלה'
    },
    viewCart: {
      en: 'View Cart',
      ar: 'عرض السلة',
      he: 'צפה בעגלה'
    },
    checkout: {
      en: 'Checkout',
      ar: 'إتمام الطلب',
      he: 'לתשלום'
    },
    total: {
      en: 'Total',
      ar: 'المجموع',
      he: 'סה"כ'
    },
    subtotal: {
      en: 'Subtotal',
      ar: 'المجموع الفرعي',
      he: 'סכום ביניים'
    },
    quantity: {
      en: 'Quantity',
      ar: 'الكمية',
      he: 'כמות'
    },
    price: {
      en: 'Price',
      ar: 'السعر',
      he: 'מחיר'
    },
    search: {
      en: 'Search',
      ar: 'بحث',
      he: 'חיפוש'
    },
    filter: {
      en: 'Filter',
      ar: 'تصفية',
      he: 'סנן'
    },
    required: {
      en: 'Required',
      ar: 'مطلوب',
      he: 'חובה'
    },
    optional: {
      en: 'Optional',
      ar: 'اختياري',
      he: 'אופציונלי'
    },
    included: {
      en: 'Included',
      ar: 'مشمول',
      he: 'כלול'
    },
    extras: {
      en: 'Extras',
      ar: 'إضافات',
      he: 'תוספות'
    },
    specialInstructions: {
      en: 'Special Instructions',
      ar: 'تعليمات خاصة',
      he: 'הוראות מיוחדות'
    },
    mealsAvailable: {
      en: 'meals available',
      ar: 'وجبات متاحة',
      he: 'ארוחות זמינות'
    },
    mealAvailable: {
      en: 'meal available',
      ar: 'وجبة متاحة',
      he: 'ארוחה זמינה'
    },
    customizableWith: {
      en: 'Customizable with',
      ar: 'قابل للتخصيص مع',
      he: 'ניתן להתאמה אישית עם'
    },
    ingredientOptions: {
      en: 'ingredient options',
      ar: 'خيارات المكونات',
      he: 'אפשרויות רכיבים'
    },
    includedByDefault: {
      en: 'Included by default',
      ar: 'مشمول افتراضياً',
      he: 'כלול כברירת מחדל'
    },
    addExtras: {
      en: 'Add extras',
      ar: 'إضافة مكونات إضافية',
      he: 'הוסף תוספות'
    },
    all: {
      en: 'All',
      ar: 'الكل',
      he: 'הכל'
    },
    noMealsFound: {
      en: 'No meals found',
      ar: 'لم يتم العثور على وجبات',
      he: 'לא נמצאו ארוחות'
    }
  }
};

// Helper function to get translation
export function getTranslation(
  category: keyof typeof translations,
  key: string,
  language: 'en' | 'ar' | 'he'
): string {
  const translationCategory = translations[category] as Record<string, Record<string, string>>;
  if (!translationCategory || !translationCategory[key]) {
    return key;
  }
  return translationCategory[key][language] || key;
}
