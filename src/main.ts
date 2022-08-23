import * as cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT);

  console.log('TYPORM_SYNC: ', process.env.TYPEORM_SYNC);
  console.log(
    `Royal Beans Panel Backend is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`,
  );
}
bootstrap();
