import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrder } from './create-order.component';

describe('CreateOrder', () => {
  let component: CreateOrder;
  let fixture: ComponentFixture<CreateOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
