import { Body, Controller, Post } from '@nestjs/common';
import { Between } from 'typeorm';
import * as dayjs from 'dayjs';

// Services
import { OrderService } from 'src/order/order.service';
import { FinanceService } from './finance.service';
import { DeliveryService } from 'src/delivery/delivery.service';

// DTOs
import { CalculateFinanceDTO } from './dto/calculate-finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly orderService: OrderService,
    private readonly deliveryService: DeliveryService,
  ) {}

  @Post()
  async getFinance(@Body() dto: CalculateFinanceDTO) {
    const {
      totalConstantExpense,
      marketingExpense,
      generalCost,
      bulkOrderCargoCost,
      shopifyOrderCargoCost,
    } = dto;

    const thisMonth = dayjs().set('month', dto.month - 1);
    const startDate = thisMonth.startOf('month').toDate();
    const endDate = thisMonth.endOf('month').toDate();

    const [bulkOrders, manualOrders, totalDeliveriesCost] = await Promise.all([
      this.orderService.findAll({
        where: { type: 'BULK', createdAt: Between(startDate, endDate) },
        relations: { orderProducts: { product: { ingredients: true } } },
      }),
      this.orderService.findAll({
        where: { type: 'MANUAL', createdAt: Between(startDate, endDate) },
        relations: { orderProducts: { product: { ingredients: true } } },
      }),
      this.deliveryService.sumTotal({
        createdAt: Between(startDate, endDate),
      }),
    ]);

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
      totalBulkOrdersRevenue - totalBulkOrderProductsCost - bulkOrderCargoCost;

    // Shopify kar
    const shopifyProfit =
      totalShopifyRevenue -
      totalShopifyOrderProductsCost -
      shopifyOrderCargoCost;

    return {
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
    };
  }
}
