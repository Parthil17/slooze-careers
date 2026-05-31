export interface Restaurant {
  id: string;
  name: string;
  description: string;
  country: string;
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  imageUrl?: string | null;
  restaurantId: string;
  restaurant?: Restaurant;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: string | number;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: string | number;
  country: string;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
  payment?: { id: string; status: string };
}

export interface PaymentMethod {
  id: string;
  cardHolder: string;
  cardNumberMasked: string;
  expiryDate: string;
}
