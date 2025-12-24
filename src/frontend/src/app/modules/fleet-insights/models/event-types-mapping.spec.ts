import { EventIdsToTypes, EventIdsToDetails } from './event-types-mapping';

describe('Event Types Mapping', () => {
  describe('New Order Events', () => {
    it('should map new order event 226 to Orders', () => {
      expect(EventIdsToTypes[226]).toBe('Orders');
    });

    it('should have details for new order event 226', () => {
      expect(EventIdsToDetails[226]).toBe('Scheduled delivery of used / demo. aircraft');
    });
  });

  describe('New Sale & Lease-back Events', () => {
    it('should map new SLB event 343 to Sale & Lease-back', () => {
      expect(EventIdsToTypes[343]).toBe('Sale & Lease-back');
    });

    it('should have details for new SLB event 343', () => {
      expect(EventIdsToDetails[343]).toBe('Scheduled to be purchased and leased back - parked');
    });
  });

  describe('New Lease End Events', () => {
    it('should map new lease end events to Lease End', () => {
      expect(EventIdsToTypes[230]).toBe('Lease End');
      expect(EventIdsToTypes[231]).toBe('Lease End');
      expect(EventIdsToTypes[232]).toBe('Lease End');
      expect(EventIdsToTypes[233]).toBe('Lease End');
    });

    it('should have details for new lease end events', () => {
      expect(EventIdsToDetails[230]).toBe('Scheduled lease expiry - option to buy');
      expect(EventIdsToDetails[231]).toBe('Scheduled lease expiry - option to buy - parked');
      expect(EventIdsToDetails[232]).toBe('Scheduled lease expiry - option to extend');
      expect(EventIdsToDetails[233]).toBe('Scheduled lease expiry - option to extend - parked');
      expect(EventIdsToDetails[234]).toBe('Scheduled lease expiry - parked');
    });
  });

  describe('New Conversion Events', () => {
    it('should map new conversion events to Conversions', () => {
      expect(EventIdsToTypes[220]).toBe('Conversions');
      expect(EventIdsToTypes[314]).toBe('Conversions');
    });

    it('should have details for new conversion events', () => {
      expect(EventIdsToDetails[220]).toBe('Scheduled completion of freight conversion/mod.');
      expect(EventIdsToDetails[314]).toBe('Scheduled fit of winglets / sharklets - parked');
    });
  });

  describe('All New Events Coverage', () => {
    const newEventIds = [226, 343, 230, 231, 232, 233, 220, 314];

    it('should have type mappings for all new events', () => {
      newEventIds.forEach(eventId => {
        expect(EventIdsToTypes[eventId]).toBeDefined();
        expect(EventIdsToTypes[eventId]).not.toBe('');
      });
    });

    it('should have details for all new events', () => {
      newEventIds.forEach(eventId => {
        expect(EventIdsToDetails[eventId]).toBeDefined();
        expect(EventIdsToDetails[eventId]).not.toBe('');
      });
    });

    it('should maintain consistency between backend and frontend mappings', () => {
      const eventTypeMapping = {
        226: 'Orders',
        343: 'Sale & Lease-back',
        230: 'Lease End',
        231: 'Lease End',
        232: 'Lease End',
        233: 'Lease End',
        220: 'Conversions',
        314: 'Conversions'
      };

      Object.entries(eventTypeMapping).forEach(([eventId, expectedType]) => {
        expect(EventIdsToTypes[parseInt(eventId)]).toBe(expectedType);
      });
    });
  });

  describe('Existing Events Integrity', () => {
    it('should not break existing order events', () => {
      expect(EventIdsToTypes[161]).toBe('Orders');
      expect(EventIdsToTypes[162]).toBe('Orders');
      expect(EventIdsToTypes[163]).toBe('Orders');
      expect(EventIdsToTypes[311]).toBe('Orders');
    });

    it('should not break existing SLB events', () => {
      expect(EventIdsToTypes[179]).toBe('Sale & Lease-back');
      expect(EventIdsToTypes[180]).toBe('Sale & Lease-back');
      expect(EventIdsToTypes[342]).toBe('Sale & Lease-back');
    });

    it('should not break existing lease end events', () => {
      expect(EventIdsToTypes[229]).toBe('Lease End');
      expect(EventIdsToTypes[210]).toBe('Lease End');
      expect(EventIdsToTypes[316]).toBe('Lease End');
    });

    it('should not break existing conversion events', () => {
      expect(EventIdsToTypes[167]).toBe('Conversions');
      expect(EventIdsToTypes[216]).toBe('Conversions');
      expect(EventIdsToTypes[217]).toBe('Conversions');
      expect(EventIdsToTypes[221]).toBe('Conversions');
      expect(EventIdsToTypes[315]).toBe('Conversions');
    });
  });
});
