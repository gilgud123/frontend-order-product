export interface OrderDTO {
  id?: number;
  userId: number;
  productIds: number[];
  totalAmount?: number;
  status?: string; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  createdAt?: string;
  updatedAt?: string;
}
