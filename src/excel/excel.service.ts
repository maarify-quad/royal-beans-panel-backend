import { BadRequestException, Injectable } from '@nestjs/common';

// Excel Utils
import { Workbook } from 'exceljs';

// DTOs
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { IReadPriceListProductResult } from './interfaces/IReadPriceListProductResult';

@Injectable()
export class ExcelService {
  async readProducts(excelBuffer: Buffer): Promise<CreateProductDto[]> {
    // Create a workbook from buffer
    const workbook = await new Workbook().xlsx.load(excelBuffer);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    // Initialize the products array
    const products: CreateProductDto[] = [];

    for (let i = 1; i <= worksheet.actualRowCount; i++) {
      // Get row values
      const values = worksheet.getRow(i).values;

      // Get each cell value
      const name = values[1];
      const storageType = values[2];
      const amount = values[3];
      const amountUnit = values[4];

      // Check if all values are present and are in the correct format
      if (typeof name !== 'string') {
        throw new BadRequestException('Ürün adı değeri hatalı');
      }
      if (typeof storageType !== 'string') {
        throw new BadRequestException('Depo tipi değeri hatalı');
      }
      if (typeof amount !== 'number' && typeof amount !== 'string') {
        throw new BadRequestException('Miktar değeri hatalı');
      }
      if (typeof amountUnit !== 'string') {
        throw new BadRequestException('Miktar birimi değeri hatalı');
      }

      // Add product to products array
      products.push({
        name,
        storageType,
        amount: typeof amount === 'number' ? values[3] : parseFloat(values[3]),
        amountUnit,
      });
    }

    // Return products array
    return products;
  }

  async readPriceListProducts(
    excelBuffer: Buffer,
  ): Promise<IReadPriceListProductResult[]> {
    // Create a workbook from buffer
    const workbook = await new Workbook().xlsx.load(excelBuffer);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    // Initialize the products array
    const products: IReadPriceListProductResult[] = [];

    for (let i = 1; i <= worksheet.actualRowCount; i++) {
      // Get row values
      const values = worksheet.getRow(i).values;

      // Get each cell value
      const name = values[1];
      const storageType = values[2];
      const amountUnit = values[3];
      const unitPrice = values[4];
      const taxRate = values[5];

      // Check if all values are present and are in the correct format
      if (typeof name !== 'string') {
        throw new BadRequestException('Ürün adı değeri hatalı');
      }
      if (typeof storageType !== 'string') {
        throw new BadRequestException('Depo tipi değeri hatalı');
      }
      if (typeof amountUnit !== 'string') {
        throw new BadRequestException('Miktar birim değeri hatalı');
      }
      if (typeof unitPrice !== 'number' && typeof unitPrice !== 'string') {
        throw new BadRequestException('Birim fiyat değeri hatalı');
      }
      if (typeof taxRate !== 'number' && typeof taxRate !== 'string') {
        throw new BadRequestException('Vergi oranı değeri hatalı');
      }

      // Add product to products array
      products.push({
        name,
        storageType,
        amountUnit,
        unitPrice:
          typeof unitPrice === 'number' ? unitPrice : parseFloat(unitPrice),
        taxRate: typeof taxRate === 'number' ? taxRate : parseFloat(taxRate),
      });
    }

    // Return products array
    return products;
  }
}
