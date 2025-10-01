import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PracticePrompt {
  id: string;
  question: string;
  userNotes: string;
  completed: boolean;
}

export interface PracticeProgress {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

@Component({
  selector: 'app-practice-prompts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="practice-prompts-card">
      <div class="practice-header">
        <h2 class="practice-title">📚 Practice Prompts</h2>
        <div class="practice-subtitle">
          Interactive exercises to deepen your P&L understanding
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-label">
          <strong>Progress:</strong> {{ progress.completedCount }}/{{ progress.totalCount }} completed
        </div>
        <div class="progress-bar">
          <div 
            class="progress-segments"
            [attr.data-completed]="progress.completedCount"
          >
            <div 
              *ngFor="let segment of progressSegments; trackBy: trackByIndex"
              class="progress-segment"
              [class.completed]="segment <= progress.completedCount"
              [class.partial]="progress.completedCount > 0 && segment > progress.completedCount"
              [class.empty]="progress.completedCount === 0"
            ></div>
          </div>
        </div>
        <div 
          *ngIf="progress.completionPercentage === 100" 
          class="completion-message"
        >
          🎉 All practice questions complete! ✅
        </div>
      </div>

      <!-- Practice Questions -->
      <div class="practice-questions">
        <div 
          *ngFor="let prompt of prompts; trackBy: trackByPromptId" 
          class="practice-question"
          [class.completed]="prompt.completed"
        >
          <div class="question-header">
            <div class="question-number">{{ getQuestionNumber(prompt.id) }}</div>
            <div class="question-text">{{ prompt.question }}</div>
            <div class="completion-indicator">
              {{ prompt.completed ? '✅' : '⭕' }}
            </div>
          </div>
          
          <div class="notes-section">
            <label [for]="'notes-' + prompt.id" class="notes-label">
              Your notes:
            </label>
            <textarea
              [id]="'notes-' + prompt.id"
              [(ngModel)]="prompt.userNotes"
              (ngModelChange)="onNotesChange(prompt)"
              placeholder="Enter your observations and insights here..."
              class="notes-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Business Insights -->
      <div class="business-insights">
        <h3 class="insights-title">💡 Key Learning Objectives</h3>
        <ul class="insights-list">
          <li>Understand how small changes compound into larger revenue impacts</li>
          <li>Identify the relationship between different P&L components</li>
          <li>Practice scenario planning and trade-off analysis</li>
          <li>Develop intuition for realistic vs. optimistic projections</li>
          <li>Learn expense prioritization and cost control strategies</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .practice-prompts-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .practice-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f59e0b;
    }

    .practice-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 0.5rem;
    }

    .practice-subtitle {
      color: #a16207;
      font-style: italic;
    }

    .progress-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #fef3c7;
      border-radius: 8px;
      border: 1px solid #f59e0b;
    }

    .progress-label {
      font-size: 0.9rem;
      color: #92400e;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      margin-bottom: 0.5rem;
    }

    .progress-segments {
      display: flex;
      gap: 4px;
      height: 20px;
    }

    .progress-segment {
      flex: 1;
      border-radius: 4px;
      border: 1px solid #d1d5db;
      transition: all 0.3s ease;
    }

    .progress-segment.completed {
      background-color: #10b981;
      border-color: #059669;
    }

    .progress-segment.partial {
      background-color: #f59e0b;
      border-color: #d97706;
    }

    .progress-segment.empty {
      background-color: #ef4444;
      border-color: #dc2626;
    }

    .completion-message {
      font-weight: 600;
      color: #059669;
      text-align: center;
      padding: 0.5rem;
      background-color: #d1fae5;
      border-radius: 6px;
      border: 1px solid #10b981;
    }

    .practice-questions {
      margin-bottom: 2rem;
    }

    .practice-question {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #fafafa;
      transition: all 0.3s ease;
    }

    .practice-question.completed {
      background-color: #f0fdf4;
      border-color: #10b981;
    }

    .question-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .question-number {
      font-weight: 700;
      color: #6b7280;
      background-color: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 50%;
      min-width: 32px;
      text-align: center;
      font-size: 0.9rem;
    }

    .question-text {
      font-weight: 500;
      color: #374151;
      line-height: 1.5;
    }

    .completion-indicator {
      font-size: 1.2rem;
    }

    .notes-section {
      margin-left: 3rem;
    }

    .notes-label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: #4b5563;
      margin-bottom: 0.5rem;
    }

    .notes-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 80px;
      transition: border-color 0.2s ease;
    }

    .notes-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .business-insights {
      padding: 1.5rem;
      background-color: #fef9e7;
      border-radius: 8px;
      border: 1px solid #fcd34d;
    }

    .insights-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #a16207;
      margin-bottom: 1rem;
    }

    .insights-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .insights-list li {
      padding: 0.5rem 0;
      color: #a16207;
      position: relative;
      padding-left: 1.5rem;
    }

    .insights-list li::before {
      content: "💡";
      position: absolute;
      left: 0;
      top: 0.5rem;
    }
  `]
})
export class PracticePromptsComponent {
  @Input() prompts: PracticePrompt[] = this.getDefaultPrompts();
  @Output() promptsChange = new EventEmitter<PracticePrompt[]>();
  @Output() progressChange = new EventEmitter<PracticeProgress>();

  readonly progressSegments = [1, 2, 3, 4, 5]; // 5 segments for visual progress

  get progress(): PracticeProgress {
    const completedCount = this.prompts.filter(p => p.completed).length;
    const totalCount = this.prompts.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    return {
      completedCount,
      totalCount,
      completionPercentage
    };
  }

  onNotesChange(prompt: PracticePrompt): void {
    // Auto-mark as completed if user has entered notes
    const wasCompleted = prompt.completed;
    prompt.completed = prompt.userNotes.trim().length > 0;
    
    // Emit changes
    this.promptsChange.emit(this.prompts);
    
    // Emit progress change if completion status changed
    if (wasCompleted !== prompt.completed) {
      this.progressChange.emit(this.progress);
    }
  }

  getQuestionNumber(promptId: string): string {
    const index = this.prompts.findIndex(p => p.id === promptId);
    return (index + 1).toString();
  }

  trackByPromptId(index: number, prompt: PracticePrompt): string {
    return prompt.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private getDefaultPrompts(): PracticePrompt[] {
    // Practice prompts from Python Excel tool
    return [
      {
        id: 'prompt-1',
        question: 'Increase return count by 10% — note the change in Net Income.',
        userNotes: '',
        completed: false
      },
      {
        id: 'prompt-2', 
        question: 'Raise ANF by $5 — what happens to Net Margin %?',
        userNotes: '',
        completed: false
      },
      {
        id: 'prompt-3',
        question: 'Cost per Return is Yellow — which two expenses would you reduce first?',
        userNotes: '',
        completed: false
      },
      {
        id: 'prompt-4',
        question: 'Reduce Advertising by 2% — what is the trade‑off to returns?',
        userNotes: '',
        completed: false
      },
      {
        id: 'prompt-5',
        question: 'Compare Good vs Best — which is realistic for 2026 and why?',
        userNotes: '',
        completed: false
      }
    ];
  }
}
