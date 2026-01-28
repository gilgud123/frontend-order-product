import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRevenue } from './customer-revenue.component';

describe('CustomerRevenue', () => {
  let component: CustomerRevenue;
  let fixture: ComponentFixture<CustomerRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRevenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
