import { Global, Module } from '@nestjs/common';
import { BackendI18nService } from './i18n.service';

@Global()
@Module({
  providers: [BackendI18nService],
  exports: [BackendI18nService],
})
export class I18nModule {}
