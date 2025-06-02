import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MazmorraPage } from './mazmorra.page';

describe('MazmorraPage', () => {
  let component: MazmorraPage;
  let fixture: ComponentFixture<MazmorraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MazmorraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
