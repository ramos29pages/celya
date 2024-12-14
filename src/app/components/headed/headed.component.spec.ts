import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadedComponent } from './headed.component';

describe('HeadedComponent', () => {
  let component: HeadedComponent;
  let fixture: ComponentFixture<HeadedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
