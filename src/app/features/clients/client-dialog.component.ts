import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

export type ClientDialogData =
  | {
      kind: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      cancelLabel: string;
    }
  | {
      kind: 'message';
      title: string;
      message: string;
      confirmLabel: string;
    };

@Component({
  selector: 'app-client-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (data.kind === 'confirm') {
        <button mat-button type="button" (click)="dialogRef.close(false)">
          {{ data.cancelLabel }}
        </button>
        <button mat-flat-button color="warn" type="button" (click)="dialogRef.close(true)">
          {{ data.confirmLabel }}
        </button>
      } @else {
        <button mat-flat-button color="primary" type="button" (click)="dialogRef.close(false)">
          {{ data.confirmLabel }}
        </button>
      }
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDialogComponent {
  readonly data = inject<ClientDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ClientDialogComponent, boolean>);
}