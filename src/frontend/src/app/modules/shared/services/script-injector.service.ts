import { Injectable, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ScriptInjectorAttribute } from '../models/script-injector-attribute';

@Injectable({
  providedIn: 'root'
})
export class ScriptInjectorService {
  constructor(@Inject(DOCUMENT) private document: Document, private zone: NgZone) {}

  load(attributes: ScriptInjectorAttribute[]): Promise<void> {
    const scriptElement = this.document.createElement('script');
    scriptElement.async = false;
    attributes.forEach((attribute) => {
      if (attribute.name === 'text') {
        scriptElement.text = attribute.value;
      } else {
        scriptElement.setAttribute(attribute.name, attribute.value);
      }
    });

    const promise = new Promise<void>((resolve, reject) => {
      scriptElement.addEventListener('load', () => {
        setTimeout(resolve, 10);
      });
      scriptElement.addEventListener('error', (error) => {
        reject(error);
      });
    });

    this.zone.runOutsideAngular(() => {
      this.document.head.appendChild(scriptElement);
    });

    return promise;
  }
}
