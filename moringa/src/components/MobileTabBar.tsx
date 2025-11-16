"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, UtensilsCrossed, ListOrdered, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

export function MobileTabBar() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const itemCount = useCartStore((s) => s.getItemCount());

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/50 bg-card/90 backdrop-blur-xl"
      aria-label="Bottom navigation"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
    >
      <div className="max-w-7xl mx-auto px-3">
        <ul className="grid grid-cols-4 gap-2 py-2">
          <li>
            <Link
              href="/menu"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                pathname === "/menu" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={pathname === "/menu" ? "page" : undefined}
            >
              <UtensilsCrossed className="h-5 w-5 mb-0.5" />
              <span>{getTranslation("common", "menu", language) || "Menu"}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/orders"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                pathname === "/orders" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={pathname === "/orders" ? "page" : undefined}
            >
              <ListOrdered className="h-5 w-5 mb-0.5" />
              <span>{getTranslation("common", "myOrders", language) || "Orders"}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cart"
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                pathname === "/cart" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={pathname === "/cart" ? "page" : undefined}
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 mb-0.5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
              <span>{getTranslation("common", "cart", language) || "Cart"}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                pathname?.startsWith("/profile") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <User className="h-5 w-5 mb-0.5" />
              <span>{getTranslation("common", "profile", language) || "Profile"}</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
