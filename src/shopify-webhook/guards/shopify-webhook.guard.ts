import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createHmac } from 'crypto';

@Injectable()
export class ShopifyWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: WebhookRequest = context.switchToHttp().getRequest();
    const shopifyWebhookKey = this.configService.get('SHOPIFY_WEBHOOK_KEY');

    const hmac = request.headers['x-shopify-hmac-sha256'] as string;
    const topic = request.headers['x-shopify-topic'] as string;

    if (!hmac || !topic || !VALID_TOPICS.includes(topic)) {
      return false;
    }

    const data = request.rawBody.toString();
    const generatedHash = createHmac('sha256', shopifyWebhookKey)
      .update(data)
      .digest('base64');

    if (generatedHash !== hmac) {
      return false;
    }

    return true;
  }
}

const VALID_TOPICS = ['orders/fulfilled'];

interface WebhookRequest extends Request {
  rawBody: Buffer;
}
