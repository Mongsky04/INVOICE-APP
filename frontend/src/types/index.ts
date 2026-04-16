export interface Item {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: number;
}

export interface InvoiceDetail {
  item_id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface InvoiceFormData {
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  details: InvoiceDetail[];
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  total_amount: number;
  created_by: string;
  details: {
    id: string;
    item_id: string;
    item: Item;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  created_at: string;
}
