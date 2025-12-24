import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { GwaMetaTagCreator } from './gwa-meta-tag-creator.service';

describe('GwaMetaTagCreator', () => {
  let service: GwaMetaTagCreator;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GwaMetaTagCreator);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const metaTags = document.querySelectorAll('meta[name^="gwa_"], meta[name^="digitalData"]');
    metaTags.forEach(tag => tag.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createMetaDataTags', () => {
    it('should create new meta tags', () => {
      const tags = [
        { name: 'gwa_account', value: 'test-account' },
        { name: 'gwa_siteSection1', value: 'fleet insights' }
      ];

      service.createMetaDataTags(tags);

      const accountTag = document.querySelector('meta[name="gwa_account"]') as HTMLMetaElement;
      const sectionTag = document.querySelector('meta[name="gwa_siteSection1"]') as HTMLMetaElement;

      expect(accountTag).toBeTruthy();
      expect(accountTag.getAttribute('content')).toBe('test-account');
      expect(sectionTag).toBeTruthy();
      expect(sectionTag.getAttribute('content')).toBe('fleet insights');
    });

    it('should update existing meta tags when values change', () => {
      const initialTags = [{ name: 'gwa_account', value: 'old-account' }];
      service.createMetaDataTags(initialTags);

      const updatedTags = [{ name: 'gwa_account', value: 'new-account' }];
      service.createMetaDataTags(updatedTags);

      const accountTag = document.querySelector('meta[name="gwa_account"]') as HTMLMetaElement;
      expect(accountTag.getAttribute('content')).toBe('new-account');
      expect(document.querySelectorAll('meta[name="gwa_account"]').length).toBe(1);
    });

    it('should not update meta tags when values are the same', () => {
      const tags = [{ name: 'gwa_account', value: 'test-account' }];
      service.createMetaDataTags(tags);

      const initialTag = document.querySelector('meta[name="gwa_account"]') as HTMLMetaElement;
      const initialTagReference = initialTag;

      service.createMetaDataTags(tags);

      const updatedTag = document.querySelector('meta[name="gwa_account"]') as HTMLMetaElement;
      expect(updatedTag).toBe(initialTagReference);
    });

    it('should remove meta tags that are no longer present', () => {
      const initialTags = [
        { name: 'gwa_account', value: 'test-account' },
        { name: 'gwa_siteSection1', value: 'fleet insights' }
      ];
      service.createMetaDataTags(initialTags);

      const updatedTags = [{ name: 'gwa_account', value: 'test-account' }];
      service.createMetaDataTags(updatedTags);

      const accountTag = document.querySelector('meta[name="gwa_account"]');
      const sectionTag = document.querySelector('meta[name="gwa_siteSection1"]');

      expect(accountTag).toBeTruthy();
      expect(sectionTag).toBeNull();
    });

    it('should handle empty tag array', () => {
      const initialTags = [{ name: 'gwa_account', value: 'test-account' }];
      service.createMetaDataTags(initialTags);

      service.createMetaDataTags([]);

      const accountTag = document.querySelector('meta[name="gwa_account"]');
      expect(accountTag).toBeNull();
    });

    it('should handle multiple tags correctly', () => {
      const tags = [
        { name: 'gwa_account', value: 'account1' },
        { name: 'gwa_siteSection1', value: 'section1' },
        { name: 'gwa_contentType', value: 'type1' },
        { name: 'gwa_userId', value: 'user123' }
      ];

      service.createMetaDataTags(tags);

      tags.forEach(tag => {
        const metaTag = document.querySelector(`meta[name="${tag.name}"]`) as HTMLMetaElement;
        expect(metaTag).toBeTruthy();
        expect(metaTag.getAttribute('content')).toBe(tag.value);
      });
    });

    it('should handle empty string values', () => {
      const tags = [{ name: 'gwa_account', value: '' }];

      service.createMetaDataTags(tags);

      const accountTag = document.querySelector('meta[name="gwa_account"]') as HTMLMetaElement;
      expect(accountTag).toBeTruthy();
      expect(accountTag.getAttribute('content')).toBe('');
    });

    it('should handle special characters in values', () => {
      const tags = [{ name: 'gwa_contentHierarchy', value: 'fleet insights|fleet insights page' }];

      service.createMetaDataTags(tags);

      const tag = document.querySelector('meta[name="gwa_contentHierarchy"]') as HTMLMetaElement;
      expect(tag.getAttribute('content')).toBe('fleet insights|fleet insights page');
    });
  });
});
