import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Customer } from '@/customer/entity/customer.entity';
import { Supplier } from '@/supplier/entity/supplier.entity';
import { Product } from '@/product/entity/product.entity';
import { SalePayment } from '@/sale_payment/entity/sale_payment.entity';
import { SaleReturn } from '@/sale_return/entity/sale_return.entity';
import { PurchasePayment } from '@/purchase_payment/entity/purchase_payment.entity';
import { PurchaseReturn } from '@/purchase_return/entity/purchase_return.entity';
import { Transaction } from '@/transaction/entity/transaction.entity';
import { SaleInvoice } from '@/sale_invoice/entity/sale_invoice.entity';
import { PurchaseInvoice } from '@/purchase_invoice/entity/purchase_invoice.entity';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { PaginationRequest, PaginationResponse } from '@/common/dto';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(SalePayment)
    private salePaymentRepo: Repository<SalePayment>,
    @InjectRepository(SaleReturn)
    private saleReturnRepo: Repository<SaleReturn>,
    @InjectRepository(PurchasePayment)
    private purchasePaymentRepo: Repository<PurchasePayment>,
    @InjectRepository(PurchaseReturn)
    private purchaseReturnRepo: Repository<PurchaseReturn>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(SaleInvoice)
    private saleInvoiceRepo: Repository<SaleInvoice>,
    @InjectRepository(PurchaseInvoice)
    private purchaseInvoiceRepo: Repository<PurchaseInvoice>,
  ) {}

  async getDashboardMetrics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      customers,
      salePayments,
      saleReturns,
      transactions,
      purchasePayments,
      purchaseReturns,
      products,
      suppliers,
    ] = await Promise.all([
      this.getEntityStats(this.customerRepo, firstDayOfMonth),
      this.getEntityStats(this.salePaymentRepo, firstDayOfMonth),
      this.getEntityStats(this.saleReturnRepo, firstDayOfMonth),
      this.getEntityStats(this.transactionRepo, firstDayOfMonth),
      this.getEntityStats(this.purchasePaymentRepo, firstDayOfMonth),
      this.getEntityStats(this.purchaseReturnRepo, firstDayOfMonth),
      this.getEntityStats(this.productRepo, firstDayOfMonth),
      this.getEntityStats(this.supplierRepo, firstDayOfMonth),
    ]);

    return {
      pos: { customers, salePayments, saleReturns },
      stock: { transactions, purchasePayments, purchaseReturns },
      inventory: { products, suppliers },
    };
  }

  async getSalesReport(query: PaginationRequest) {
    const statuses = [InvoiceStatus.CONFIRMED, InvoiceStatus.COMPLETED];
    const limit = query.limit || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    const revenueQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalPrice)', 'totalRevenue')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false });

    const returnsQb = this.saleReturnRepo
      .createQueryBuilder('returns')
      .select('SUM(returns.totalPrice)', 'totalReturns')
      .where('returns.status IN (:...statuses)', { statuses })
      .andWhere('returns.isCancel = :isCancel', { isCancel: false });

    if (query.filter?.startDate) {
      revenueQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
      returnsQb.andWhere('returns.returnDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    }
    if (query.filter?.endDate) {
      revenueQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
      returnsQb.andWhere('returns.returnDate <= :endDate', {
        endDate: query.filter.endDate,
      });
    }

    const revenueResult = await revenueQb.getRawOne();
    const returnsResult = await returnsQb.getRawOne();

    const revenue = parseFloat(revenueResult?.totalRevenue || '0');
    const returnsCount = parseFloat(returnsResult?.totalReturns || '0');
    const netSales = revenue - returnsCount;

    const salesByPaymentMethod = await this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .select('invoice.paymentMethod', 'paymentMethod')
      .addSelect('SUM(invoice.totalPrice)', 'total')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false })
      .groupBy('invoice.paymentMethod')
      .getRawMany();

    const salesByCustomerQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .select('customer.name', 'customerName')
      .addSelect('customer.phoneNumber', 'customerPhone')
      .addSelect('SUM(invoice.totalPrice)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'totalInvoices')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false })
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.phoneNumber')
      .orderBy('SUM(invoice.totalPrice)', 'DESC')
      .offset(offset)
      .limit(limit);

    if (query.search) {
      salesByCustomerQb.andWhere(
        '(customer.name ILIKE :search OR customer.phoneNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.filter?.startDate)
      salesByCustomerQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    if (query.filter?.endDate)
      salesByCustomerQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });

    const totalCount = await salesByCustomerQb
      .clone()
      .select('COUNT(DISTINCT invoice.customerId)', 'totalCount')
      .getRawOne()
      .then((res) => res?.totalCount || '0');

    const salesByCustomer = await salesByCustomerQb.getRawMany();

    return {
      totalRevenue: revenue,
      totalReturns: returnsCount,
      netSales,
      salesByPaymentMethod: salesByPaymentMethod.map((s) => ({
        paymentMethod: s.paymentMethod,
        total: parseFloat(s.total),
      })),
      salesByCustomer: PaginationResponse.create(
        salesByCustomer.map((c) => ({
          customerName: c.customerName || 'Walk-in Customer',
          customerPhone: c.customerPhone || 'N/A',
          totalSpent: parseFloat(c.totalSpent),
          totalInvoices: parseInt(c.totalInvoices),
        })),
        parseInt(totalCount || '0'),
        page,
        limit,
        query.sortBy,
        query.sortOrder,
      ),
    };
  }

  async getPurchasesReport(query: PaginationRequest) {
    const statuses = [InvoiceStatus.CONFIRMED, InvoiceStatus.COMPLETED];
    const limit = query.limit || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    const expensesQb = this.purchaseInvoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalPrice)', 'totalExpenses')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false });

    if (query.filter?.startDate)
      expensesQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    if (query.filter?.endDate)
      expensesQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });

    const expensesResult = await expensesQb.getRawOne();
    const expenses = parseFloat(expensesResult?.totalExpenses || '0');

    const purchasesBySupplierQb = this.purchaseInvoiceRepo
      .createQueryBuilder('invoice')
      .leftJoin('invoice.supplier', 'supplier')
      .select('supplier.name', 'supplierName')
      .addSelect('SUM(invoice.totalPrice)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'totalInvoices')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false })
      .groupBy('supplier.id')
      .addGroupBy('supplier.name')
      .orderBy('SUM(invoice.totalPrice)', 'DESC')
      .offset(offset)
      .limit(limit);

    if (query.search) {
      purchasesBySupplierQb.andWhere('supplier.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.filter?.startDate)
      purchasesBySupplierQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    if (query.filter?.endDate)
      purchasesBySupplierQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });

    const countResult = await purchasesBySupplierQb
      .clone()
      .select('COUNT(DISTINCT invoice.supplierId)', 'totalCount')
      .offset(undefined)
      .limit(undefined)
      .orderBy({})
      .getRawOne();

    const totalCount = countResult?.totalCount || '0';

    const purchasesBySupplier = await purchasesBySupplierQb.getRawMany();

    return {
      totalExpenses: expenses,
      purchasesBySupplier: PaginationResponse.create(
        purchasesBySupplier.map((s) => ({
          supplierName: s.supplierName || 'Unknown Supplier',
          totalSpent: parseFloat(s.totalSpent),
          totalInvoices: parseInt(s.totalInvoices),
        })),
        parseInt(totalCount || '0'),
        page,
        limit,
        query.sortBy,
        query.sortOrder,
      ),
    };
  }

  async getProfitAndLossReport(query: PaginationRequest) {
    const statuses = [InvoiceStatus.CONFIRMED, InvoiceStatus.COMPLETED];

    const revenueQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalPrice)', 'totalRevenue')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false });

    const returnsQb = this.saleReturnRepo
      .createQueryBuilder('returns')
      .select('SUM(returns.totalPrice)', 'totalReturns')
      .where('returns.status IN (:...statuses)', { statuses })
      .andWhere('returns.isCancel = :isCancel', { isCancel: false });

    const cogsQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .leftJoin('invoice.details', 'details')
      .leftJoin('details.product', 'product')
      .leftJoin('product.detail', 'productDetail')
      .select('SUM(details.quantity * productDetail.purchasePrice)', 'cogs')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false });

    const expensesQb = this.purchaseInvoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalPrice)', 'totalExpenses')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false });

    if (query.filter?.startDate) {
      revenueQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
      returnsQb.andWhere('returns.returnDate >= :startDate', {
        startDate: query.filter.startDate,
      });
      cogsQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
      expensesQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    }
    if (query.filter?.endDate) {
      revenueQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
      returnsQb.andWhere('returns.returnDate <= :endDate', {
        endDate: query.filter.endDate,
      });
      cogsQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
      expensesQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
    }

    const revenueResult = await revenueQb.getRawOne();
    const returnsResult = await returnsQb.getRawOne();
    const cogsResult = await cogsQb.getRawOne();
    const expensesResult = await expensesQb.getRawOne();

    const revenue = parseFloat(revenueResult?.totalRevenue || '0');
    const returnsCount = parseFloat(returnsResult?.totalReturns || '0');
    const netSales = revenue - returnsCount;
    const costOfGoodsSold = parseFloat(cogsResult?.cogs || '0');
    const expenses = parseFloat(expensesResult?.totalExpenses || '0');

    const grossProfit = netSales - costOfGoodsSold;
    const netProfit = grossProfit - expenses;

    return {
      netSales,
      costOfGoodsSold,
      grossProfit,
      expenses,
      netProfit,
    };
  }

  async getInventoryReport(query: PaginationRequest) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.detail', 'detail')
      .select('SUM(detail.currentStock)', 'currentStockLevels')
      .addSelect(
        'SUM(detail.currentStock * detail.purchasePrice)',
        'stockValuation',
      )
      .where('product.status = :status', { status: true });

    const stockStats = await qb.getRawOne();
    const currentStockLevels = stockStats?.currentStockLevels || '0';
    const stockValuation = stockStats?.stockValuation || '0';

    const lowStockQb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.detail', 'detail')
      .addSelect('detail')
      .where('detail.currentStock <= product.alertQuantity')
      .andWhere('product.status = :status', { status: true })
      .andWhere('product.manageStock = :manage', { manage: true });

    if (query.search) {
      lowStockQb.andWhere(
        '(product.name ILIKE :search OR product.code ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const totalAlerts = await lowStockQb.getCount();
    lowStockQb.skip(offset).take(limit);

    const lowStockAlerts = await lowStockQb.getMany();

    return {
      currentStockLevels: parseFloat(currentStockLevels || '0'),
      stockValuation: parseFloat(stockValuation || '0'),
      lowStockAlerts: PaginationResponse.create(
        lowStockAlerts.map((p) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          currentStock: p.detail?.currentStock || 0,
          alertQuantity: p.alertQuantity,
        })),
        totalAlerts,
        page,
        limit,
        query.sortBy,
        query.sortOrder,
      ),
    };
  }

  async getTopPerformersReport(query: PaginationRequest) {
    const statuses = [InvoiceStatus.CONFIRMED, InvoiceStatus.COMPLETED];
    const limit = query.limit || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    const bestSellingQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .leftJoin('invoice.details', 'details')
      .leftJoin('details.product', 'product')
      .select('product.name', 'productName')
      .addSelect('product.code', 'productCode')
      .addSelect('SUM(details.quantity)', 'totalSold')
      .addSelect('SUM(details.totalPrice)', 'revenueGenerated')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.code')
      .orderBy('SUM(details.quantity)', 'DESC')
      .offset(offset)
      .limit(limit);

    if (query.search) {
      bestSellingQb.andWhere(
        '(product.name ILIKE :search OR product.code ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const topCustomersQb = this.saleInvoiceRepo
      .createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .select('customer.name', 'customerName')
      .addSelect('customer.phoneNumber', 'customerPhone')
      .addSelect('SUM(invoice.totalPrice)', 'totalSpent')
      .where('invoice.status IN (:...statuses)', { statuses })
      .andWhere('invoice.isCancel = :isCancel', { isCancel: false })
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.phoneNumber')
      .orderBy('SUM(invoice.totalPrice)', 'DESC')
      .offset(offset)
      .limit(limit);

    if (query.search) {
      topCustomersQb.andWhere(
        '(customer.name ILIKE :search OR customer.phoneNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.filter?.startDate) {
      bestSellingQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
      topCustomersQb.andWhere('invoice.invoiceDate >= :startDate', {
        startDate: query.filter.startDate,
      });
    }
    if (query.filter?.endDate) {
      bestSellingQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
      topCustomersQb.andWhere('invoice.invoiceDate <= :endDate', {
        endDate: query.filter.endDate,
      });
    }

    const totalProducts = await bestSellingQb
      .clone()
      .select('COUNT(DISTINCT product.id)', 'total')
      .groupBy('')
      .getRawOne()
      .then((res) => res?.total || '0');

    const totalCustomers = await topCustomersQb
      .clone()
      .select('COUNT(DISTINCT customer.id)', 'total')
      .groupBy('')
      .getRawOne()
      .then((res) => res?.total || '0');

    const bestSellingProducts = await bestSellingQb.getRawMany();
    const topCustomers = await topCustomersQb.getRawMany();

    return {
      bestSellingProducts: PaginationResponse.create(
        bestSellingProducts.map((p) => ({
          productName: p.productName,
          productCode: p.productCode,
          totalSold: parseFloat(p.totalSold),
          revenueGenerated: parseFloat(p.revenueGenerated),
        })),
        parseInt(totalProducts || '0'),
        page,
        limit,
        query.sortBy,
        query.sortOrder,
      ),
      topCustomers: PaginationResponse.create(
        topCustomers.map((c) => ({
          customerName: c.customerName || 'Walk-in Customer',
          customerPhone: c.customerPhone || 'N/A',
          totalSpent: parseFloat(c.totalSpent),
        })),
        parseInt(totalCustomers || '0'),
        page,
        limit,
        query.sortBy,
        query.sortOrder,
      ),
    };
  }

  private async getEntityStats(repo: Repository<any>, firstDayOfMonth: Date) {
    const [total, addedThisMonth] = await Promise.all([
      repo.count(),
      repo.count({ where: { createdAt: MoreThanOrEqual(firstDayOfMonth) } }),
    ]);
    return { total, addedThisMonth };
  }
}
