import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

type UpsertRelationDto = {
  shopifyId: string;
  parasutIds: string | string[];
};

@Injectable()
export class ProductMappingService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ProductMappingService.name);

  private getBaseURL() {
    const baseURL = this.configService.get<string>('SHOPPAR_BASE_URL');
    if (!baseURL) {
      throw new InternalServerErrorException(
        'SHOPPAR_BASE_URL is not configured',
      );
    }
    return baseURL.replace(/\/$/, '');
  }

  private handleAxiosError(context: string) {
    return (error: AxiosError) => {
      this.logger.error(
        `${context}: ${error.response?.status ?? ''} ${
          typeof error.response?.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response?.data ?? error.message)
        }`,
      );
      const status = error.response?.status;
      if (status) {
        const message =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          'Upstream error';
        throw new HttpException(message, status);
      }
      throw new InternalServerErrorException(`${context} failed`);
    };
  }

  async listShopifyProducts() {
    const url = `${this.getBaseURL()}/admin/shopify-products`;
    const { data } = await firstValueFrom(
      this.httpService
        .get(url)
        .pipe(catchError(this.handleAxiosError('listShopifyProducts'))),
    );
    return data;
  }

  async searchParasutProducts(params: {
    query?: string;
    page?: string;
    pageSize?: string;
  }) {
    const qs = new URLSearchParams();
    if (params.query) qs.set('q', params.query);
    if (params.page) qs.set('page', params.page);
    if (params.pageSize) qs.set('pageSize', params.pageSize);

    const query = qs.toString();
    const url = `${this.getBaseURL()}/admin/parasut-products${
      query ? `?${query}` : ''
    }`;

    const { data } = await firstValueFrom(
      this.httpService
        .get(url)
        .pipe(catchError(this.handleAxiosError('searchParasutProducts'))),
    );
    return data;
  }

  async listRelations() {
    const url = `${this.getBaseURL()}/admin/relations`;
    const { data } = await firstValueFrom(
      this.httpService
        .get(url)
        .pipe(catchError(this.handleAxiosError('listRelations'))),
    );
    return data;
  }

  async upsertRelation(body: UpsertRelationDto) {
    const url = `${this.getBaseURL()}/admin/relations`;
    const { data } = await firstValueFrom(
      this.httpService
        .put(url, body)
        .pipe(catchError(this.handleAxiosError('upsertRelation'))),
    );
    return data;
  }

  async deleteRelation(shopifyId: string) {
    const url = `${this.getBaseURL()}/admin/relations/${encodeURIComponent(
      shopifyId,
    )}`;
    const { data } = await firstValueFrom(
      this.httpService
        .delete(url)
        .pipe(catchError(this.handleAxiosError('deleteRelation'))),
    );
    return data;
  }
}
