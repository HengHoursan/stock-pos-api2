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
import { Transaction } from '../../modules/transaction/entity/transaction.entity';
import { CustomerType } from '../../common/enum/customer_type.enum';
import { TransactionType } from '../../common/enum/transaction_type.enum';

// ============================================================
// Helper: upsert by unique field (skip if already exists)
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
  console.log('  🗑️  Clearing data for Pure Cambodian Mart Transformation...');
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const driverType = dataSource.options.type;
  if (driverType === 'postgres') {
    await queryRunner.query('SET CONSTRAINTS ALL DEFERRED');
  } else if (driverType === 'mysql' || driverType === 'mariadb') {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  }

  try {
    const tables = [
      'transactions',
      'sale_invoice_details',
      'sale_invoices',
      'sale_order_details',
      'sale_orders',
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
        await queryRunner.query(
          `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
        );
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
// 1. SEED CATEGORIES (Khmer Only)
// ============================================================
const seedCategories = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Category);
  const categories = [
    { code: 'C-DRK', name: 'ភេសជ្ជៈ (Drinks)', slug: 'drinks', status: true },
    {
      code: 'C-SNK',
      name: 'អាហារសម្រន់ (Snacks)',
      slug: 'snacks',
      status: true,
    },
    {
      code: 'C-GRO',
      name: 'គ្រឿងទេស (Groceries)',
      slug: 'groceries',
      status: true,
    },
    {
      code: 'C-DAI',
      name: 'ផលិតផលទឹកដោះគោ (Dairy)',
      slug: 'dairy',
      status: true,
    },
    {
      code: 'C-ALC',
      name: 'ស្រាបៀរ និងស្រា (Alcohol)',
      slug: 'alcohol',
      status: true,
    },
    {
      code: 'C-HOU',
      name: 'របស់ប្រើប្រាស់ក្នុងផ្ទះ (Home)',
      slug: 'household',
      status: true,
    },
  ];
  const saved: Category[] = [];
  for (const c of categories)
    saved.push(await upsertByField<Category>(repo, ['code'], c));
  return saved;
};

// ============================================================
// 2. SEED BRANDS (Pure Cambodian / Local Favorites)
// ============================================================
const seedBrands = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Brand);
  const brands = [
    {
      code: 'B-VITAL',
      name: 'Vital (វីតាល់)',
      slug: 'vital',
      description: 'Cambodian Premium Water',
      status: true,
    },
    {
      code: 'B-ANGKOR',
      name: 'Angkor (អង្គរ)',
      slug: 'angkor',
      description: 'The National Beer of Cambodia',
      status: true,
    },
    {
      code: 'B-HANUMAN',
      name: 'Hanuman (ហនុមាន)',
      slug: 'hanuman',
      description: 'Local Premium Beer',
      status: true,
    },
    {
      code: 'B-KULARA',
      name: 'Eau Kulen (គូលែន)',
      slug: 'eau-kulen',
      description: 'Natural Mineral Water',
      status: true,
    },
    {
      code: 'B-CHIP',
      name: 'Chip Mong (ជីបម៉ុង)',
      slug: 'chip-mong',
      description: 'Local Conglomerate (Drinks/Food)',
      status: true,
    },
    {
      code: 'B-MEE',
      name: 'Mee YG (មីយើង)',
      slug: 'mee-yg',
      description: 'Popular Local Instant Noodle',
      status: true,
    },
  ];
  const saved: Brand[] = [];
  for (const b of brands)
    saved.push(await upsertByField<Brand>(repo, ['code'], b));
  return saved;
};

// ============================================================
// 3. SEED UNITS (Khmer Units)
// ============================================================
const seedUnits = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Unit);
  const units = [
    {
      code: 'U-PCS',
      name: 'កំប៉ុង/ដប/ដុំ (Piece)',
      slug: 'piece',
      symbol: 'pcs',
      conversionFactor: 1,
      status: true,
    },
    {
      code: 'U-PK',
      name: 'កញ្ចប់ (Pack)',
      slug: 'pack',
      symbol: 'pk',
      conversionFactor: 6,
      status: true,
    },
    {
      code: 'U-CS',
      name: 'កេស (Case)',
      slug: 'case',
      symbol: 'cs',
      conversionFactor: 24,
      status: true,
    },
  ];
  const saved: Unit[] = [];
  for (const u of units)
    saved.push(await upsertByField<Unit>(repo, ['code'], u));
  return saved;
};

// ============================================================
// 4. SEED CURRENCIES
// ============================================================
const seedCurrencies = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Currency);
  const currencies = [
    {
      code: 'USD',
      country: 'USA',
      currency: 'US Dollar',
      symbol: '$',
      thousandSeparator: ',',
      decimalSeparator: '.',
      exchangeRate: 1,
      isDefault: true,
      status: true,
    },
    {
      code: 'KHR',
      country: 'Cambodia',
      currency: 'Cambodian Riel',
      symbol: '៛',
      thousandSeparator: ',',
      decimalSeparator: '.',
      exchangeRate: 4100,
      isDefault: false,
      status: true,
    },
  ];
  const saved: Currency[] = [];
  for (const c of currencies)
    saved.push(await upsertByField<Currency>(repo, ['code'], c));
  return saved;
};

// ============================================================
// 5. SEED SUPPLIERS (Cambodian Companies)
// ============================================================
const seedSuppliers = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Supplier);
  const suppliers = [
    {
      code: 'S-CHIP',
      name: 'Chip Mong Beverages',
      email: 'info@chipmong.com',
      phoneNumber: '023-111-222',
      address: 'PP, Cambodia',
      status: true,
    },
    {
      code: 'S-KULARA',
      name: 'Kulara Water Co., Ltd',
      email: 'sales@eaukulen.com',
      phoneNumber: '023-333-444',
      address: 'PP, Cambodia',
      status: true,
    },
    {
      code: 'S-ANGKOR',
      name: 'Cambrew Ltd (Angkor)',
      email: 'contact@angkor.com',
      phoneNumber: '023-555-666',
      address: 'Sihanoukville, Cambodia',
      status: true,
    },
    {
      code: 'S-LOCAL',
      name: 'Local Farmer Supply',
      email: 'local@farmer.com',
      phoneNumber: '012-777-888',
      address: 'Battambang, Cambodia',
      status: true,
    },
  ];
  const saved: Supplier[] = [];
  for (const s of suppliers)
    saved.push(await upsertByField<Supplier>(repo, ['code'], s));
  return saved;
};

// ============================================================
// 6. SEED CUSTOMERS
// ============================================================
const seedCustomers = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Customer);
  const customers = [
    {
      code: 'C-WALK',
      name: 'ភ្ញៀវទូទៅ (Walk-in)',
      type: CustomerType.DINE_IN,
      status: true,
    },
    {
      code: 'C-MEM',
      name: 'សមាជិកស្មោះត្រង់ (Member)',
      phoneNumber: '012-345-678',
      type: CustomerType.DINE_IN,
      status: true,
    },
  ];
  const saved: Customer[] = [];
  for (const c of customers)
    saved.push(await upsertByField<Customer>(repo, ['code'], c));
  return saved;
};

// ============================================================
// 7. SEED PRODUCTS (Purely Cambodian Products)
// ============================================================
const seedProducts = async (
  dataSource: DataSource,
  categories: Category[],
  brands: Brand[],
  units: Unit[],
) => {
  const productRepo = dataSource.getRepository(Product);
  const detailRepo = dataSource.getRepository(ProductDetail);

  const cat = (code: string) => categories.find((c) => c.code === code)!;
  const brd = (code: string) => brands.find((b) => b.code === code)!;
  const unt = (code: string) => units.find((u) => u.code === code)!;

  const productsData = [
    // --- DRINKS ---
    {
      code: 'P-VITAL',
      name: 'ទឹកសុទ្ធ វីតាល់ 500ml',
      categoryId: cat('C-DRK').id,
      brandId: brd('B-VITAL').id,
      unitId: unt('U-PCS').id,
      skuCode: 'VT-500',
      purchasePrice: 0.15,
      salePrice: 0.25,
      alertQuantity: 24,
      currentStock: 100,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1523362628744-0c100150b504?q=80&w=400&auto=format&fit=crop',
    },
    {
      code: 'P-KULEN',
      name: 'ទឹកសុទ្ធ គូលែន 500ml',
      categoryId: cat('C-DRK').id,
      brandId: brd('B-KULARA').id,
      unitId: unt('U-PCS').id,
      skuCode: 'KL-500',
      purchasePrice: 0.25,
      salePrice: 0.4,
      alertQuantity: 24,
      currentStock: 100,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1559839914-17aae19cea9e?q=80&w=400&auto=format&fit=crop',
    },
    {
      code: 'P-CM-COLA',
      name: 'Chip Mong Cola Can',
      categoryId: cat('C-DRK').id,
      brandId: brd('B-CHIP').id,
      unitId: unt('U-PCS').id,
      skuCode: 'CM-CLA',
      purchasePrice: 0.3,
      salePrice: 0.5,
      alertQuantity: 24,
      currentStock: 100,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop',
    },

    // --- ALCOHOL ---
    {
      code: 'P-AK-CAN',
      name: 'ស្រាបៀរ អង្គរ កំប៉ុង',
      categoryId: cat('C-ALC').id,
      brandId: brd('B-ANGKOR').id,
      unitId: unt('U-PCS').id,
      skuCode: 'AK-CAN',
      purchasePrice: 0.45,
      salePrice: 0.65,
      alertQuantity: 24,
      currentStock: 200,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?q=80&w=400&auto=format&fit=crop',
    },
    {
      code: 'P-HM-CAN',
      name: 'ស្រាបៀរ ហនុមាន កំប៉ុង',
      categoryId: cat('C-ALC').id,
      brandId: brd('B-HANUMAN').id,
      unitId: unt('U-PCS').id,
      skuCode: 'HM-CAN',
      purchasePrice: 0.5,
      salePrice: 0.75,
      alertQuantity: 24,
      currentStock: 200,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1618889482923-382504ff1956?q=80&w=400&auto=format&fit=crop',
    },

    // --- GROCERIES ---
    {
      code: 'P-MYG-NDL',
      name: 'មីយើង (Mee YG)',
      categoryId: cat('C-GRO').id,
      brandId: brd('B-MEE').id,
      unitId: unt('U-PCS').id,
      skuCode: 'MYG-NDL',
      purchasePrice: 0.18,
      salePrice: 0.3,
      alertQuantity: 30,
      currentStock: 150,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop',
    },

    // --- SNACKS ---
    {
      code: 'P-LOCAL-CHIP',
      name: 'ដំឡូងបំពង សិប្បកម្មខ្មែរ',
      categoryId: cat('C-SNK').id,
      brandId: undefined,
      unitId: unt('U-PK').id,
      skuCode: 'KH-CHP',
      purchasePrice: 0.5,
      salePrice: 1.0,
      alertQuantity: 10,
      currentStock: 30,
      manageStock: true,
      photoPath:
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const saved: Product[] = [];
  for (const p of productsData) {
    const { purchasePrice, salePrice, currentStock, ...fields } = p;
    const product = await productRepo.save(productRepo.create(fields));
    await detailRepo.save(
      detailRepo.create({
        productId: product.id,
        purchasePrice,
        salePrice,
        currentStock,
      }),
    );
    saved.push(product);
  }
  return saved;
};

// ============================================================
// MAIN: Run Pure Cambodian Data Transformation
// ============================================================
export const seedData = async (dataSource: DataSource) => {
  console.log('\n🇰🇭 Transforming system to Pure Cambodian Support Only...');

  await clearData(dataSource);

  const categories = await seedCategories(dataSource);
  const brands = await seedBrands(dataSource);
  const units = await seedUnits(dataSource);
  await seedCurrencies(dataSource);
  await seedSuppliers(dataSource);
  await seedCustomers(dataSource);
  await seedProducts(dataSource, categories, brands, units);

  console.log('🇰🇭 Pure Cambodian Transformation completed!\n');
};
