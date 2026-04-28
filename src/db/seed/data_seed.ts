import { DataSource } from 'typeorm';
import { Category } from '../../modules/category/entity/category.entity';
import { Brand } from '../../modules/brand/entity/brand.entity';
import { Unit } from '../../modules/unit/entity/unit.entity';
import { Currency } from '../../modules/currency/entity/currency.entity';
import { Supplier } from '../../modules/supplier/entity/supplier.entity';
import { Customer } from '../../modules/customer/entity/customer.entity';
import { Discount } from '../../modules/discount/entity/discount.entity';
import { Product } from '../../modules/product/entity/product.entity';
import { ProductDetail } from '../../modules/product/entity/product_detail.entity';
import { PurchaseInvoice } from '../../modules/purchase_invoice/entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from '../../modules/purchase_invoice/entity/purchase_invoice_detail.entity';
import { SaleInvoice } from '../../modules/sale_invoice/entity/sale_invoice.entity';
import { SaleInvoiceDetail } from '../../modules/sale_invoice/entity/sale_invoice_detail.entity';
import { Transaction } from '../../modules/transaction/entity/transaction.entity';
import { SaleOrder } from '../../modules/sale_order/entity/sale_order.entity';
import { SaleOrderDetail } from '../../modules/sale_order/entity/sale_order_detail.entity';
import { CustomerType } from '../../common/enum/customer_type.enum';
import { InvoiceStatus } from '../../common/enum/invoice_status.enum';
import { PaymentMethod } from '../../common/enum/payment_method.enum';
import { OrderStatus } from '../../common/enum/order_status.enum';
import { TransactionType } from '../../common/enum/transaction_type.enum';

// ============================================================
// Helper: upsert by unique field (skip if already exists)
// Checks multiple fields to avoid duplicate key violations
// ============================================================
async function upsertByField<T extends { id?: number }>(
  repo: any,
  fields: string[],
  data: Record<string, any>,
): Promise<T> {
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      const existing = await repo.findOne({ where: { [field]: data[field] } });
      if (existing) {
        // Update existing record with new data
        Object.assign(existing, data);
        return repo.save(existing);
      }
    }
  }
  return repo.save(repo.create(data));
}

// ============================================================
// Helper: Clear business data tables
// ============================================================
async function clearData(dataSource: DataSource) {
  console.log('  🗑️  Clearing existing business data...');
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  
  // Disable foreign key checks for clean truncation (PostgreSQL/MySQL/MariaDB)
  const driverType = dataSource.options.type;
  if (driverType === 'postgres') {
    await queryRunner.query('SET CONSTRAINTS ALL DEFERRED');
  } else if (driverType === 'mysql' || driverType === 'mariadb') {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  }

  try {
    // Truncate tables in reverse order of dependencies
    const tables = [
      'transactions',
      'sale_invoice_details',
      'sale_invoices',
      'purchase_invoice_details',
      'purchase_invoices',
      'product_details',
      'products',
      'discounts',
      'customers',
      'suppliers',
      'currencies',
      'units',
      'brands',
      'categories',
    ];

    for (const table of tables) {
      if (driverType === 'postgres') {
        await queryRunner.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
      } else {
        await queryRunner.query(`TRUNCATE TABLE ${table}`);
      }
    }
  } finally {
    if (driverType === 'mysql' || driverType === 'mariadb') {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    await queryRunner.release();
  }
}

// ============================================================
// 1. SEED CATEGORIES
// ============================================================
const seedCategories = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Category);

  const categories = [
    { code: 'CAT-001', name: 'Beverages',      slug: 'beverages',      description: 'All types of drinks and beverages',       status: true },
    { code: 'CAT-002', name: 'Snacks',          slug: 'snacks',         description: 'Chips, crackers and light snacks',         status: true },
    { code: 'CAT-003', name: 'Dairy Products',  slug: 'dairy-products', description: 'Milk, cheese, yogurt and related items',    status: true },
    { code: 'CAT-004', name: 'Fresh Produce',   slug: 'fresh-produce',  description: 'Fresh fruits and vegetables',              status: true },
    { code: 'CAT-005', name: 'Bakery',          slug: 'bakery',         description: 'Bread, pastries and baked goods',           status: true },
    { code: 'CAT-006', name: 'Frozen Foods',    slug: 'frozen-foods',   description: 'Frozen meals, ice cream and frozen items',  status: true },
    { code: 'CAT-007', name: 'Household',       slug: 'household',      description: 'Cleaning supplies and household essentials', status: true },
    { code: 'CAT-008', name: 'Personal Care',   slug: 'personal-care',  description: 'Soaps, shampoo and hygiene products',       status: true },
  ];

  const savedCategories: Category[] = [];
  for (const c of categories) {
    savedCategories.push(await upsertByField<Category>(repo, ['code', 'name', 'slug'], c));
  }

  console.log(`  ✅ ${savedCategories.length} Categories seeded`);
  return savedCategories;
};

// ============================================================
// 2. SEED BRANDS
// ============================================================
const seedBrands = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Brand);

  const brands = [
    { code: 'BRD-001', name: 'Coca-Cola',    slug: 'coca-cola',    description: 'The Coca-Cola Company',         status: true },
    { code: 'BRD-002', name: 'PepsiCo',      slug: 'pepsico',      description: 'PepsiCo Inc.',                  status: true },
    { code: 'BRD-003', name: 'Nestlé',        slug: 'nestle',       description: 'Nestlé S.A.',                   status: true },
    { code: 'BRD-004', name: 'Unilever',      slug: 'unilever',     description: 'Unilever PLC',                  status: true },
    { code: 'BRD-005', name: 'P&G',           slug: 'p-and-g',      description: 'Procter & Gamble',              status: true },
    { code: 'BRD-006', name: 'Lay\'s',        slug: 'lays',         description: 'Frito-Lay snack brand',         status: true },
    { code: 'BRD-007', name: 'Oreo',          slug: 'oreo',         description: 'Mondelēz International',        status: true },
    { code: 'BRD-008', name: 'Anchor',        slug: 'anchor',       description: 'Fonterra dairy brand',          status: true },
  ];

  const savedBrands: Brand[] = [];
  for (const b of brands) {
    savedBrands.push(await upsertByField<Brand>(repo, ['code', 'name', 'slug'], b));
  }

  console.log(`  ✅ ${savedBrands.length} Brands seeded`);
  return savedBrands;
};

// ============================================================
// 3. SEED UNITS
// ============================================================
const seedUnits = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Unit);

  const units = [
    { code: 'UNT-001', name: 'Piece',     slug: 'piece',     symbol: 'pcs', conversionFactor: 1,     defaultPrice: 0, status: true },
    { code: 'UNT-002', name: 'Box',       slug: 'box',       symbol: 'box', conversionFactor: 12,    defaultPrice: 0, status: true },
    { code: 'UNT-003', name: 'Carton',    slug: 'carton',    symbol: 'ctn', conversionFactor: 24,    defaultPrice: 0, status: true },
    { code: 'UNT-004', name: 'Kilogram',  slug: 'kilogram',  symbol: 'kg',  conversionFactor: 1,     defaultPrice: 0, status: true },
    { code: 'UNT-005', name: 'Liter',     slug: 'liter',     symbol: 'L',   conversionFactor: 1,     defaultPrice: 0, status: true },
    { code: 'UNT-006', name: 'Pack',      slug: 'pack',      symbol: 'pk',  conversionFactor: 6,     defaultPrice: 0, status: true },
    { code: 'UNT-007', name: 'Dozen',     slug: 'dozen',     symbol: 'dz',  conversionFactor: 12,    defaultPrice: 0, status: true },
    { code: 'UNT-008', name: 'Bottle',    slug: 'bottle',    symbol: 'btl', conversionFactor: 1,     defaultPrice: 0, status: true },
  ];

  const savedUnits: Unit[] = [];
  for (const u of units) {
    savedUnits.push(await upsertByField<Unit>(repo, ['code', 'name', 'slug'], u));
  }

  console.log(`  ✅ ${savedUnits.length} Units seeded`);
  return savedUnits;
};

// ============================================================
// 4. SEED CURRENCIES
// ============================================================
const seedCurrencies = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Currency);

  const currencies = [
    { code: 'USD', country: 'United States', currency: 'US Dollar',        symbol: '$',  thousandSeparator: ',', decimalSeparator: '.', exchangeRate: 1, isDefault: true, status: true },
    { code: 'KHR', country: 'Cambodia',      currency: 'Cambodian Riel',   symbol: '៛', thousandSeparator: ',', decimalSeparator: '.', exchangeRate: 4100, isDefault: false, status: true },
  ];

  const savedCurrencies: Currency[] = [];
  for (const c of currencies) {
    savedCurrencies.push(await upsertByField<Currency>(repo, ['code'], c));
  }

  console.log(`  ✅ ${savedCurrencies.length} Currencies seeded`);
  return savedCurrencies;
};

// ============================================================
// 5. SEED SUPPLIERS
// ============================================================
const seedSuppliers = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Supplier);

  const suppliers = [
    { code: 'SUP-001', name: 'Fresh Goods Co.',       nameLatin: 'Fresh Goods Co.',       email: 'info@freshgoods.com',      phoneNumber: '012-345-678', address: 'Phnom Penh, Cambodia',     type: CustomerType.DINE_IN, status: true },
    { code: 'SUP-002', name: 'Beverage World Ltd.',    nameLatin: 'Beverage World Ltd.',   email: 'sales@bevworld.com',       phoneNumber: '098-765-432', address: 'Siem Reap, Cambodia',      type: CustomerType.DINE_IN, status: true },
    { code: 'SUP-003', name: 'Dairy Farm Supply',      nameLatin: 'Dairy Farm Supply',     email: 'orders@dairyfarm.com',     phoneNumber: '011-222-333', address: 'Bangkok, Thailand',         type: CustomerType.DINE_IN, status: true },
    { code: 'SUP-004', name: 'Home Essentials Inc.',   nameLatin: 'Home Essentials Inc.',  email: 'contact@homeess.com',      phoneNumber: '077-888-999', address: 'Ho Chi Minh, Vietnam',     type: CustomerType.DINE_IN, status: true },
    { code: 'SUP-005', name: 'Snack Masters Corp.',    nameLatin: 'Snack Masters Corp.',   email: 'wholesale@snackmasters.com', phoneNumber: '015-111-222', address: 'Battambang, Cambodia', type: CustomerType.DINE_IN, status: true },
  ];

  const savedSuppliers: Supplier[] = [];
  for (const s of suppliers) {
    savedSuppliers.push(await upsertByField<Supplier>(repo, ['code', 'name'], s));
  }

  console.log(`  ✅ ${savedSuppliers.length} Suppliers seeded`);
  return savedSuppliers;
};

// ============================================================
// 6. SEED CUSTOMERS
// ============================================================
const seedCustomers = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Customer);

  const customers = [
    { code: 'CUS-001', name: 'Dine In',                nameLatin: 'Dine In',               type: CustomerType.DINE_IN,  status: true },
    { code: 'CUS-002', name: 'Dine Out',               nameLatin: 'Dine Out',              type: CustomerType.DINE_OUT, status: true },
    { code: 'CUS-003', name: 'Sokha Market',            nameLatin: 'Sokha Market',          email: 'sokha@market.com',    phoneNumber: '012-111-222', address: 'Phnom Penh',  type: CustomerType.DINE_OUT, status: true },
    { code: 'CUS-004', name: 'Lucky Minimart',          nameLatin: 'Lucky Minimart',        email: 'lucky@minimart.com',  phoneNumber: '098-333-444', address: 'Siem Reap',   type: CustomerType.DINE_OUT, status: true },
    { code: 'CUS-005', name: 'Mekong Grocery',          nameLatin: 'Mekong Grocery',        email: 'mekong@grocery.com',  phoneNumber: '077-555-666', address: 'Kampot',      type: CustomerType.DINE_OUT, status: true },
  ];

  const savedCustomers: Customer[] = [];
  for (const c of customers) {
    savedCustomers.push(await upsertByField<Customer>(repo, ['code', 'name'], c));
  }

  console.log(`  ✅ ${savedCustomers.length} Customers seeded`);
  return savedCustomers;
};

// ============================================================
// 7. SEED DISCOUNTS
// ============================================================
const seedDiscounts = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Discount);

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  const discounts = [
    { code: 'DISC-001', discountType: 'percentage', discountAmount: 5,     discountStartDate: now, discountEndDate: nextMonth,   status: true },
    { code: 'DISC-002', discountType: 'percentage', discountAmount: 10,    discountStartDate: now, discountEndDate: nextQuarter,  status: true },
    { code: 'DISC-003', discountType: 'fixed',      discountAmount: 2.00,  discountStartDate: now, discountEndDate: nextMonth,   status: true },
    { code: 'DISC-004', discountType: 'percentage', discountAmount: 15,    discountStartDate: now, discountEndDate: nextQuarter,  status: true },
    { code: 'DISC-005', discountType: 'fixed',      discountAmount: 5.00,  discountStartDate: now, discountEndDate: nextMonth,   status: true },
  ];

  const savedDiscounts: Discount[] = [];
  for (const d of discounts) {
    savedDiscounts.push(await upsertByField<Discount>(repo, ['code'], d));
  }

  console.log(`  ✅ ${savedDiscounts.length} Discounts seeded`);
  return savedDiscounts;
};

// ============================================================
// 8. SEED PRODUCTS + PRODUCT DETAILS
// ============================================================
const seedProducts = async (
  dataSource: DataSource,
  categories: Category[],
  brands: Brand[],
  units: Unit[],
) => {
  const productRepo = dataSource.getRepository(Product);
  const detailRepo = dataSource.getRepository(ProductDetail);

  // Map categories/brands/units by code for easy reference
  const cat = (code: string) => categories.find((c) => c.code === code)!;
  const brd = (code: string) => brands.find((b) => b.code === code)!;
  const unt = (code: string) => units.find((u) => u.code === code)!;

  const productsData = [
    // ── Beverages ──
    { code: 'PRD-001', name: 'Coca-Cola 330ml',       categoryId: cat('CAT-001').id, brandId: brd('BRD-001').id, unitId: unt('UNT-001').id, skuCode: 'SKU-CC330',  alertQuantity: 20, purchasePrice: 0.35, salePrice: 0.50, currentStock: 0, manageStock: true },
    { code: 'PRD-002', name: 'Pepsi 500ml',            categoryId: cat('CAT-001').id, brandId: brd('BRD-002').id, unitId: unt('UNT-008').id, skuCode: 'SKU-PP500',  alertQuantity: 20, purchasePrice: 0.40, salePrice: 0.60, currentStock: 0, manageStock: true },
    { code: 'PRD-003', name: 'Nestlé Water 1.5L',      categoryId: cat('CAT-001').id, brandId: brd('BRD-003').id, unitId: unt('UNT-008').id, skuCode: 'SKU-NW15',   alertQuantity: 30, purchasePrice: 0.25, salePrice: 0.40, currentStock: 0, manageStock: true },

    // ── Snacks ──
    { code: 'PRD-004', name: 'Lay\'s Classic Chips',   categoryId: cat('CAT-002').id, brandId: brd('BRD-006').id, unitId: unt('UNT-006').id, skuCode: 'SKU-LAYS01', alertQuantity: 15, purchasePrice: 1.20, salePrice: 1.80, currentStock: 0, manageStock: true },
    { code: 'PRD-005', name: 'Oreo Original',          categoryId: cat('CAT-002').id, brandId: brd('BRD-007').id, unitId: unt('UNT-006').id, skuCode: 'SKU-OREO01', alertQuantity: 15, purchasePrice: 1.50, salePrice: 2.20, currentStock: 0,  manageStock: true },

    // ── Products for Stock Workflow ──
    { code: 'PRD-LSTK', name: 'Sugar (Low Stock)', categoryId: cat('CAT-001').id, brandId: brd('BRD-003').id, unitId: unt('UNT-001').id, skuCode: 'SKU-LSTK', alertQuantity: 10, purchasePrice: 1.00, salePrice: 2.00, currentStock: 0, manageStock: true },
    { code: 'PRD-OSTK', name: 'Salt (Out of Stock)',   categoryId: cat('CAT-001').id, brandId: brd('BRD-003').id, unitId: unt('UNT-001').id, skuCode: 'SKU-OSTK', alertQuantity: 5,  purchasePrice: 1.00, salePrice: 2.00, currentStock: 0, manageStock: true },
    { code: 'PRD-NMSTK', name: 'Service Item (No Stock)', categoryId: cat('CAT-001').id, brandId: brd('BRD-003').id, unitId: unt('UNT-001').id, skuCode: 'SKU-NMSTK', alertQuantity: 0,  purchasePrice: 1.00, salePrice: 2.00, currentStock: 0, manageStock: false },

    // ── Dairy ──
    { code: 'PRD-006', name: 'Anchor Full Cream Milk',  categoryId: cat('CAT-003').id, brandId: brd('BRD-008').id, unitId: unt('UNT-005').id, skuCode: 'SKU-ANC01',  alertQuantity: 10, purchasePrice: 2.50, salePrice: 3.50, currentStock: 0,  manageStock: true },
    { code: 'PRD-007', name: 'Nestlé Yogurt Cup',       categoryId: cat('CAT-003').id, brandId: brd('BRD-003').id, unitId: unt('UNT-001').id, skuCode: 'SKU-NYG01',  alertQuantity: 20, purchasePrice: 0.80, salePrice: 1.20, currentStock: 0, manageStock: true },

    // ── Fresh Produce ──
    { code: 'PRD-008', name: 'Fresh Banana (1kg)',      categoryId: cat('CAT-004').id, brandId: undefined,          unitId: unt('UNT-004').id, skuCode: 'SKU-BAN01',  alertQuantity: 10, purchasePrice: 0.80, salePrice: 1.20, currentStock: 0,  manageStock: true },
    { code: 'PRD-009', name: 'Green Lettuce',           categoryId: cat('CAT-004').id, brandId: undefined,          unitId: unt('UNT-004').id, skuCode: 'SKU-LET01',  alertQuantity: 10, purchasePrice: 0.50, salePrice: 0.90, currentStock: 0,  manageStock: true },

    // ── Bakery ──
    { code: 'PRD-010', name: 'White Bread Loaf',        categoryId: cat('CAT-005').id, brandId: undefined,          unitId: unt('UNT-001').id, skuCode: 'SKU-BRD01',  alertQuantity: 10, purchasePrice: 1.00, salePrice: 1.50, currentStock: 0,  manageStock: true },

    // ── Frozen ──
    { code: 'PRD-011', name: 'Frozen Pizza Margherita',  categoryId: cat('CAT-006').id, brandId: brd('BRD-003').id, unitId: unt('UNT-001').id, skuCode: 'SKU-FPZ01',  alertQuantity: 8,  purchasePrice: 3.00, salePrice: 4.50, currentStock: 0,  manageStock: true },

    // ── Household ──
    { code: 'PRD-012', name: 'Dishwashing Liquid 750ml', categoryId: cat('CAT-007').id, brandId: brd('BRD-004').id, unitId: unt('UNT-008').id, skuCode: 'SKU-DWL01',  alertQuantity: 10, purchasePrice: 1.80, salePrice: 2.80, currentStock: 0,  manageStock: true },

    // ── Personal Care ──
    { code: 'PRD-013', name: 'Dove Soap Bar',            categoryId: cat('CAT-008').id, brandId: brd('BRD-004').id, unitId: unt('UNT-001').id, skuCode: 'SKU-DVS01',  alertQuantity: 15, purchasePrice: 0.90, salePrice: 1.40, currentStock: 0,  manageStock: true },
    { code: 'PRD-014', name: 'Head & Shoulders 400ml',   categoryId: cat('CAT-008').id, brandId: brd('BRD-005').id, unitId: unt('UNT-008').id, skuCode: 'SKU-HS401',  alertQuantity: 10, purchasePrice: 4.00, salePrice: 5.50, currentStock: 0,  manageStock: true },
    { code: 'PRD-015', name: 'Colgate Toothpaste 150g',  categoryId: cat('CAT-008').id, brandId: undefined,          unitId: unt('UNT-001').id, skuCode: 'SKU-CLG01',  alertQuantity: 15, purchasePrice: 1.20, salePrice: 1.80, currentStock: 0, manageStock: true },
  ];

  const savedProducts: Product[] = [];

  for (const p of productsData) {
    // Separate detail-specific fields
    const { purchasePrice, salePrice, currentStock, ...productFields } = p;

    // Upsert the product
    let product = await productRepo.findOne({ where: { code: p.code } });
    if (!product) {
      product = await productRepo.save(productRepo.create(productFields) as Product);
    } else {
      // Update existing product with potentially new fields like alertQuantity, manageStock
      Object.assign(product, productFields);
      product = await productRepo.save(product);
    }
    savedProducts.push(product);

    // Upsert the product detail
    let detail = await detailRepo.findOne({ where: { productId: product.id } });
    if (!detail) {
      await detailRepo.save(
        detailRepo.create({
          productId: product.id,
          purchasePrice,
          salePrice,
          currentStock,
        }),
      );
    } else {
      // Update existing detail
      detail.purchasePrice = purchasePrice;
      detail.salePrice = salePrice;
      detail.currentStock = currentStock;
      await detailRepo.save(detail);
    }
  }

  console.log(`  ✅ ${savedProducts.length} Products (with details) seeded`);
  return savedProducts;
};

// ============================================================
// 9. SEED SALE ORDERS
// ============================================================
const seedSaleOrders = async (
  dataSource: DataSource,
  customers: Customer[],
  products: Product[],
) => {
  const orderRepo = dataSource.getRepository(SaleOrder);
  const detailRepo = dataSource.getRepository(SaleOrderDetail);

  const ordersData = [
    {
      code: 'SO-2026-001',
      customerId: customers[3].id, // Lucky Minimart
      orderDate: new Date('2026-04-14'),
      status: OrderStatus.PENDING,
      description: 'Monthly replenishment order',
      items: [
        { productCode: 'PRD-013', quantity: 10, priceEach: 1.40 },
        { productCode: 'PRD-014', quantity: 5,  priceEach: 5.50 },
        { productCode: 'PRD-012', quantity: 8,  priceEach: 2.80 },
      ],
    },
  ];

  const productMap = new Map(products.map((p) => [p.code, p]));
  const savedOrders: SaleOrder[] = [];

  for (const ord of ordersData) {
    let totalPrice = 0;
    const detailsToCreate: Partial<SaleOrderDetail>[] = [];

    for (const item of ord.items) {
      const product = productMap.get(item.productCode);
      if (!product) continue;
      const lineTotal = item.quantity * item.priceEach;
      totalPrice += lineTotal;
      detailsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    const savedOrder = await orderRepo.save(
      orderRepo.create({
        code: ord.code,
        customerId: ord.customerId,
        orderDate: ord.orderDate,
        status: ord.status,
        description: ord.description,
        totalLine: detailsToCreate.length,
        totalPrice,
      }),
    );

    for (const d of detailsToCreate) {
      const orderDetail = await detailRepo.save(
        detailRepo.create({ ...d, saleOrderId: savedOrder.id }),
      );
      // Attach details back for linking to invoices later if needed
      if (!savedOrder.details) savedOrder.details = [];
      savedOrder.details.push(orderDetail);
    }
    savedOrders.push(savedOrder);
  }

  console.log(`  ✅ ${savedOrders.length} Sale Orders seeded`);
  return savedOrders;
};

// ============================================================
// 10. SEED PURCHASE INVOICES
// ============================================================
const seedPurchaseInvoices = async (
  dataSource: DataSource,
  suppliers: Supplier[],
  products: Product[],
) => {
  const invoiceRepo = dataSource.getRepository(PurchaseInvoice);
  const detailRepo = dataSource.getRepository(PurchaseInvoiceDetail);
  const productDetailRepo = dataSource.getRepository(ProductDetail);

  const invoicesData = [
    {
      code: 'PI-2026-001',
      supplierId: suppliers[0].id,
      invoiceDate: new Date('2026-04-01'),
      status: InvoiceStatus.COMPLETED,
      paymentMethod: PaymentMethod.CASH,
      description: 'April stock replenishment – beverages',
      items: [
        { productCode: 'PRD-001', quantity: 50, priceEach: 0.35 },
        { productCode: 'PRD-002', quantity: 40, priceEach: 0.40 },
        { productCode: 'PRD-003', quantity: 60, priceEach: 0.25 },
      ],
    },
    {
      code: 'PI-2026-002',
      supplierId: suppliers[1].id,
      invoiceDate: new Date('2026-04-05'),
      status: InvoiceStatus.COMPLETED,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      description: 'Snacks & dairy restock',
      items: [
        { productCode: 'PRD-004', quantity: 30, priceEach: 1.20 },
        { productCode: 'PRD-005', quantity: 25, priceEach: 1.50 },
        { productCode: 'PRD-006', quantity: 20, priceEach: 2.50 },
      ],
    },
    {
      code: 'PI-2026-003',
      supplierId: suppliers[2].id,
      invoiceDate: new Date('2026-04-10'),
      status: InvoiceStatus.CONFIRMED,
      paymentMethod: PaymentMethod.CREDIT,
      description: 'Household & personal care order',
      items: [
        { productCode: 'PRD-012', quantity: 25, priceEach: 1.80 },
        { productCode: 'PRD-013', quantity: 40, priceEach: 0.90 },
        { productCode: 'PRD-014', quantity: 15, priceEach: 4.00 },
      ],
    },
  ];

  const productMap = new Map(products.map((p) => [p.code, p]));

  for (const inv of invoicesData) {
    let existing = await invoiceRepo.findOne({ where: { code: inv.code } });
    if (existing) continue;

    let totalPrice = 0;
    const detailsToCreate: Partial<PurchaseInvoiceDetail>[] = [];

    for (const item of inv.items) {
      const product = productMap.get(item.productCode);
      if (!product) continue;
      const lineTotal = item.quantity * item.priceEach;
      totalPrice += lineTotal;
      detailsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    const savedInvoice = await invoiceRepo.save(
      invoiceRepo.create({
        code: inv.code,
        supplierId: inv.supplierId,
        invoiceDate: inv.invoiceDate,
        status: inv.status,
        paymentMethod: inv.paymentMethod,
        description: inv.description,
        totalLine: detailsToCreate.length,
        totalPrice,
        paidAmount: inv.status === InvoiceStatus.COMPLETED ? totalPrice : 0,
      }),
    );

    for (const d of detailsToCreate) {
      await detailRepo.save(
        detailRepo.create({ ...d, purchaseInvoiceId: savedInvoice.id }),
      );
    }
  }

  console.log(`  ✅ ${invoicesData.length} Purchase Invoices seeded`);
};

// ============================================================
// 10. SEED SALE INVOICES
// ============================================================
const seedSaleInvoices = async (
  dataSource: DataSource,
  customers: Customer[],
  products: Product[],
  saleOrders: SaleOrder[],
) => {
  const invoiceRepo = dataSource.getRepository(SaleInvoice);
  const detailRepo = dataSource.getRepository(SaleInvoiceDetail);

  const invoicesData = [
    {
      code: 'SI-2026-001',
      customerId: customers[0].id, // Dine In
      invoiceDate: new Date('2026-04-02'),
      status: InvoiceStatus.COMPLETED,
      paymentMethod: PaymentMethod.CASH,
      description: 'Walk-in customer purchase',
      items: [
        { productCode: 'PRD-001', quantity: 5, priceEach: 0.50 },
        { productCode: 'PRD-004', quantity: 2, priceEach: 1.80 },
        { productCode: 'PRD-010', quantity: 1, priceEach: 1.50 },
      ],
    },
    {
      code: 'SI-2026-002',
      customerId: customers[1].id, // Dine Out
      invoiceDate: new Date('2026-04-03'),
      status: InvoiceStatus.COMPLETED,
      paymentMethod: PaymentMethod.CASH,
      description: 'Takeaway order – beverages & snacks',
      items: [
        { productCode: 'PRD-002', quantity: 10, priceEach: 0.60 },
        { productCode: 'PRD-005', quantity: 3,  priceEach: 2.20 },
      ],
    },
    {
      code: 'SI-2026-003',
      customerId: customers[2].id, // Sokha Market
      invoiceDate: new Date('2026-04-08'),
      status: InvoiceStatus.COMPLETED,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      description: 'Wholesale to Sokha Market',
      items: [
        { productCode: 'PRD-001', quantity: 50, priceEach: 0.45 },
        { productCode: 'PRD-003', quantity: 30, priceEach: 0.35 },
        { productCode: 'PRD-007', quantity: 20, priceEach: 1.10 },
        { productCode: 'PRD-015', quantity: 15, priceEach: 1.60 },
      ],
    },
    {
      code: 'SI-2026-004',
      customerId: customers[3].id, // Lucky Minimart
      saleOrderCode: 'SO-2026-001', // Link to order
      invoiceDate: new Date('2026-04-15'),
      status: InvoiceStatus.CONFIRMED,
      paymentMethod: PaymentMethod.CREDIT,
      description: 'Pending payment – personal care',
      items: [
        { productCode: 'PRD-013', quantity: 10, priceEach: 1.40 },
        { productCode: 'PRD-014', quantity: 5,  priceEach: 5.50 },
        { productCode: 'PRD-012', quantity: 8,  priceEach: 2.80 },
      ],
    },
  ];

  const productMap = new Map(products.map((p) => [p.code, p]));
  const orderMap = new Map(saleOrders.map((o) => [o.code, o]));

  for (const inv of invoicesData) {
    let existing = await invoiceRepo.findOne({ where: { code: inv.code } });
    if (existing) continue;

    let totalPrice = 0;
    const detailsToCreate: any[] = [];
    const linkedOrder = inv.saleOrderCode ? orderMap.get(inv.saleOrderCode) : null;

    for (const item of inv.items) {
      const product = productMap.get(item.productCode);
      if (!product) continue;
      const lineTotal = item.quantity * item.priceEach;
      totalPrice += lineTotal;

      // Find matching order detail if linked
      let saleOrderDetailId: number | null = null;
      if (linkedOrder) {
        const matchingLine = linkedOrder.details?.find(d => d.productId === product.id);
        saleOrderDetailId = matchingLine?.id || null;
      }

      detailsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        totalPrice: lineTotal,
        saleOrderId: linkedOrder?.id || null,
        saleOrderDetailId: saleOrderDetailId,
      });
    }

    const savedInvoice = await invoiceRepo.save(
      invoiceRepo.create({
        code: inv.code,
        customerId: inv.customerId,
        invoiceDate: inv.invoiceDate,
        status: inv.status,
        paymentMethod: inv.paymentMethod,
        description: inv.description,
        totalLine: detailsToCreate.length,
        totalPrice,
        paidAmount: inv.status === InvoiceStatus.COMPLETED ? totalPrice : 0,
      }),
    );

    for (const d of detailsToCreate) {
      await detailRepo.save(
        detailRepo.create({ ...d, saleInvoiceId: savedInvoice.id }),
      );
    }
  }

  console.log(`  ✅ ${invoicesData.length} Sale Invoices seeded`);
};

// ============================================================
// 11. SEED TRANSACTIONS (Stock Movement History)
// ============================================================
const seedTransactions = async (
  dataSource: DataSource,
  products: Product[],
) => {
  const repo = dataSource.getRepository(Transaction);
  const detailRepo = dataSource.getRepository(ProductDetail);

  const transactionsData = [
    // --- STEP 1: INITIAL PURCHASES (Stock IN) ---
    { transactionCode: 'TXN-001', productCode: 'PRD-001', transactionType: TransactionType.IN,  quantity: 200, remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-002', productCode: 'PRD-002', transactionType: TransactionType.IN,  quantity: 150, remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-003', productCode: 'PRD-003', transactionType: TransactionType.IN,  quantity: 300, remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-004', productCode: 'PRD-004', transactionType: TransactionType.IN,  quantity: 100, remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-005', productCode: 'PRD-005', transactionType: TransactionType.IN,  quantity: 80,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-006', productCode: 'PRD-006', transactionType: TransactionType.IN,  quantity: 60,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-007', productCode: 'PRD-007', transactionType: TransactionType.IN,  quantity: 120, remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-008', productCode: 'PRD-008', transactionType: TransactionType.IN,  quantity: 50,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-009', productCode: 'PRD-009', transactionType: TransactionType.IN,  quantity: 40,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-010', productCode: 'PRD-010', transactionType: TransactionType.IN,  quantity: 45,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-011', productCode: 'PRD-011', transactionType: TransactionType.IN,  quantity: 30,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-012', productCode: 'PRD-012', transactionType: TransactionType.IN,  quantity: 70,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-013', productCode: 'PRD-013', transactionType: TransactionType.IN,  quantity: 90,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-014', productCode: 'PRD-014', transactionType: TransactionType.IN,  quantity: 55,  remarks: 'Opening stock purchase' },
    { transactionCode: 'TXN-015', productCode: 'PRD-015', transactionType: TransactionType.IN,  quantity: 110, remarks: 'Opening stock purchase' },

    // --- STEP 2: SALES (Stock OUT) ---
    { transactionCode: 'TXN-OUT-01', productCode: 'PRD-001', transactionType: TransactionType.OUT, quantity: 5,   remarks: 'Sale SI-2026-001' },
    { transactionCode: 'TXN-OUT-02', productCode: 'PRD-004', transactionType: TransactionType.OUT, quantity: 2,   remarks: 'Sale SI-2026-001' },
    { transactionCode: 'TXN-OUT-03', productCode: 'PRD-001', transactionType: TransactionType.OUT, quantity: 50,  remarks: 'Sale SI-2026-003 (wholesale)' },
    { transactionCode: 'TXN-OUT-04', productCode: 'PRD-003', transactionType: TransactionType.OUT, quantity: 30,  remarks: 'Sale SI-2026-003 (wholesale)' },

    // --- STEP 3: STOCK VARIATIONS ---
    { transactionCode: 'TXN-LSTK-01', productCode: 'PRD-LSTK', transactionType: TransactionType.IN, quantity: 10, remarks: 'Initial stock' },
    { transactionCode: 'TXN-LSTK-02', productCode: 'PRD-LSTK', transactionType: TransactionType.OUT, quantity: 5,  remarks: 'Stock depletion (triggering alert)' },
    { transactionCode: 'TXN-OSTK-01', productCode: 'PRD-OSTK', transactionType: TransactionType.IN, quantity: 5,  remarks: 'Initial stock' },
    { transactionCode: 'TXN-OSTK-02', productCode: 'PRD-OSTK', transactionType: TransactionType.OUT, quantity: 5, remarks: 'Cleared stock' },

    // --- STEP 4: ADJUSTMENTS ---
    { transactionCode: 'TXN-ADJ-01', productCode: 'PRD-010', transactionType: TransactionType.ADJUSTMENT, quantity: -3, remarks: 'Damaged goods write-off' },
  ];

  const productMap = new Map(products.map((p) => [p.code, p]));
  let seededCount = 0;

  for (const t of transactionsData) {
    const existing = await repo.findOne({ where: { transactionCode: t.transactionCode } });
    if (existing) continue;

    const product = productMap.get(t.productCode);
    if (!product) continue;

    // 1. Get current stock from product_details (REAL TIME)
    const detail = await detailRepo.findOne({ where: { productId: product.id } });
    const beginningStock = detail ? Number(detail.currentStock) : 0;
    
    // 2. Calculate delta
    const qty = t.transactionType === TransactionType.OUT ? Math.abs(t.quantity) : t.quantity;
    const delta = t.transactionType === TransactionType.IN 
                ? qty 
                : t.transactionType === TransactionType.OUT 
                  ? -qty 
                  : t.quantity; // ADJUSTMENT
                  
    const afterStock = beginningStock + delta;

    // 3. Save Transaction record
    await repo.save(
      repo.create({
        transactionCode: t.transactionCode,
        transactionDate: new Date(),
        transactionType: t.transactionType,
        productId: product.id,
        beginningStock,
        quantity: qty,
        afterStock,
        remarks: t.remarks,
      }),
    );

    // 4. CRITICAL: Update the actual ProductDetail stock level
    if (detail) {
      detail.currentStock = afterStock;
      await detailRepo.save(detail);
    }

    seededCount++;
  }

  console.log(`  ✅ ${seededCount} Transactions seeded and stock levels synchronized`);
};

// ============================================================
// MAIN: Run all data seeds
// ============================================================
export const seedData = async (dataSource: DataSource) => {
  console.log('\n📦 Seeding sample business data...');

  await clearData(dataSource);

  const categories = await seedCategories(dataSource);
  const brands = await seedBrands(dataSource);
  const units = await seedUnits(dataSource);
  const currencies = await seedCurrencies(dataSource);
  const suppliers = await seedSuppliers(dataSource);
  const customers = await seedCustomers(dataSource);
  const discounts = await seedDiscounts(dataSource);
  const products = await seedProducts(dataSource, categories, brands, units);

  const saleOrders = await seedSaleOrders(dataSource, customers, products);
  await seedPurchaseInvoices(dataSource, suppliers, products);
  await seedSaleInvoices(dataSource, customers, products, saleOrders);
  await seedTransactions(dataSource, products);

  console.log('📦 Sample business data seeding completed!\n');
};
