import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../../services/app-config.service';
import { SettingsService } from '../../../../services/settings.service';
import { ProjectedService, Scenario } from '../../../../services/projected.service';
import { AnalysisBlockComponent } from '../../../../components/analysis-block/analysis-block.component';
import { FEATURE_FLAGS } from '../../../../core/tokens/feature-flags.token';
import { inject } from '@angular/core';
import { AnalysisDataAssemblerService } from '../../../../domain/services/analysis-data-assembler.service';

@Component({
  selector: 'app-projected-income-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalysisBlockComponent],
  templateUrl: './projected-income-drivers.component.html',
  styleUrls: ['./projected-income-drivers.component.scss'],
})
export class ProjectedIncomeDriversComponent {
  constructor(
    public appCfg: AppConfigService,
    public settings: SettingsService,
    public projSvc: ProjectedService
  ) {}

  scenarios: Scenario[] = ['Custom', 'Good', 'Better', 'Best'];

  private readonly flags = inject(FEATURE_FLAGS);
  private readonly assembler = inject(AnalysisDataAssemblerService);

  get showAnalysis(): boolean {
    return this.flags.showAnalysisBlock === true;
  }

  get analysisData() {
    return this.assembler.buildProjectedVsPresets();
  }
}
