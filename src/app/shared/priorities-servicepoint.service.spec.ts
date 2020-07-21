import { TestBed } from '@angular/core/testing';

import { PrioritiesServicepointService } from './priorities-servicepoint.service';

describe('PrioritiesServicepointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrioritiesServicepointService = TestBed.get(PrioritiesServicepointService);
    expect(service).toBeTruthy();
  });
});
