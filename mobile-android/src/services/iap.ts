import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getProducts,
  requestPurchase,
  finishTransaction,
  PurchaseError,
} from 'react-native-iap';

const REMOVE_ADS_SKU = 'remove_ads';
const PURCHASE_KEY = '@realm_agent:ads_removed';

/**
 * Inicializa a conexão com a loja
 */
export async function initIAP(): Promise<void> {
  try {
    await initConnection();
    console.log('IAP connection initialized');
  } catch (error) {
    console.error('Error initializing IAP:', error);
  }
}

/**
 * Verifica se o usuário já comprou a remoção de anúncios
 */
export async function checkPurchaseStatus(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PURCHASE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return false;
  }
}

/**
 * Marca a compra como concluída
 */
async function savePurchaseStatus(): Promise<void> {
  await AsyncStorage.setItem(PURCHASE_KEY, 'true');
}

/**
 * Compra a remoção de anúncios
 */
export async function purchaseRemoveAds(): Promise<boolean> {
  try {
    // Buscar produto
    const products = await getProducts({skus: [REMOVE_ADS_SKU]});
    if (products.length === 0) {
      throw new Error('Product not found');
    }

    // Solicitar compra
    await requestPurchase({sku: REMOVE_ADS_SKU});

    // O listener de compra irá processar o resultado
    return true;
  } catch (error) {
    console.error('Error purchasing remove ads:', error);
    return false;
  }
}

/**
 * Configura listeners para atualizações de compra
 */
export function setupPurchaseListeners(): void {
  // Listener para compras bem-sucedidas
  purchaseUpdatedListener(async purchase => {
    const receipt = purchase.transactionReceipt;
    if (receipt) {
      try {
        // Salvar status da compra
        await savePurchaseStatus();
        console.log('Purchase successful:', purchase);

        // Finalizar transação
        await finishTransaction({purchase});
      } catch (error) {
        console.error('Error finishing transaction:', error);
      }
    }
  });

  // Listener para erros de compra
  purchaseErrorListener((error: PurchaseError) => {
    console.error('Purchase error:', error);
  });
}
