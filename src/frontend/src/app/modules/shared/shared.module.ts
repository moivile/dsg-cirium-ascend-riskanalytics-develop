import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from './components/logout.component';
import { PortfoliosFooterComponent } from './components/portfolios-footer/portfolios-footer.component';
import { ProfileService } from './services/profile.service';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './services/confirmation-dialog.service';
import { NoticeComponent } from './components/notice/notice.component';
import { NoticeService } from './services/notice.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FailedRequestInterceptor } from './services/failed-request-interceptor';
import { RouterLink } from '@angular/router';
import { ExportExcelService } from './services/export-excel-service';
import { ErrorNotFoundComponent } from './components/error-not-found/error-not-found.component';
import { BooleanToWordPipe } from './pipes/boolean-to-word.pipe';

@NgModule({
  declarations: [
    LogoutComponent,
    PortfoliosFooterComponent,
    ConfirmationDialogComponent,
    NoticeComponent,
    ErrorNotFoundComponent,
    BooleanToWordPipe
  ],
  imports: [CommonModule, RouterLink],
  exports: [PortfoliosFooterComponent, NoticeComponent, BooleanToWordPipe],
  providers: [
    ProfileService,
    ConfirmationDialogService,
    NoticeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FailedRequestInterceptor,
      multi: true
    },
    ExportExcelService,
    ErrorNotFoundComponent
  ]
})
export class SharedModule {}
