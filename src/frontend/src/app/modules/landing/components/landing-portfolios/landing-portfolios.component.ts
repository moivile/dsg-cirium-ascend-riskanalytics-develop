import { OnInit, Component, OnDestroy } from '@angular/core';
import { Portfolio } from '../../../shared/models/portfolio';
import { combineLatest, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { ConfirmationDialogOptions } from '../../../shared/models/confirmation-dialog-options';
import dayjs from 'dayjs';
import { Router } from '@angular/router';
import { AppStore } from 'src/app/app-store';

@Component({
    selector: 'ra-landing-portfolios',
    templateUrl: './landing-portfolios.component.html',
    styleUrls: ['./landing-portfolios.component.scss'],
    standalone: false
})
export class LandingPortfoliosComponent implements OnInit, OnDestroy {
  filteredPortfolios$!: Observable<Portfolio[]>;
  numberOfPortfolios$!: Observable<number>;
  dayjs: any = dayjs;
  textFilterControl = new FormControl('', { nonNullable: true });
  private confirmDeletePortfolioSubscription: Subscription | undefined;

  constructor(
    public readonly appStore: AppStore,
    private readonly dialogService: ConfirmationDialogService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.filteredPortfolios$ = combineLatest([this.appStore.portfolios$, this.textFilterControl.valueChanges.pipe(startWith(''))]).pipe(
      map(
        ([allPortfolios, textFilterValue]: [Portfolio[], string]) =>
          [allPortfolios, textFilterValue.trim().toLowerCase()] as [Portfolio[], string]
      ),
      map(([allPortfolios, textFilterValue]: [Portfolio[], string]) =>
        allPortfolios.filter((portfolio) => {
          const portfolioName = portfolio.name.toLowerCase();
          return portfolioName.includes(textFilterValue);
        })
      )
    );
  }

  openDeletePortfolioDialog(portfolio: Portfolio): void {
    const confirmOptions: ConfirmationDialogOptions = {
      body: `<p>You are about to delete ${portfolio.name}. Deleting this portfolio is
      permanent and you will not be able to recover this portfolio once deleted.</p>
      <p>Are you sure?</p>`,
      okButtonText: 'Yes, delete',
      styleClass: 'delete-portfolio',
      header: `Delete ${portfolio.name}`
    };

    this.confirmDeletePortfolioSubscription = this.dialogService
      .confirm(confirmOptions)
      .pipe(tap(() => this.appStore.deletePortfolio(portfolio)))
      .subscribe();
  }

  onEditPortfolioClick(portfolio: Portfolio): void {
    this.router.navigate(['portfolios', portfolio.id, 'edit']);
  }

  ngOnDestroy(): void {
    this.confirmDeletePortfolioSubscription?.unsubscribe();
  }
}
