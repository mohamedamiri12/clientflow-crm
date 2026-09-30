import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { PhoneMaskDirective } from './phone-mask.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PhoneMaskDirective],
  template: '<input type="tel" [formControl]="phone" appPhoneMask />',
})
class PhoneMaskHostComponent {
  readonly phone = new FormControl('', { nonNullable: true });
}

describe('PhoneMaskDirective', () => {
  it('formats international numbers and keeps the form value in sync', async () => {
    await TestBed.configureTestingModule({ imports: [PhoneMaskHostComponent] }).compileComponents();

    const fixture = TestBed.createComponent(PhoneMaskHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '+212661234567';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('+212 6 61 23 45 67');
    expect(fixture.componentInstance.phone.value).toBe(input.value);
  });

  it('does not guess a country for a national number', async () => {
    await TestBed.configureTestingModule({ imports: [PhoneMaskHostComponent] }).compileComponents();

    const fixture = TestBed.createComponent(PhoneMaskHostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = '0624273882';
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe('0624273882');
    expect(fixture.componentInstance.phone.value).toBe('0624273882');
  });
});