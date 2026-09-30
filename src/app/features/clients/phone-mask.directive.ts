import { AsYouType } from 'libphonenumber-js';
import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appPhoneMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneMaskDirective),
      multi: true,
    },
  ],
})
export class PhoneMaskDirective implements ControlValueAccessor {
  private readonly input = inject(ElementRef<HTMLInputElement>).nativeElement;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.input.value = this.format(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.input.disabled = isDisabled;
  }

  @HostListener('input')
  onInput(): void {
    const cursor = this.input.selectionStart ?? this.input.value.length;
    const digitsBeforeCursor = this.input.value.slice(0, cursor).replace(/\D/g, '').length;
    const formatted = this.format(this.input.value);

    this.input.value = formatted;
    this.onChange(formatted);

    const nextCursor = this.cursorAfterDigits(formatted, digitsBeforeCursor);
    this.input.setSelectionRange(nextCursor, nextCursor);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private format(value: string): string {
    return value ? new AsYouType().input(value) : '';
  }

  private cursorAfterDigits(value: string, digitCount: number): number {
    if (digitCount === 0) {
      return value.startsWith('+') ? 1 : 0;
    }

    let digitsSeen = 0;
    for (let index = 0; index < value.length; index += 1) {
      if (/\d/.test(value[index])) {
        digitsSeen += 1;
        if (digitsSeen === digitCount) {
          return index + 1;
        }
      }
    }

    return value.length;
  }
}