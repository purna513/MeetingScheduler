import { TestBed } from '@angular/core/testing';

import { MeetupappSocketService } from './meetupapp-socket.service';

describe('MeetupappSocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MeetupappSocketService = TestBed.get(MeetupappSocketService);
    expect(service).toBeTruthy();
  });
});
