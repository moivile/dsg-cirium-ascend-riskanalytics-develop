import { Component } from '@angular/core';

@Component({
  selector: 'ra-asset-ai-tab',
  templateUrl: './asset-ai-tab.component.html',
  styleUrls: ['./asset-ai-tab.component.scss'],
  standalone: false
})
export class AssetAiTabComponent {
  readonly assetAiBetaUrl: string =
    'https://www.cirium.com/analytics-services/asset-ai-beta-program/?cmpid=prd|all|CIAPS_202508_glob_mul|Ascend-and-Asset-AI-trial_m&sfid=701dP00000Uio1UQAR';
}
