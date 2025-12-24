import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GwaMetaTagCreator } from './gwa-meta-tag-creator.service';

interface GwaDataConfig {
  page: {
    account: string;
    siteSection1: string;
    contentType: string;
    contentTitle: string;
    pageName: string;
    contentHierarchy: string;
  };
  user: {
    authStatus: string;
    userId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GwaAnalyticsMetaTagService {
  private readonly router = inject(Router);
  private readonly gwaMetaTagCreator = inject(GwaMetaTagCreator);

  private currentUserId = '';
  private currentGwaAccount = '';
  private loggedInStatus = 'logged in';
  private siteName = 'fleet insights';
  private gwaTags: { name: string; value: string }[] = [];

  setUserData(userId: string, gwaAccount: string): void {
    this.currentUserId = userId?.trim() || '';
    this.currentGwaAccount = gwaAccount?.trim() || '';
  }

  trackCurrentPage(): void {
    try {
      if (!this.router) {
        return;
      }

      const url = this.router.url;

      if (!url || typeof url !== 'string') {
        return;
      }

      const pageDetails = this.getPageDetailsFromUrl(url);
      this.trackPage(pageDetails.contentTitle, pageDetails.pageName);
    } catch (error) {}
  }

  private getPageDetailsFromUrl(url: string): { contentTitle: string; pageName: string } {
    const cleanUrl = url.split('?')[0].split('#')[0];

    if (cleanUrl.includes('fleet-distribution')) {
      return {
        contentTitle: 'fleet distribution',
        pageName: 'fleet insights|fleet distribution'
      };
    } else if (cleanUrl.includes('fleet-trends')) {
      return {
        contentTitle: 'fleet trends',
        pageName: 'fleet insights|fleet trends'
      };
    } else if (cleanUrl.includes('market-activity')) {
      return {
        contentTitle: 'market activity',
        pageName: 'fleet insights|market activity'
      };
    } else if (cleanUrl.includes('asset-ai')) {
      return {
        contentTitle: 'asset ai',
        pageName: 'fleet insights|asset ai'
      };
    }

    return {
      contentTitle: 'fleet insights page',
      pageName: 'fleet insights|fleet insights page'
    };
  }

  private trackPage(contentTitle: string, pageName: string): void {
    try {
      const gwaTagData: GwaDataConfig = {
        page: {
          account: this.currentGwaAccount || '',
          siteSection1: this.siteName || 'fleet insights',
          contentType: 'fleet insights',
          contentTitle,
          pageName,
          contentHierarchy: pageName
        },
        user: {
          authStatus: this.loggedInStatus || 'logged in',
          userId: this.currentUserId || ''
        }
      };

      this.buildDynamicMetaTags(gwaTagData);
      this.processGwaTagsForTracking(this.gwaTags);
    } catch (error) {}
  }

  private buildDynamicMetaTags(gwaTagData: GwaDataConfig): void {
    try {
      if (!gwaTagData || typeof gwaTagData !== 'object') {
        return;
      }

      this.gwaTags = [];

      if (gwaTagData.page && typeof gwaTagData.page === 'object') {
        Object.keys(gwaTagData.page).forEach((propertyKey) => {
          try {
            const value = gwaTagData.page[propertyKey as keyof typeof gwaTagData.page];
            const stringValue = value != null ? String(value) : '';
            const tagName = `gwa_${propertyKey}`;
            this.gwaTags.push({
              name: tagName,
              value: stringValue
            });
          } catch (error) {}
        });
      }

      if (gwaTagData.user && typeof gwaTagData.user === 'object') {
        Object.keys(gwaTagData.user).forEach((propertyKey) => {
          try {
            const value = gwaTagData.user[propertyKey as keyof typeof gwaTagData.user];
            const stringValue = value != null ? String(value) : '';
            const tagName = propertyKey === 'userId' ? 'gwa_userId' : `gwa_${propertyKey}`;
            const tagValue = propertyKey === 'userId' ? stringValue.toLowerCase() : stringValue;
            this.gwaTags.push({
              name: tagName,
              value: tagValue
            });
          } catch (error) {}
        });
      }

      if (this.gwaTags.length > 0) {
        this.gwaMetaTagCreator.createMetaDataTags(this.gwaTags);
      }
    } catch (error) {}
  }

  private processGwaTagsForTracking(dynamicGwaTags: { name: string; value: string }[]): void {
    try {
      const win = window as any;

      if (
        typeof win.gwa_resetSiteCatalystEvents !== 'function' ||
        typeof win.gwa_SetMetaValue !== 'function' ||
        typeof win.gwa_trackPageView !== 'function'
      ) {
        return;
      }

      win.gwa_resetSiteCatalystEvents();

      dynamicGwaTags.forEach((tag) => {
        win.gwa_SetMetaValue(tag.name, tag.value);
      });

      const pageNameTag = dynamicGwaTags.find((tag) => tag.name === 'gwa_pageName');
      const pageName = pageNameTag ? pageNameTag.value : '';
      setTimeout(() => win.gwa_trackPageView(pageName), 500);

      win.gwa_resetSiteCatalystEvents();
    } catch (error) {}
  }
}
