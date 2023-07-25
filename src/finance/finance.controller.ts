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

  @Post('calculate')
  async calculateFinance(@Body() dto: CalculateFinanceDTO) {
    const {
      totalConstantExpense,
      marketingExpense,
      generalCost,
      bulkOrderCargoCost,
      shopifyOrderCargoCost,
    } = dto;
    const startDate = dayjs(dto.month).startOf('month').toDate();
    const endDate = dayjs(dto.month).endOf('month').toDate();

    const [bulkOrders, manualOrders, totalDeliveriesCost] = await Promise.all([
      this.orderService.findAll({
        where: { type: 'BULK', createdAt: Between(startDate, endDate) },
        relations: { orderProducts: true },
      }),
      this.orderService.findAll({
        where: { type: 'MANUAL', createdAt: Between(startDate, endDate) },
        relations: { orderProducts: true },
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

    // Siparişlerin toplam cirosu
    const totalBulkOrdersRevenue =
      this.financeService.calculateOrdersRevenue(bulkOrders);
    const totalManualOrdersRevenue =
      this.financeService.calculateOrdersRevenue(manualOrders);

    // Giden tüm ürünlerin toplam maliyeti
    const totalBulkOrderProductsCost =
      this.financeService.calculateOrderProductsCost(bulkOrders);
    const totalManualOrderProductsCost =
      this.financeService.calculateOrderProductsCost(manualOrders);
    const totalShopifyOrderProductsCost =
      this.financeService.calculateOrderProductsCost(shopifyOrders);

    // Müşteri -> Shopify toplam ciro
    const totalShopifyRevenue =
      this.financeService.calculateOrdersRevenue(shopifyOrders);

    // Müşteri -> Trendyol toplam ciro
    const totalTrendyolRevenue =
      this.financeService.calculateOrdersRevenue(trendyolOrders);

    // Müşteri -> Hepsi Burada toplam ciro
    const totalHepsiBuradaRevenue =
      this.financeService.calculateOrdersRevenue(hepsiBuradaOrders);

    // Müşteri -> Dükkan Satış toplam ciro
    const totalStoreSaleRevenue =
      this.financeService.calculateOrdersRevenue(storeSaleOrders);

    // Ciro
    const totalRevenue = totalManualOrdersRevenue + totalBulkOrdersRevenue;
    const totalEcommerceRevenue =
      totalShopifyRevenue + totalTrendyolRevenue + totalHepsiBuradaRevenue;

    // Maliyet
    const totalBusinessExpense =
      totalConstantExpense +
      marketingExpense +
      totalDeliveriesCost +
      generalCost;
    const totalOrderProductsCost =
      totalBulkOrderProductsCost + totalManualOrderProductsCost;
    const theoryTotalExpense =
      totalConstantExpense +
      marketingExpense +
      generalCost +
      totalOrderProductsCost;

    // Kar
    const realProfit = totalRevenue - totalBusinessExpense;
    const theoryProfit = totalRevenue - theoryTotalExpense;
    const bulkOrdersProfit =
      totalBulkOrdersRevenue - totalBulkOrderProductsCost - bulkOrderCargoCost;
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
