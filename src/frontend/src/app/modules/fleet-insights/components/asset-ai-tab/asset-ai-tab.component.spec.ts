import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetAiTabComponent } from './asset-ai-tab.component';

describe('AssetAiTabComponent', () => {
  let fixture: ComponentFixture<AssetAiTabComponent>;
  let component: AssetAiTabComponent;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetAiTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetAiTabComponent);
    component = fixture.componentInstance;
    nativeEl = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct assetAiBetaUrl value', () => {
    expect(component.assetAiBetaUrl).toBe(
      'https://www.cirium.com/analytics-services/asset-ai-beta-program/?cmpid=prd|all|CIAPS_202508_glob_mul|Ascend-and-Asset-AI-trial_m&sfid=701dP00000Uio1UQAR'
    );
  });
});
