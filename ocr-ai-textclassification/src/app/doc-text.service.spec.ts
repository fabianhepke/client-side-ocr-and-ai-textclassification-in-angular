import { TestBed } from '@angular/core/testing';

import { DocTextService } from './doc-text.service';

describe('DocTextService', () => {
  let service: DocTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
