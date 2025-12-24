import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GwaMetaTagCreator {
  private readonly document = inject(DOCUMENT);
  private currentTags = new Map<string, string>();

  createMetaDataTags(dynamicGwaTags: { name: string; value: string }[]): void {
    const newTags = new Map(dynamicGwaTags.map((tag) => [tag.name, tag.value ?? '']));

    newTags.forEach((value, name) => {
      const currentValue = this.currentTags.get(name);
      if (currentValue !== value) {
        this.createOrUpdateMetaTag(name, value);
      }
    });

    this.currentTags.forEach((value, name) => {
      if (!newTags.has(name)) {
        this.removeMetaTag(name);
      }
    });

    this.currentTags = newTags;
  }

  private createOrUpdateMetaTag(name: string, content: string): void {
    const existingTag = this.document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;

    if (existingTag) {
      existingTag.setAttribute('content', content);
    } else {
      const metaElement: HTMLMetaElement = this.document.createElement('meta');
      metaElement.setAttribute('name', name);
      metaElement.setAttribute('content', content);
      this.document.head.appendChild(metaElement);
    }
  }

  private removeMetaTag(name: string): void {
    const tagToRemove = this.document.querySelector(`meta[name="${name}"]`);
    if (tagToRemove) {
      tagToRemove.remove();
    }
  }
}
