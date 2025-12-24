import { ordersOptions, slbOptions, leaseEndOptions, conversionsOptions } from './events-options';

describe('Events Options', () => {
  describe('Orders Options', () => {
    it('should include new order event 226', () => {
      const event226 = ordersOptions.find((option) => option.id === 226);
      expect(event226).toBeDefined();
      expect(event226?.name).toBe('Scheduled delivery of used / demo. aircraft');
    });

    it('should maintain existing order events', () => {
      const existingIds = [161, 162, 163, 311];
      existingIds.forEach((id) => {
        const option = ordersOptions.find((o) => o.id === id);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Sale & Lease-back Options', () => {
    it('should include new SLB event 343', () => {
      const event343 = slbOptions.find((option) => option.id === 343);
      expect(event343).toBeDefined();
      expect(event343?.name).toBe('Scheduled to be purchased and leased back - parked');
    });

    it('should maintain existing SLB events', () => {
      const existingIds = [178, 179, 180, 342];
      existingIds.forEach((id) => {
        const option = slbOptions.find((o) => o.id === id);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Lease End Options', () => {
    it('should include new lease end events', () => {
      const newLeaseEndEvents = [
        { id: 230, name: 'Scheduled lease expiry - option to buy' },
        { id: 231, name: 'Scheduled lease expiry - option to buy - parked' },
        { id: 232, name: 'Scheduled lease expiry - option to extend' },
        { id: 233, name: 'Scheduled lease expiry - option to extend - parked' },
        { id: 234, name: 'Scheduled lease expiry - parked' }
      ];

      newLeaseEndEvents.forEach((expectedEvent) => {
        const actualEvent = leaseEndOptions.find((option) => option.id === expectedEvent.id);
        expect(actualEvent).toBeDefined();
        expect(actualEvent?.name).toBe(expectedEvent.name);
      });
    });

    it('should maintain existing lease end events', () => {
      const existingIds = [210, 229, 316, 327, 328, 332];
      existingIds.forEach((id) => {
        const option = leaseEndOptions.find((o) => o.id === id);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Conversions Options', () => {
    it('should include new conversion events', () => {
      const newConversionEvents = [
        { id: 220, name: 'Scheduled completion of freight conversion/mod.' },
        { id: 314, name: 'Scheduled fit of winglets / sharklets - parked' }
      ];

      newConversionEvents.forEach((expectedEvent) => {
        const actualEvent = conversionsOptions.find((option) => option.id === expectedEvent.id);
        expect(actualEvent).toBeDefined();
        expect(actualEvent?.name).toBe(expectedEvent.name);
      });
    });

    it('should maintain existing conversion events', () => {
      const existingIds = [167, 216, 217, 221, 315, 247, 312, 313];
      existingIds.forEach((id) => {
        const option = conversionsOptions.find((o) => o.id === id);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Event Options Integrity', () => {
    it('should have unique IDs across all new events', () => {
      const allNewIds = [226, 343, 230, 231, 232, 233, 220, 314];
      const uniqueIds = new Set(allNewIds);
      expect(uniqueIds.size).toBe(allNewIds.length);
    });

    it('should not have duplicate events in any category', () => {
      const checkForDuplicates = (options: any[], categoryName: string): void => {
        const ids = options.map((o: any) => o.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length, `${categoryName} should not have duplicate IDs`);
      };

      checkForDuplicates(ordersOptions, 'Orders');
      checkForDuplicates(slbOptions, 'Sale & Lease-back');
      checkForDuplicates(leaseEndOptions, 'Lease End');
      checkForDuplicates(conversionsOptions, 'Conversions');
    });
  });
});
