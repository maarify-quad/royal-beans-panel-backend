import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Between } from 'typeorm';

// Services
import { OrderService } from 'src/order/order.service';
import { FinanceService } from './finance.service';
import { DeliveryService } from 'src/delivery/delivery.service';
import { DeciService } from 'src/deci/deci.service';
import { ProductService } from 'src/product/product.service';
import { OrderLogic } from 'src/order/order.logic';

// DTOs
import { CalculateFinanceDTO } from './dto/calculate-finance.dto';

// Guards
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly orderService: OrderService,
    private readonly deliveryService: DeliveryService,
    private readonly deciService: DeciService,
    private readonly productService: ProductService,
    private readonly orderLogic: OrderLogic,
  ) {}

  @Get()
  async getAllFinances() {
    return await this.financeService.findAll();
  }

  @Post()
  async calculatFinance(@Body() dto: CalculateFinanceDTO) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    let finance = await this.financeService.findOne({
      where: {
        startDate,
        endDate,
      },
    });

    const totalConstantExpense =
      finance?.totalConstantExpense ?? dto.totalConstantExpense;
    const marketingExpense = finance?.marketingExpense ?? dto.marketingExpense;
    const generalCost = finance?.generalCost ?? dto.generalCost;

    const [
      bulkOrders,
      manualOrders,
      totalDeliveriesCost,
      decis,
      box285,
      box155,
    ] = await Promise.all([
      this.orderService.findAll({
        where: { type: 'BULK', createdAt: Between(startDate, endDate) },
        relations: {
          orderProducts: {
            priceListProduct: { product: { ingredients: true } },
            product: { ingredients: true },
          },
        },
      }),
      this.orderService.findAll({
        where: { type: 'MANUAL', createdAt: Between(startDate, endDate) },
        relations: { orderProducts: { product: { ingredients: true } } },
      }),
      this.deliveryService.sumTotal({
        createdAt: Between(startDate, endDate),
      }),
      this.deciService.findAll(),
      this.productService.findOne({ where: { id: 285 } }),
      this.productService.findOne({ where: { id: 155 } }),
    ]);

    const deciPricingMap = decis.reduce((acc, deci) => {
      acc[deci.value] = deci.price;
      return acc;
    }, {});

    // Müşteriye göre siparişler
    const shopifyOrders = manualOrders.filter(
      (order) => order.receiver === 'Shopify',
    );
    const trendyolOrders = manualOrders.filter(
      (order) => order.receiver === 'Trendyol',
    );
    const hepsiBuradaOrders = manualOrders.filter(
      (order) => order.receiver === 'Hepsi Burada',
    );
    const storeSaleOrders = manualOrders.filter(
      (order) => order.receiver === 'dükkan satış',
    );

    // S siparişlerin toplam cirosu
    const totalBulkOrdersRevenue =
      this.financeService.calculateOrdersRevenue(bulkOrders);

    // MG siparişlerin toplam cirosu
    const totalManualOrdersRevenue =
      this.financeService.calculateOrdersRevenue(manualOrders);

    // Giden tüm S ürünlerin toplam maliyeti
    const totalBulkOrderProductsCost =
      this.financeService.calculateOrderProductsCost(bulkOrders);

    // Giden tüm MG ürünlerin toplam maliyeti
    const totalManualOrderProductsCost =
      this.financeService.calculateOrderProductsCost(manualOrders);

    // Giden tüm Shopify ürünlerin toplam maliyeti
    const totalShopifyOrderProductsCost =
      this.financeService.calculateOrderProductsCost(shopifyOrders);

    // Müşteri: Shopify toplam ciro
    const totalShopifyRevenue =
      this.financeService.calculateOrdersRevenue(shopifyOrders);

    // Müşteri: Trendyol toplam ciro
    const totalTrendyolRevenue =
      this.financeService.calculateOrdersRevenue(trendyolOrders);

    // Müşteri: Hepsi Burada toplam ciro
    const totalHepsiBuradaRevenue =
      this.financeService.calculateOrdersRevenue(hepsiBuradaOrders);

    // Müşteri: Dükkan Satış toplam ciro
    const totalStoreSaleRevenue =
      this.financeService.calculateOrdersRevenue(storeSaleOrders);

    // Kargo maaliyetleri
    let bulkOrderCargoCost = 0;
    let manualOrderCargoCost = 0;
    let shopifyOrderCargoCost = 0;

    // Kutu maliyetleri
    let bulkOrderBoxCost = 0;
    let manualOrderBoxCost = 0;
    const shopifyOrderBoxCost = shopifyOrders.length * 0.4; // Dolar

    // S Siparişlerin kutu & kargo maliyeti
    bulkOrders.forEach((order) => {
      const { box285Count, box155Count } =
        this.orderLogic.calculateBoxCounts(order);

      bulkOrderBoxCost += box285Count * box285.unitCost;
      bulkOrderBoxCost += box155Count * box155.unitCost;

      bulkOrderCargoCost += box285Count * (deciPricingMap[box285.deci] ?? 0);
      bulkOrderCargoCost += box155Count * (deciPricingMap[box155.deci] ?? 0);
    });

    // MG Siparişlerin kutu & kargo maliyeti
    manualOrders.forEach((order) => {
      const { box285Count, box155Count } =
        this.orderLogic.calculateBoxCounts(order);

      manualOrderBoxCost += box285Count * box285.unitCost;
      manualOrderBoxCost += box155Count * box155.unitCost;

      if (order.receiver !== 'Shopify') {
        manualOrderCargoCost +=
          box285Count * (deciPricingMap[box285.deci] ?? 0);
        manualOrderCargoCost +=
          box155Count * (deciPricingMap[box155.deci] ?? 0);
      }
    });

    // Shopify Siparişlerin kargo maliyeti
    shopifyOrders.forEach((order) => {
      const { box285Count, box155Count } =
        this.orderLogic.calculateBoxCounts(order);

      shopifyOrderCargoCost += box285Count * (deciPricingMap[box285.deci] ?? 0);
      shopifyOrderCargoCost += box155Count * (deciPricingMap[box155.deci] ?? 0);
    });

    // Toplam kargo maliyeti
    const totalCargoCost =
      bulkOrderCargoCost + manualOrderCargoCost + shopifyOrderCargoCost;

    // Toplam kutu maliyeti
    const totalBoxCost =
      bulkOrderBoxCost + manualOrderBoxCost + shopifyOrderBoxCost;

    // Navlun maliyeti
    const navlunCost = totalBoxCost + totalCargoCost;

    // Toplam e-ticaret cirosu
    const totalEcommerceRevenue =
      totalShopifyRevenue + totalTrendyolRevenue + totalHepsiBuradaRevenue;

    // Toplam ciro
    const totalRevenue =
      totalManualOrdersRevenue + totalBulkOrdersRevenue + totalEcommerceRevenue;

    // Toplam işletme gideri
    const totalBusinessExpense =
      totalConstantExpense +
      marketingExpense +
      totalDeliveriesCost +
      generalCost;

    // Toplam sipariş ürün maliyeti
    const totalOrderProductsCost =
      totalBulkOrderProductsCost + totalManualOrderProductsCost;

    // Toplam teorik gider
    const theoryTotalExpense =
      totalConstantExpense +
      marketingExpense +
      generalCost +
      totalOrderProductsCost;

    // Reel kar
    const realProfit = totalRevenue - totalBusinessExpense;

    // Teorik kar
    const theoryProfit = totalRevenue - theoryTotalExpense;

    // Toplam sipariş kar
    const bulkOrdersProfit =
      totalBulkOrdersRevenue -
      totalBulkOrderProductsCost -
      bulkOrderCargoCost -
      bulkOrderBoxCost;

    // Shopify kar
    const shopifyProfit =
      totalShopifyRevenue -
      totalShopifyOrderProductsCost -
      shopifyOrderCargoCost -
      shopifyOrderBoxCost;

    if (!finance) {
      finance = await this.financeService.create({
        startDate,
        endDate,
        totalRevenue,
        totalCost: -1,
        sentCost: -1,
        financialStatus: -1,
        profitLossRatio: -1,
        totalConstantExpense,
        marketingExpense,
        generalCost,
        totalAdditionalExpense: -1,
        totalAdditionalRevenue: -1,
      });
    }

    return {
      id: finance.id,
      realProfit,
      theoryProfit,
      bulkOrdersProfit,
      shopifyProfit,
      theoryTotalExpense,
      totalBusinessExpense,
      totalConstantExpense,
      marketingExpense,
      totalDeliveriesCost,
      generalCost,
      totalOrderProductsCost,
      totalManualOrderProductsCost,
      totalShopifyOrderProductsCost,
      totalBulkOrderProductsCost,
      totalShopifyRevenue,
      totalBulkOrdersRevenue,
      totalManualOrdersRevenue,
      totalStoreSaleRevenue,
      totalTrendyolRevenue,
      totalHepsiBuradaRevenue,
      totalRevenue,
      bulkOrderBoxCost,
      manualOrderBoxCost,
      shopifyOrderBoxCost,
      bulkOrderCargoCost,
      manualOrderCargoCost,
      shopifyOrderCargoCost,
      totalCargoCost,
      navlunCost,
      ...finance,
    };
  }
}
