import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductDetail } from '../entity/product_detail.entity';
import { Product } from '../entity/product.entity';
import { Transaction } from '../../transaction/entity/transaction.entity';
import { TransactionType } from '../../../common/enum/transaction_type.enum';
import { generateCode } from '../../../common/util/helper';

export interface StockAdjustResult {
  beginningStock: number;
  afterStock: number;
  isLowStock: boolean;
}

export interface LowStockWarning {
  productId: number;
  productCode: string;
  productName: string;
  afterStock: number;
  alertQuantity: number;
}

/**
 * StockService — centralized stock mutation and alert service.
 *
 * All methods require an EntityManager so they participate in the
 * caller's DataSource.transaction. This ensures that if any stock
 * update fails, the entire parent operation (invoice, return, etc.)
 * is rolled back atomically.
 */
@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  /**
   * Adjusts the stock of a product by the given quantity.
   *
   * - For OUT: validates sufficient stock first and throws BadRequestException
   *   if currentStock < quantity (only when manageStock = true).
   * - Persists a Transaction record inside the provided EntityManager.
   * - Calls checkLowStock after every OUT adjustment.
   *
   * @param manager    Active EntityManager (from DataSource.transaction callback)
   * @param productId  ID of the product to adjust
   * @param quantity   Quantity to adjust (always positive)
   * @param type       'IN' (add to stock) or 'OUT' (deduct from stock)
   * @param remarks    Description for the Transaction record
   * @param userId     Current user performing the operation
   * @param date       Optional date for the Transaction record (defaults to now)
   */
  async adjustStock(
    manager: EntityManager,
    productId: number,
    quantity: number,
    type: 'IN' | 'OUT',
    remarks: string,
    userId: number | null,
    date?: Date,
  ): Promise<StockAdjustResult> {
    // Load product + detail within the transaction
    const product = await manager.findOne(Product, {
      where: { id: productId },
      relations: ['detail'],
    });

    // Skip unmanaged or missing products gracefully
    if (!product || !product.manageStock || !product.detail) {
      return { beginningStock: 0, afterStock: 0, isLowStock: false };
    }

    const beginningStock = Number(product.detail.currentStock);
    const qty = Number(quantity);

    if (type === 'OUT') {
      if (beginningStock < qty) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}" (${product.code}). ` +
            `Available: ${beginningStock}, Required: ${qty}.`,
        );
      }
    }

    const afterStock =
      type === 'IN' ? beginningStock + qty : Math.max(0, beginningStock - qty);

    // Persist updated stock
    await manager.update(
      ProductDetail,
      { productId },
      { currentStock: afterStock, updatedBy: userId },
    );

    // Persist transaction log
    const trx = manager.create(Transaction, {
      transactionCode: generateCode('TRX'),
      transactionDate: date ?? new Date(),
      transactionType: type === 'IN' ? TransactionType.IN : TransactionType.OUT,
      productId,
      beginningStock,
      quantity: qty,
      afterStock,
      remarks,
      createdBy: userId,
      updatedBy: userId,
    });
    await manager.save(Transaction, trx);

    // Low-stock alert
    const isLowStock = this.checkLowStock(
      afterStock,
      Number(product.alertQuantity ?? 0),
      product.name,
      product.code,
      type,
    );

    return { beginningStock, afterStock, isLowStock };
  }

  /**
   * Lightweight read-only stock check (no writes).
   * Throws BadRequestException if currentStock < quantity.
   * Safe to call outside a transaction for early pre-flight validation.
   */
  async checkSufficientStock(
    manager: EntityManager,
    productId: number,
    quantity: number,
  ): Promise<void> {
    const detail = await manager.findOne(ProductDetail, {
      where: { productId },
    });

    if (!detail) return; // No detail record = stock not tracked

    const available = Number(detail.currentStock);
    const required = Number(quantity);

    if (available < required) {
      const product = await manager.findOne(Product, {
        where: { id: productId },
      });
      const label = product
        ? `"${product.name}" (${product.code})`
        : `#${productId}`;
      throw new BadRequestException(
        `Insufficient stock for product ${label}. Available: ${available}, Required: ${required}.`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Checks if afterStock has fallen to or below the product's alertQuantity.
   * Emits a Logger.warn() and returns true when triggered (OUT only).
   */
  private checkLowStock(
    afterStock: number,
    alertQuantity: number,
    productName: string,
    productCode: string,
    type: 'IN' | 'OUT',
  ): boolean {
    if (type !== 'OUT') return false;
    if (alertQuantity <= 0) return false;
    if (afterStock <= alertQuantity) {
      this.logger.warn(
        `LOW STOCK ALERT — Product: "${productName}" (${productCode}) | ` +
          `Current Stock: ${afterStock} | Alert Threshold: ${alertQuantity}`,
      );
      return true;
    }
    return false;
  }
}
