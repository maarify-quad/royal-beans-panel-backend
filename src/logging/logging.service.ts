import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Workbook } from 'exceljs';

// Entities
import {
  LogginOperation,
  Logging,
  LoggingResource,
} from './entities/logging.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Logging)
    private readonly loggingRepo: Repository<Logging>,
  ) {}

  async findAll(options?: FindManyOptions<Logging>) {
    return await this.loggingRepo.find(options);
  }

  async create({
    userId,
    productId,
    orderId,
    message,
    jsonParams,
    resource,
    operation,
  }: {
    userId?: number;
    productId?: number;
    orderId?: number;
    message: string;
    jsonParams?: string;
    resource: LoggingResource;
    operation: LogginOperation;
  }) {
    const log = this.loggingRepo.create({
      userId: userId ?? null,
      productId: productId ?? null,
      orderId: orderId ?? null,
      jsonParams: jsonParams ?? null,
      message,
      resource,
      operation,
    });
    await this.loggingRepo.save(log);
    return log;
  }

  async generateOrderLogs() {
    const orderLogs = await this.findAll({
      where: { resource: 'order' },
      order: { createdAt: 'DESC' },
      relations: { user: true, order: true, product: true },
    });

    const updateOrderProductLogs = orderLogs.filter(
      (log) =>
        log.operation === 'updateOrderProducts' ||
        log.operation === 'updateManualOrderProducts',
    );
    const orderUpdateLogs = orderLogs.filter(
      (log) =>
        log.operation !== 'updateOrderProducts' &&
        log.operation !== 'updateManualOrderProducts',
    );

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sipariş Logları');
    const updateOrderProductWorksheet = workbook.addWorksheet(
      'Sipariş Ürün Güncelleme Logları',
    );

    worksheet.columns = [
      { header: 'Kullanıcı', key: 'user', width: 30 },
      { header: 'Sipariş ID', key: 'orderId', width: 30 },
      { header: 'Mesaj', key: 'message', width: 30 },
      { header: 'İşlem', key: 'operation', width: 30 },
      { header: 'Param-Kargo Tipi', key: 'deliveryType', width: 30 },
      { header: 'Param-Kargo Takip No', key: 'cargoTrackNo', width: 30 },
    ];

    updateOrderProductWorksheet.columns = [
      { header: 'Kullanıcı', key: 'user', width: 30 },
      { header: 'Sipariş ID', key: 'orderId', width: 30 },
      { header: 'Mesaj', key: 'message', width: 30 },
      { header: 'İşlem', key: 'operation', width: 30 },
      { header: 'Param-Ürün', key: 'productName', width: 30 },
      { header: 'Param-Öğütüm', key: 'grindType', width: 30 },
      { header: 'Param-Stok Kodu', key: 'stockCode', width: 30 },
      { header: 'Param-Miktar', key: 'quantity', width: 30 },
      { header: 'Param-Birim Fiyat', key: 'unitPrice', width: 30 },
      { header: 'Param-KDV', key: 'taxRate', width: 30 },
      { header: 'Param-Ara Toplam', key: 'subTotal', width: 30 },
      { header: 'Param-Toplam', key: 'total', width: 30 },
    ];

    orderUpdateLogs.forEach((log) => {
      const jsonParams = log.jsonParams ? JSON.parse(log.jsonParams) : null;

      worksheet.addRow({
        user: log.user?.username || 'Sistem',
        orderId: log.order.orderId,
        message: log.message,
        operation: log.operation,
        deliveryType: jsonParams ? jsonParams.deliveryType : null,
        cargoTrackNo: jsonParams ? jsonParams.cargoTrackNo : null,
      });
    });

    updateOrderProductLogs.forEach((log) => {
      const orderProducts = JSON.parse(log.jsonParams)
        .orderProducts as OrderProduct[];

      orderProducts.forEach((orderProduct) => {
        updateOrderProductWorksheet.addRow({
          user: log.user?.username || 'Sistem',
          orderId: log.order.orderId,
          message: log.message,
          operation: log.operation,
          productName: orderProduct.priceListProduct.product.name,
          grindType: orderProduct.grindType,
          stockCode: orderProduct.priceListProduct.product.stockCode,
          quantity: orderProduct.quantity,
          unitPrice: orderProduct.unitPrice,
          taxRate: orderProduct.taxRate,
          subTotal: orderProduct.subTotal,
          total: orderProduct.total,
        });
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    updateOrderProductWorksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    return workbook;
  }
}
