import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  finishTransaction,
  getProducts,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';

const REMOVE_ADS_SKU = 'remove_ads';
const PURCHASE_KEY = '@realm_agent:ads_removed';

/**
 * Initializes the in-app purchase connection with the platform store.
 * Call once on app startup before any purchase operations.
 */
export async function initIAP(): Promise<void> {
  await initConnection();
}

/**
 * Returns true if the user has already purchased the remove ads upgrade.
 */
export async function checkPurchaseStatus(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PURCHASE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists the purchase completion status locally.
 */
async function savePurchaseStatus(): Promise<void> {
  await AsyncStorage.setItem(PURCHASE_KEY, 'true');
}

/**
 * Initiates the remove ads purchase flow.
 * Returns true if the purchase request was submitted successfully.
 * The actual purchase result is delivered via the purchase listener.
 */
export async function purchaseRemoveAds(): Promise<boolean> {
  try {
    const products = await getProducts({ skus: [REMOVE_ADS_SKU] });
    if (products.length === 0) {
      throw new Error('Product not found');
    }

    await requestPurchase({ sku: REMOVE_ADS_SKU });
    return true;
  } catch {
    return false;
  }
}

/**
 * Registers IAP purchase update and error listeners.
 * Call once on app startup after initIAP().
 */
export function setupPurchaseListeners(): void {
  purchaseUpdatedListener(async (purchase: Purchase) => {
    const receipt = purchase.transactionReceipt;
    if (receipt) {
      try {
        await savePurchaseStatus();
        await finishTransaction({ purchase });
      } catch {
        // Transaction already finished or in invalid state
      }
    }
  });

  // User cancelled or payment failed — no action needed
  purchaseErrorListener((_error: PurchaseError) => {});
}
