import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getMerchantById } from '../../data/merchants';
import { getCart } from '../../data/store';
import { validateCart, PolicyCheckResult } from '../../policy/engine';

export const checkBudget = tool(
  async (input) => {
    const withinBudget = input.cartTotal <= input.budget;
    const remaining = input.budget - input.cartTotal;
    
    return JSON.stringify({
      budget: input.budget,
      cartTotal: input.cartTotal,
      withinBudget,
      remaining: Math.max(0, remaining),
      overBy: withinBudget ? 0 : Math.abs(remaining),
      status: withinBudget ? 'WITHIN_BUDGET' : 'OVER_BUDGET',
      message: withinBudget
        ? `Cart ₹${input.cartTotal.toLocaleString('en-IN')} is within budget ₹${input.budget.toLocaleString('en-IN')} (₹${remaining.toLocaleString('en-IN')} remaining)`
        : `Cart ₹${input.cartTotal.toLocaleString('en-IN')} exceeds budget ₹${input.budget.toLocaleString('en-IN')} by ₹${Math.abs(remaining).toLocaleString('en-IN')}`,
    });
  },
  {
    name: 'check_budget',
    description: 'Check if a cart total is within the customer budget. Returns budget status and remaining amount.',
    schema: z.object({
      cartTotal: z.number().describe('Current cart total in INR'),
      budget: z.number().describe('Customer budget in INR'),
    }),
  }
);

export const getMerchantPolicy = tool(
  async (input) => {
    const merchant = getMerchantById(input.merchantId);
    if (!merchant) {
      return JSON.stringify({ error: 'Merchant not found', merchantId: input.merchantId });
    }
    return JSON.stringify({
      merchantId: merchant.id,
      merchantName: merchant.name,
      transactionReady: merchant.transactionReady,
      policies: merchant.policies,
      supportedPaymentMethods: merchant.supportedPaymentMethods,
    });
  },
  {
    name: 'get_merchant_policy',
    description: 'Get merchant policies including return window, shipping, discounts, min/max order values, and upsell/cross-sell configuration.',
    schema: z.object({
      merchantId: z.string().describe('The merchant ID'),
    }),
  }
);

export const runPolicyCheck = tool(
  async (input) => {
    const cart = getCart(input.sessionId, input.cartId);
    if (!cart) {
      return JSON.stringify({ error: 'Cart not found', cartId: input.cartId });
    }

    const merchant = getMerchantById(cart.merchantId);
    if (!merchant) {
      return JSON.stringify({ error: 'Merchant not found' });
    }

    const result: PolicyCheckResult = validateCart(cart, input.budget, merchant.policies);

    return JSON.stringify({
      cartId: input.cartId,
      cartTotal: cart.total,
      budget: input.budget,
      ...result,
    });
  },
  {
    name: 'run_policy_check',
    description: 'Run the deterministic policy engine against a cart. Validates budget, stock, price integrity, and merchant rules. Returns PASS, BLOCK, or REQUIRES_APPROVAL.',
    schema: z.object({
      sessionId: z.string().describe('Session ID'),
      cartId: z.string().describe('Cart ID to validate'),
      budget: z.number().describe('Customer budget in INR'),
    }),
  }
);
