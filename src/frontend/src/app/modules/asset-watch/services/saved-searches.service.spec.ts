import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SavedSearchesService } from './saved-searches.service';
import { SavedSearchModel } from '../models/saved-search-model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [SavedSearchesService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SavedSearchesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('getSavedSearch should form a correct request', () => {
    const testId = 1;
    const expectedUrl = `/api/searches/${testId}`;

    const mockResponse: SavedSearchModel = {
      id: testId,
      name: 'Test Search'
    } as SavedSearchModel;

    service.getSavedSearch(testId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(expectedUrl);

    expect(req.request.method).toEqual('GET');

    req.flush(mockResponse);
  });
});
