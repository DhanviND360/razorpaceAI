import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getCustomerById, getCustomerPurchaseHistory } from '../../data/customers';

export const getCustomerProfile = tool(
  async (input) => {
    const customer = getCustomerById(input.customerId);
    if (!customer) {
      return JSON.stringify({ error: 'Customer not found', customerId: input.customerId });
    }
    return JSON.stringify({
      id: customer.id,
      name: customer.name,
      goal: customer.goal,
      preferences: customer.preferences,
      budgetRange: customer.budgetRange,
      tags: customer.tags,
      purchaseCount: customer.purchaseHistory.length,
    });
  },
  {
    name: 'get_customer_profile',
    description: 'Get customer profile including goals, preferences, budget range, and tags. Use to understand customer context for recommendations.',
    schema: z.object({
      customerId: z.string().describe('The customer ID (e.g., "customer-alex" or "alex")'),
    }),
  }
);

export const getPurchaseHistory = tool(
  async (input) => {
    const history = getCustomerPurchaseHistory(input.customerId);
    return JSON.stringify({
      customerId: input.customerId,
      totalPurchases: history.length,
      totalSpent: history.reduce((sum, p) => sum + p.price, 0),
      purchases: history,
      merchantsUsed: [...new Set(history.map(p => p.merchantId))],
      categoriesPurchased: [...new Set(history.map(p => p.productName))],
    });
  },
  {
    name: 'get_purchase_history',
    description: 'Get customer purchase history with products, merchants, and spending patterns. Useful for personalized recommendations.',
    schema: z.object({
      customerId: z.string().describe('The customer ID'),
    }),
  }
);
