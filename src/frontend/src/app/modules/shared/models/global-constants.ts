import { HttpContextToken } from '@angular/common/http';

export class GlobalConstants {
  static readonly textFilterDebounceTime = 1000;
  static readonly globalHeaderSrc = 'https://airframe-static.cirium.com/global-header/v3.1.48/index.js';
  static readonly skipFailedRequestInterceptor = new HttpContextToken<boolean>(() => false);
}
