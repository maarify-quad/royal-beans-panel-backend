import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ShopifyApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ShopifyApiService.name);

  async get<T>(
    path: string,
    params?: { [key: string]: string },
    query?: { [key: string]: string },
  ): Promise<T> {
    const apiURL = this.getApiURL(path);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        apiURL.searchParams.set(key, value);
      });
    }
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        apiURL.searchParams.set(key, value);
      });
    }
    const { data } = await firstValueFrom(
      this.httpService.get(apiURL.toString()).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          throw 'An error happened! (getProducts)';
        }),
      ),
    );
    return data;
  }

  getApiURL(path: string) {
    const username = this.configService.get('SHOPIFY_USERNAME');
    const password = this.configService.get('SHOPIFY_PASSWORD');
    const store = this.configService.get('SHOPIFY_STORE');
    return new URL(
      `https://${username}:${password}@${store}.myshopify.com/admin/api/2023-01/${path}`,
    );
  }
}
