import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnalyticsService } from './analytics-service';
import { AppConfigService } from '../../../app-config.service';
import { ScriptInjectorService } from './script-injector.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let scriptInjectorSpy: jasmine.SpyObj<ScriptInjectorService>;
  let appConfigServiceMock: any;

  beforeEach(() => {
    const scriptSpy = jasmine.createSpyObj('ScriptInjectorService', ['load']);
    appConfigServiceMock = {
      configuration: {
        adobeLaunchScriptUrl: 'https://test-adobe-url.js',
        fullStoryOrganisationId: 'test-org-id'
      }
    };

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: ScriptInjectorService, useValue: scriptSpy },
        { provide: AppConfigService, useValue: appConfigServiceMock }
      ]
    });

    service = TestBed.inject(AnalyticsService);
    scriptInjectorSpy = TestBed.inject(ScriptInjectorService) as jasmine.SpyObj<ScriptInjectorService>;

    (window as any)['_satellite'] = {
      pageBottom: jasmine.createSpy('pageBottom')
    };
  });

  afterEach(() => {
    delete (window as any)['_satellite'];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('injectAdobeLaunchScript', () => {
    it('should inject Adobe Launch script with correct URL', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise = service.injectAdobeLaunchScript();
      tick(100);
      await promise;

      expect(scriptInjectorSpy.load).toHaveBeenCalledTimes(1);

      const firstCall = scriptInjectorSpy.load.calls.first().args[0];
      expect(firstCall).toContain(jasmine.objectContaining({ name: 'id', value: 'adobeLaunch' }));
      expect(firstCall).toContain(jasmine.objectContaining({ name: 'src', value: 'https://test-adobe-url.js' }));
      expect(firstCall).toContain(jasmine.objectContaining({ name: 'async', value: 'true' }));
    }));

    it('should call _satellite.pageBottom() after script loads', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise = service.injectAdobeLaunchScript();
      tick(150);
      await promise;

      expect((window as any)['_satellite'].pageBottom).toHaveBeenCalled();
    }));

    it('should load scripts in correct order', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise = service.injectAdobeLaunchScript();
      tick(150);
      await promise;

      expect(scriptInjectorSpy.load).toHaveBeenCalledTimes(1);

      const firstCallId = scriptInjectorSpy.load.calls.first().args[0].find((attr: any) => attr.name === 'id');

      expect(firstCallId?.value).toBe('adobeLaunch');
    }));

    it('should add async attribute to Adobe Launch script', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise = service.injectAdobeLaunchScript();
      tick(150);
      await promise;

      const firstCall = scriptInjectorSpy.load.calls.first().args[0];
      const asyncAttr = firstCall.find((attr: any) => attr.name === 'async');

      expect(asyncAttr).toBeTruthy();
      expect(asyncAttr?.value).toBe('true');
    }));

    it('should handle script injection errors', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.reject(new Error('Script load failed')));

      await expectAsync(service.injectAdobeLaunchScript()).toBeRejected();
      tick();
    }));

    it('should use configured Adobe Launch URL', fakeAsync(async () => {
      appConfigServiceMock.configuration.adobeLaunchScriptUrl = 'https://custom-adobe-url.js';
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise = service.injectAdobeLaunchScript();
      tick(150);
      await promise;

      const firstCall = scriptInjectorSpy.load.calls.first().args[0];
      const srcAttr = firstCall.find((attr: any) => attr.name === 'src');

      expect(srcAttr?.value).toBe('https://custom-adobe-url.js');
    }));

    it('should not inject satellite call if first script fails', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.reject(new Error('Failed')));

      try {
        await service.injectAdobeLaunchScript();
      } catch (error) {
        expect(scriptInjectorSpy.load).toHaveBeenCalledTimes(1);
      }
      tick();
    }));

    it('should not inject Adobe Launch script twice if already loaded', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      const promise1 = service.injectAdobeLaunchScript();
      tick(150);
      await promise1;

      await service.injectAdobeLaunchScript();

      expect(scriptInjectorSpy.load).toHaveBeenCalledTimes(1);
    }));

    it('should allow retry after failed injection', fakeAsync(async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.reject(new Error('Failed')));

      try {
        await service.injectAdobeLaunchScript();
      } catch (error) {
      }
      tick();

      scriptInjectorSpy.load.and.returnValue(Promise.resolve());
      const promise = service.injectAdobeLaunchScript();
      tick(150);
      await promise;

      expect(scriptInjectorSpy.load).toHaveBeenCalledTimes(2);
    }));
  });

  describe('injectFullStoryScript', () => {
    it('should inject FullStory script with user ID', async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      await service.injectFullStoryScript('test-user-123');

      expect(scriptInjectorSpy.load).toHaveBeenCalled();
      const callArgs = scriptInjectorSpy.load.calls.first().args[0];
      const textAttr = callArgs.find((attr: any) => attr.name === 'text');

      expect(textAttr?.value).toContain('test-user-123');
      expect(textAttr?.value).toContain('FS.identify(\'test-user-123\'');
    });

    it('should use configured FullStory organization ID', async () => {
      scriptInjectorSpy.load.and.returnValue(Promise.resolve());

      await service.injectFullStoryScript('user-id');

      const callArgs = scriptInjectorSpy.load.calls.first().args[0];
      const textAttr = callArgs.find((attr: any) => attr.name === 'text');

      expect(textAttr?.value).toContain('test-org-id');
    });
  });
});
