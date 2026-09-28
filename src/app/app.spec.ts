import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application title and navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-toolbar')?.textContent).toContain('ClientFlow CRM');
    expect(compiled.querySelectorAll('.app-nav a').length).toBeGreaterThanOrEqual(3);
    expect(compiled.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Clients');
    expect(compiled.textContent).toContain('Follow-ups');
  });
});
