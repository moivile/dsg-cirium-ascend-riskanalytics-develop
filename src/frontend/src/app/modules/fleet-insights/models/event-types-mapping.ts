export const EventIdsToTypes: { [eventId: number]: string } = {
  // ordersOptions
  128: 'Orders',
  136: 'Orders',
  154: 'Orders',
  155: 'Orders',
  157: 'Orders',
  159: 'Orders',
  160: 'Orders',
  161: 'Orders',
  162: 'Orders',
  163: 'Orders',
  226: 'Orders',
  311: 'Orders',

  // deliveriesOptions
  31: 'Deliveries',
  32: 'Deliveries',
  33: 'Deliveries',
  34: 'Deliveries',
  35: 'Deliveries',
  222: 'Deliveries',
  223: 'Deliveries',
  224: 'Deliveries',
  225: 'Deliveries',

  // slbOptions
  72: 'Sale & Lease-back',
  83: 'Sale & Lease-back',
  138: 'Sale & Lease-back',
  177: 'Sale & Lease-back',
  178: 'Sale & Lease-back',
  179: 'Sale & Lease-back',
  180: 'Sale & Lease-back',
  342: 'Sale & Lease-back',
  343: 'Sale & Lease-back',

  // entryToServiceOptions
  106: 'Entry To Service',
  257: 'Entry To Service',

  // cancellationsOptions
  6: 'Cancellations',
  7: 'Cancellations',
  8: 'Cancellations',
  9: 'Cancellations',

  // purchasesSalesOptions
  73: 'Purchases & Sales',
  84: 'Purchases & Sales',
  116: 'Purchases & Sales',
  133: 'Purchases & Sales',
  134: 'Purchases & Sales',
  135: 'Purchases & Sales',
  174: 'Purchases & Sales',
  175: 'Purchases & Sales',
  362: 'Purchases & Sales',
  363: 'Purchases & Sales',
  176: 'Purchases & Sales',
  181: 'Purchases & Sales',
  182: 'Purchases & Sales',
  183: 'Purchases & Sales',
  184: 'Purchases & Sales',
  185: 'Purchases & Sales',
  186: 'Purchases & Sales',
  250: 'Purchases & Sales',
  251: 'Purchases & Sales',

  // leaseStartOptions
  30: 'Lease Start',
  62: 'Lease Start',
  63: 'Lease Start',
  64: 'Lease Start',
  65: 'Lease Start',
  131: 'Lease Start',
  245: 'Lease Start',
  334: 'Lease Start',
  324: 'Lease Start',
  325: 'Lease Start',
  318: 'Lease Start',
  267: 'Lease Start',
  268: 'Lease Start',
  271: 'Lease Start',
  272: 'Lease Start',
  298: 'Lease Start',
  299: 'Lease Start',

  // leaseEndOptions
  352: 'Lease End',
  113: 'Lease End',
  130: 'Lease End',
  206: 'Lease End',
  207: 'Lease End',
  208: 'Lease End',
  209: 'Lease End',
  326: 'Lease End',
  319: 'Lease End',
  320: 'Lease End',
  316: 'Lease End',
  210: 'Lease End',
  229: 'Lease End',
  230: 'Lease End',
  231: 'Lease End',
  232: 'Lease End',
  233: 'Lease End',
  234: 'Lease End',
  327: 'Lease End',
  328: 'Lease End',
  332: 'Lease End',
  330: 'Lease End',

  // parkedOptions
  354: 'Parked',
  353: 'Parked',
  165: 'Parked',
  166: 'Parked',
  361: 'Parked',
  358: 'Parked',
  357: 'Parked',
  195: 'Parked',
  246: 'Parked',
  273: 'Parked',

  // conversionsOptions
  16: 'Conversions',
  17: 'Conversions',
  18: 'Conversions',
  19: 'Conversions',
  20: 'Conversions',
  21: 'Conversions',
  22: 'Conversions',
  23: 'Conversions',
  24: 'Conversions',
  25: 'Conversions',
  69: 'Conversions',
  80: 'Conversions',
  104: 'Conversions',
  105: 'Conversions',
  295: 'Conversions',
  296: 'Conversions',
  110: 'Conversions',
  109: 'Conversions',
  119: 'Conversions',
  123: 'Conversions',
  124: 'Conversions',
  145: 'Conversions',
  156: 'Conversions',
  158: 'Conversions',
  167: 'Conversions',
  216: 'Conversions',
  217: 'Conversions',
  220: 'Conversions',
  221: 'Conversions',
  315: 'Conversions',
  247: 'Conversions',
  312: 'Conversions',
  313: 'Conversions',
  314: 'Conversions',

  // retirementsOptions
  173: 'Retirements',
  249: 'Retirements'
};

export const EventIdsToDetails: { [eventId: number]: string } = {
  // ordersOptions
  128: 'On order - engines announced',
  136: 'On order - registration allocation changed',
  154: 'Order changed from different aircraft type - later cancelled',
  155: 'Order changed from different aircraft type - later changed to a new type',
  157: 'Order changed from different aircraft type - not yet delivered',
  159: 'Order placed for demonstrator / development aircraft',
  160: 'Order placed for new aircraft - later cancelled',
  161: 'Order placed for new aircraft - later delivered',
  162: 'Order placed for new aircraft - not yet delivered',
  163: 'Order placed for new aircraft - type changed whilst on order',
  311: 'Registered to Manufacturer',
  226: 'Scheduled delivery of used / demo. aircraft',

  // deliveriesOptions
  31: 'Delivered - purchase of used / demo. aircraft',
  32: 'Delivered',
  33: 'Delivered - parked',
  34: 'Delivered parked - purchase of used / demo. aircraft',
  35: 'Delivered to distributor pending sale / fitting out',
  222: 'Scheduled delivery of LoI to option aircraft',
  223: 'Scheduled delivery of LoI to order aircraft',
  224: 'Scheduled delivery of optioned aircraft',
  225: 'Scheduled delivery of ordered aircraft',

  // slbOptions
  72: 'LoI to option - purchase and lease back arranged',
  83: 'LoI to order - purchase and lease back arranged',
  138: 'On order - sale & lease back arranged',
  177: 'Purchased - sale & lease-back',
  178: 'Purchased - sale & lease-back - parked',
  179: 'Purchased - sale & lease-back on delivery',
  180: 'Purchased - sale & lease-back on delivery - parked',
  342: 'Scheduled to be purchased and leased back',
  343: 'Scheduled to be purchased and leased back - parked',

  // entryToServiceOptions
  106: 'New aircraft entered service after being parked',
  257: 'Scheduled to return to / enter service',

  // cancellationsOptions
  6: 'Cancelled order',
  7: 'Cancelled / lapsed LoI to option',
  8: 'Cancelled / lapsed LoI to order',
  9: 'Cancelled / lapsed option',

  // purchasesSalesOptions
  73: 'LoI to option - purchased',
  84: 'LoI to order - purchased',
  116: 'On option - purchased',
  133: 'On order - purchased',
  134: 'On order - purchased off lease',
  135: 'On order - purchased subject to existing lease',
  174: 'Purchased',
  175: 'Purchased - as green aircraft from distributor',
  362: 'Purchased - change of owner / SPC - existing lease manager retained',
  363: 'Purchased - change of owner / SPC - existing lease manager retained - parked',
  176: 'Purchased - parked',
  181: 'Purchased - subject to existing lease',
  182: 'Purchased - subject to existing lease - parked',
  183: 'Purchased off lease',
  184: 'Purchased off lease - parked',
  185: 'Purchased off lease / finance term completed',
  186: 'Purchased off lease / finance term completed - parked',
  250: 'Scheduled to be purchased',
  251: 'Scheduled to be purchased - parked',

  // leaseStartOptions
  30: 'Delivered - lease of used / demo. aircraft',
  62: 'Lease extended',
  63: 'Lease extended - parked',
  64: 'Leased in',
  65: 'Leased in - parked',
  131: 'On order - lease arranged',
  245: 'Scheduled to be leased in',
  334: 'Scheduled to be leased in - parked',
  324: 'Scheduled to be sub-leased',
  325: 'Scheduled to be sub-wet-leased',
  318: 'Scheduled to be wet-leased',
  267: 'Sub-leased',
  268: 'Sub-leased - parked',
  271: 'Sub-wet-leased',
  272: 'Sub-wet-leased - parked',
  298: 'Wet-leased',
  299: 'Wet-leased - parked',

  // leaseEndOptions
  352: 'Lease terminated - parked',
  113: 'On option - lease agreement terminated',
  130: 'On order - lease agreement terminated',
  206: 'Returned off lease',
  207: 'Returned off lease - parked',
  208: 'Returned off sub-lease',
  209: 'Returned off sub-lease - parked',
  326: 'Returned off sub-wet-lease',
  319: 'Returned off sub-wet-lease - parked',
  320: 'Returned off wet-lease',
  316: 'Returned off wet-lease - parked',
  210: 'Returned to financial lessor - parked',
  229: 'Scheduled lease expiry',
  230: 'Scheduled lease expiry - option to buy',
  231: 'Scheduled lease expiry - option to buy - parked',
  232: 'Scheduled lease expiry - option to extend',
  233: 'Scheduled lease expiry - option to extend - parked',
  234: 'Scheduled lease expiry - parked',
  327: 'Scheduled sub-lease expiry',
  328: 'Scheduled sub-lease expiry - parked',
  332: 'Scheduled sub-wet-lease expiry',
  330: 'Scheduled wet-lease expiry',

  // parkedOptions
  354: 'Cancelled from aircraft register - parked',
  353: 'Certificate of Airworthiness expired - parked',
  165: 'Parked',
  166: 'Parked - offered for sale or lease',
  361: 'Parked - technical issue',
  358: 'Reinstated to Aircraft Register',
  357: 'Reinstated to Aircraft Register - parked',
  195: 'Repaired - parked',
  246: 'Scheduled to be parked',
  273: 'Temporary suspension of type by operator',

  // conversionsOptions
  16: 'Conversion / modification commenced',
  17: 'Converted - cargo door installed',
  18: 'Converted - cargo door installed - parked',
  19: 'Converted - change of sub series',
  20: 'Converted - change of sub series - parked',
  21: 'Converted - from different aircraft type',
  22: 'Converted - new aircraft type',
  23: 'Converted from piston engines',
  24: 'Converted from piston engines - parked',
  25: 'Converted to piston engines',
  69: 'LoI to option - aircraft sub series changed',
  80: 'LoI to order - aircraft sub series changed',
  104: 'Modified to full freight use',
  105: 'Modified to full freight use - parked',
  295: 'Modifier installed / upgrade of minor variant',
  296: 'Modifier installed / upgrade of minor variant - parked',
  110: 'On option - aircraft sub series changed',
  109: 'On option - aircraft variant announced',
  119: 'On option - upgrade of aircraft minor variant',
  123: 'On order - aircraft sub series announced',
  124: 'On order - aircraft sub series changed',
  145: 'On order - upgrade of minor variant',
  156: 'Order changed from different aircraft type - later delivered',
  158: 'Order changed to new aircraft type',
  167: 'Parked for conversion / mod.',
  216: 'Scheduled completion of conversion / mod.',
  217: 'Scheduled completion of conversion / mod. - parked',
  220: 'Scheduled completion of freight conversion/mod.',
  221: 'Scheduled completion of freight conversion / mod. - parked',
  314: 'Scheduled fit of winglets / sharklets - parked',
  315: 'Scheduled fit of winglets / sharklets',
  247: 'Scheduled to be parked for conversion / mod.',
  312: 'Winglets / sharklets fitted',
  313: 'Winglets / sharklets fitted - parked',

  // retirementsOptions
  173: 'Permanently withdrawn from use',
  249: 'Scheduled to be permanently withdrawn from use'
};

export function getEventTypeName(eventId: number): string {
  return EventIdsToTypes[eventId] || 'Unknown';
}

export function getEventDetail(eventId: number): string {
  return EventIdsToDetails[eventId] || `Unknown Event (${eventId})`;
}

export function mapEventIdsToDetails(eventIds: number[]): string[] {
  if (!Array.isArray(eventIds)) {
    return [];
  }

  return eventIds.map((id) => getEventDetail(id));
}

export function getAllEventTypes(): string[] {
  return [...new Set(Object.values(EventIdsToTypes))];
}

export function groupEventIdsByType(eventIds: number[]): { [eventType: string]: number[] } {
  const grouped: { [eventType: string]: number[] } = {};

  eventIds.forEach((eventId) => {
    const eventType = getEventTypeName(eventId);
    if (eventType !== 'Unknown') {
      if (!grouped[eventType]) {
        grouped[eventType] = [];
      }
      grouped[eventType].push(eventId);
    }
  });

  return grouped;
}
