import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GwaAnalyticsMetaTagService } from './gwa-tags-data.service';
import { GwaMetaTagCreator } from './gwa-meta-tag-creator.service';

describe('GwaAnalyticsMetaTagService', () => {
  let service: GwaAnalyticsMetaTagService;
  let gwaMetaTagCreatorSpy: jasmine.SpyObj<GwaMetaTagCreator>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const metaTagCreatorSpy = jasmine.createSpyObj('GwaMetaTagCreator', ['createMetaDataTags']);
    const mockRouter = jasmine.createSpyObj('Router', [], { url: '/fleet-distribution' });

    TestBed.configureTestingModule({
      providers: [
        GwaAnalyticsMetaTagService,
        { provide: GwaMetaTagCreator, useValue: metaTagCreatorSpy },
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(GwaAnalyticsMetaTagService);
    gwaMetaTagCreatorSpy = TestBed.inject(GwaMetaTagCreator) as jasmine.SpyObj<GwaMetaTagCreator>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUserData', () => {
    it('should set user data correctly', () => {
      service.setUserData('test-user-id', 'test-account');

      service.trackCurrentPage();

      expect(gwaMetaTagCreatorSpy.createMetaDataTags).toHaveBeenCalled();
      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userIdTag = tags.find(t => t.name === 'gwa_userId');
      const accountTag = tags.find(t => t.name === 'gwa_account');

      expect(userIdTag?.value).toBe('test-user-id');
      expect(accountTag?.value).toBe('test-account');
    });

    it('should trim whitespace from user data', () => {
      service.setUserData('  user-id  ', '  account  ');

      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userIdTag = tags.find(t => t.name === 'gwa_userId');
      const accountTag = tags.find(t => t.name === 'gwa_account');

      expect(userIdTag?.value).toBe('user-id');
      expect(accountTag?.value).toBe('account');
    });

    it('should handle null/undefined user data', () => {
      service.setUserData(null as any, undefined as any);

      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userIdTag = tags.find(t => t.name === 'gwa_userId');
      const accountTag = tags.find(t => t.name === 'gwa_account');

      expect(userIdTag?.value).toBe('');
      expect(accountTag?.value).toBe('');
    });

    it('should handle empty string user data', () => {
      service.setUserData('', '');

      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userIdTag = tags.find(t => t.name === 'gwa_userId');
      const accountTag = tags.find(t => t.name === 'gwa_account');

      expect(userIdTag?.value).toBe('');
      expect(accountTag?.value).toBe('');
    });
  });

  describe('trackCurrentPage', () => {
    it('should call gwaMetaTagCreator with correct tags', () => {
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      expect(gwaMetaTagCreatorSpy.createMetaDataTags).toHaveBeenCalled();
      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.length).toBe(8);
      expect(tags.find(t => t.name === 'gwa_account')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_siteSection1')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_contentType')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_contentTitle')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_pageName')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_authStatus')).toBeTruthy();
      expect(tags.find(t => t.name === 'gwa_userId')).toBeTruthy();
    });

    it('should create correct tag values for fleet-distribution route', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/fleet-distribution', configurable: true });
      service.setUserData('TEST-USER', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_siteSection1')?.value).toBe('fleet insights');
      expect(tags.find(t => t.name === 'gwa_contentType')?.value).toBe('fleet insights');
      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('fleet distribution');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|fleet distribution');
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')?.value).toBe('fleet insights|fleet distribution');
      expect(tags.find(t => t.name === 'gwa_authStatus')?.value).toBe('logged in');
    });

    it('should create correct tag values for fleet-trends route', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/fleet-trends', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('fleet trends');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|fleet trends');
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')?.value).toBe('fleet insights|fleet trends');
    });

    it('should create correct tag values for market-activity route', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/market-activity', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('market activity');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|market activity');
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')?.value).toBe('fleet insights|market activity');
    });

    it('should create correct tag values for asset-ai route', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/asset-ai', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('asset ai');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|asset ai');
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')?.value).toBe('fleet insights|asset ai');
    });

    it('should use default values for unknown routes', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/unknown-route', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('fleet insights page');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|fleet insights page');
      expect(tags.find(t => t.name === 'gwa_contentHierarchy')?.value).toBe('fleet insights|fleet insights page');
    });

    it('should handle routes with query parameters', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/fleet-trends?filter=active', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('fleet trends');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|fleet trends');
    });

    it('should handle routes with fragments', () => {
      Object.defineProperty(routerSpy, 'url', { value: '/fleet-distribution#section1', configurable: true });
      service.setUserData('test-user', 'test-account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];

      expect(tags.find(t => t.name === 'gwa_contentTitle')?.value).toBe('fleet distribution');
      expect(tags.find(t => t.name === 'gwa_pageName')?.value).toBe('fleet insights|fleet distribution');
    });

    it('should lowercase userId only', () => {
      service.setUserData('TEST-USER-ID', 'TEST-ACCOUNT');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userIdTag = tags.find(t => t.name === 'gwa_userId');
      const accountTag = tags.find(t => t.name === 'gwa_account');

      expect(userIdTag?.value).toBe('test-user-id');
      expect(accountTag?.value).toBe('TEST-ACCOUNT');
    });

    it('should not crash when router.url is invalid', () => {
      Object.defineProperty(routerSpy, 'url', { value: null });
      service.trackCurrentPage();
      expect(gwaMetaTagCreatorSpy.createMetaDataTags).not.toHaveBeenCalled();
    });

    it('should not crash when router.url is undefined', () => {
      Object.defineProperty(routerSpy, 'url', { value: undefined });
      service.trackCurrentPage();
      expect(gwaMetaTagCreatorSpy.createMetaDataTags).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      gwaMetaTagCreatorSpy.createMetaDataTags.and.throwError('Test error');

      expect(() => service.trackCurrentPage()).not.toThrow();
    });

    it('should handle null values in tag data', () => {
      service.setUserData(null as any, null as any);
      service.trackCurrentPage();

      expect(gwaMetaTagCreatorSpy.createMetaDataTags).toHaveBeenCalled();
      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      tags.forEach(tag => {
        expect(tag.value).toBeDefined();
        expect(typeof tag.value).toBe('string');
      });
    });
  });

  describe('tag structure', () => {
    it('should create all required page tags', () => {
      service.setUserData('user', 'account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const pageTagNames = ['gwa_account', 'gwa_siteSection1', 'gwa_contentType', 'gwa_contentTitle', 'gwa_pageName', 'gwa_contentHierarchy'];

      pageTagNames.forEach(name => {
        const tag = tags.find(t => t.name === name);
        expect(tag).toBeTruthy(`Expected tag ${name} to exist`);
        expect(tag?.value).toBeDefined();
      });
    });

    it('should create all required user tags', () => {
      service.setUserData('user', 'account');
      service.trackCurrentPage();

      const tags = gwaMetaTagCreatorSpy.createMetaDataTags.calls.mostRecent().args[0];
      const userTagNames = ['gwa_authStatus', 'gwa_userId'];

      userTagNames.forEach(name => {
        const tag = tags.find(t => t.name === name);
        expect(tag).toBeTruthy(`Expected tag ${name} to exist`);
        expect(tag?.value).toBeDefined();
      });
    });
  });

  describe('processGwaTagsForTracking integration', () => {
    let mockWindow: any;

    beforeEach(() => {
      mockWindow = {
        gwa_resetSiteCatalystEvents: jasmine.createSpy('gwa_resetSiteCatalystEvents'),
        gwa_SetMetaValue: jasmine.createSpy('gwa_SetMetaValue'),
        gwa_trackPageView: jasmine.createSpy('gwa_trackPageView')
      };

      (window as any).gwa_resetSiteCatalystEvents = mockWindow.gwa_resetSiteCatalystEvents;
      (window as any).gwa_SetMetaValue = mockWindow.gwa_SetMetaValue;
      (window as any).gwa_trackPageView = mockWindow.gwa_trackPageView;
    });

    afterEach(() => {
      delete (window as any).gwa_resetSiteCatalystEvents;
      delete (window as any).gwa_SetMetaValue;
      delete (window as any).gwa_trackPageView;
    });

    it('should not call GWA functions when they do not exist', () => {
      delete (window as any).gwa_resetSiteCatalystEvents;

      service.setUserData('user', 'account');
      service.trackCurrentPage();

      expect(mockWindow.gwa_SetMetaValue).not.toHaveBeenCalled();
      expect(mockWindow.gwa_trackPageView).not.toHaveBeenCalled();
    });

    it('should call GWA functions in correct order when they exist', fakeAsync(() => {
      service.setUserData('user', 'account');
      service.trackCurrentPage();

      expect(mockWindow.gwa_resetSiteCatalystEvents).toHaveBeenCalled();
      expect(mockWindow.gwa_SetMetaValue).toHaveBeenCalled();

      tick(500);

      expect(mockWindow.gwa_trackPageView).toHaveBeenCalled();
    }));
  });
});
