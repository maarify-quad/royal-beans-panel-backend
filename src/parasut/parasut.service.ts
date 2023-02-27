import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class ParasutService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.httpService.axiosRef.interceptors.request.use(async (config) => {
      config.headers['Content-Type'] = 'application/json';
      // If it is not a token request, add the access token to the header
      if (!config.url?.includes('oauth/token')) {
        if (this.expiresIn && this.expiresIn.isBefore(dayjs())) {
          await this.refreshAccessToken();
        }
        if (!this.accessToken) {
          await this.getAccessToken();
        }
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  private accessToken = '';
  private refreshToken = '';
  private expiresIn: dayjs.Dayjs | null = null;
  private readonly logger = new Logger(ParasutService.name);

  async getAccessToken() {
    const url = this.getOAuthURL();
    const { data } = await firstValueFrom(
      this.httpService.post<OAuthResponse>(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error);
          throw new InternalServerErrorException(
            'Parasut Error (getAccessToken)',
          );
        }),
      ),
    );
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresIn = dayjs().add(data.expires_in - 120, 'second');
  }

  async refreshAccessToken() {
    const url = this.getOAuthURLWithRefreshToken();
    const { data } = await firstValueFrom(
      this.httpService.post<OAuthResponse>(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error);
          throw new InternalServerErrorException(
            'Parasut Error (refreshAccessToken)',
          );
        }),
      ),
    );
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresIn = dayjs().add(data.expires_in - 120, 'second');
  }

  async getContactById(id: string) {
    const url = `${this.getBaseURL()}/contacts/${id}`;
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error);
          throw new InternalServerErrorException(
            'Parasut Error (getContactByEmail)',
          );
        }),
      ),
    );
    return data.data;
  }

  async filterProductsByName(name: string) {
    const encodedName = encodeURIComponent(name.trim());
    const url = `${this.getBaseURL()}/products?filter[name]=${encodedName}`;
    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error);
          throw new InternalServerErrorException(
            'Parasut Error (getProductByName)',
          );
        }),
      ),
    );
    return data.data;
  }

  async createSalesInvoice(invoice: any) {
    const url = `${this.getBaseURL()}/sales_invoices`;
    const { data } = await firstValueFrom(
      this.httpService.post(url, invoice).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data || error);
          throw new InternalServerErrorException(
            'Parasut Error (createSalesInvoice)',
          );
        }),
      ),
    );
    return data;
  }

  getBaseURL() {
    const baseURL = this.configService.get('PARASUT_BASE_URL');
    const companyId = this.configService.get('PARASUT_COMPANY_ID');
    return `${baseURL}/v4/${companyId}`;
  }

  getOAuthURL() {
    const baseURL = this.configService.get('PARASUT_BASE_URL');
    const clientId = this.configService.get('PARASUT_CLIENT_ID');
    const username = this.configService.get('PARASUT_USERNAME');
    const password = this.configService.get('PARASUT_PASSWORD');
    return `${baseURL}/oauth/token?client_id=${clientId}&username=${username}&password=${password}&grant_type=password&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
  }

  getOAuthURLWithRefreshToken() {
    const baseURL = this.configService.get('PARASUT_BASE_URL');
    const clientId = this.configService.get('PARASUT_CLIENT_ID');
    return `${baseURL}/oauth/token?client_id=${clientId}&grant_type=refresh_token&refresh_token=${this.refreshToken}`;
  }
}

interface OAuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_token: string;
}
