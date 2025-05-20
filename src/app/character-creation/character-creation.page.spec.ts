import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterCreationPage } from './character-creation.page';

describe('CharacterCreationPage', () => {
  let component: CharacterCreationPage;
  let fixture: ComponentFixture<CharacterCreationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterCreationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
