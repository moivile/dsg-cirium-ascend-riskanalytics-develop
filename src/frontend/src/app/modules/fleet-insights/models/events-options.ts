import { IdNamePairModel } from '../../shared/models/id-name-pair-model';

export const ordersOptions: IdNamePairModel[] = [
  { id: 128, name: 'On order - engines announced' },
  { id: 136, name: 'On order - registration allocation changed' },
  { id: 154, name: 'Order changed from different aircraft type - later cancelled' },
  { id: 155, name: 'Order changed from different aircraft type - later changed to a new type' },
  { id: 157, name: 'Order changed from different aircraft type - not yet delivered' },
  { id: 159, name: 'Order placed for demonstrator / development aircraft' },
  { id: 160, name: 'Order placed for new aircraft - later cancelled' },
  { id: 161, name: 'Order placed for new aircraft - later delivered' },
  { id: 162, name: 'Order placed for new aircraft - not yet delivered' },
  { id: 163, name: 'Order placed for new aircraft - type changed whilst on order' },
  { id: 311, name: 'Registered to Manufacturer' },
  { id: 226, name: 'Scheduled delivery of used / demo. aircraft' }
];

export const deliveriesOptions: IdNamePairModel[] = [
  { id: 31, name: 'Delivered - purchase of used / demo. aircraft' },
  { id: 32, name: 'Delivered' },
  { id: 33, name: 'Delivered - parked' },
  { id: 34, name: 'Delivered parked - purchase of used / demo. aircraft' },
  { id: 35, name: 'Delivered to distributor pending sale / fitting out' },
  { id: 222, name: 'Scheduled delivery of LoI to option aircraft' },
  { id: 223, name: 'Scheduled delivery of LoI to order aircraft' },
  { id: 224, name: 'Scheduled delivery of optioned aircraft' },
  { id: 225, name: 'Scheduled delivery of ordered aircraft' }
];

export const slbOptions: IdNamePairModel[] = [
  { id: 72, name: 'LoI to option - purchase and lease back arranged' },
  { id: 83, name: 'LoI to order - purchase and lease back arranged' },
  { id: 138, name: 'On order - sale & lease back arranged' },
  { id: 177, name: 'Purchased - sale & lease-back' },
  { id: 178, name: 'Purchased - sale & lease-back - parked' },
  { id: 179, name: 'Purchased - sale & lease-back on delivery' },
  { id: 180, name: 'Purchased - sale & lease-back on delivery - parked' },
  { id: 342, name: 'Scheduled to be purchased and leased back' },
  { id: 343, name: 'Scheduled to be purchased and leased back - parked' }
];

export const entryToServiceOptions: IdNamePairModel[] = [
  { id: 106, name: 'New aircraft entered service after being parked' },
  { id: 257, name: 'Scheduled to return to / enter service' }
];

export const cancellationsOptions: IdNamePairModel[] = [
  { id: 6, name: 'Cancelled order' },
  { id: 7, name: 'Cancelled / lapsed LoI to option' },
  { id: 8, name: 'Cancelled / lapsed LoI to order' },
  { id: 9, name: 'Cancelled / lapsed option' }
];

export const purchasesSalesOptions: IdNamePairModel[] = [
  { id: 73, name: 'LoI to option - purchased' },
  { id: 84, name: 'LoI to order - purchased' },
  { id: 116, name: 'On option - purchased' },
  { id: 133, name: 'On order - purchased' },
  { id: 134, name: 'On order - purchased off lease' },
  { id: 135, name: 'On order - purchased subject to existing lease' },
  { id: 174, name: 'Purchased' },
  { id: 175, name: 'Purchased - as green aircraft from distributor' },
  { id: 362, name: 'Purchased - change of owner / SPC - existing lease manager retained' },
  { id: 363, name: 'Purchased - change of owner / SPC - existing lease manager retained - parked' },
  { id: 176, name: 'Purchased - parked' },
  { id: 181, name: 'Purchased - subject to existing lease' },
  { id: 182, name: 'Purchased - subject to existing lease - parked' },
  { id: 183, name: 'Purchased off lease' },
  { id: 184, name: 'Purchased off lease - parked' },
  { id: 185, name: 'Purchased off lease / finance term completed' },
  { id: 186, name: 'Purchased off lease / finance term completed - parked' },
  { id: 250, name: 'Scheduled to be purchased' },
  { id: 251, name: 'Scheduled to be purchased - parked' }
];

export const leaseStartOptions: IdNamePairModel[] = [
  { id: 30, name: 'Delivered - lease of used / demo. aircraft' },
  { id: 62, name: 'Lease extended' },
  { id: 63, name: 'Lease extended - parked' },
  { id: 64, name: 'Leased in' },
  { id: 65, name: 'Leased in - parked' },
  { id: 131, name: 'On order - lease arranged' },
  { id: 245, name: 'Scheduled to be leased in' },
  { id: 334, name: 'Scheduled to be leased in - parked' },
  { id: 324, name: 'Scheduled to be sub-leased' },
  { id: 325, name: 'Scheduled to be sub-wet-leased' },
  { id: 318, name: 'Scheduled to be wet-leased' },
  { id: 267, name: 'Sub-leased' },
  { id: 268, name: 'Sub-leased - parked' },
  { id: 271, name: 'Sub-wet-leased' },
  { id: 272, name: 'Sub-wet-leased - parked' },
  { id: 298, name: 'Wet-leased' },
  { id: 299, name: 'Wet-leased - parked' }
];

export const leaseEndOptions: IdNamePairModel[] = [
  { id: 352, name: 'Lease terminated - parked' },
  { id: 113, name: 'On option - lease agreement terminated' },
  { id: 130, name: 'On order - lease agreement terminated' },
  { id: 206, name: 'Returned off lease' },
  { id: 207, name: 'Returned off lease - parked' },
  { id: 208, name: 'Returned off sub-lease' },
  { id: 209, name: 'Returned off sub-lease - parked' },
  { id: 326, name: 'Returned off sub-wet-lease' },
  { id: 319, name: 'Returned off sub-wet-lease - parked' },
  { id: 320, name: 'Returned off wet-lease' },
  { id: 316, name: 'Returned off wet-lease - parked' },
  { id: 210, name: 'Returned to financial lessor - parked' },
  { id: 229, name: 'Scheduled lease expiry' },
  { id: 230, name: 'Scheduled lease expiry - option to buy' },
  { id: 231, name: 'Scheduled lease expiry - option to buy - parked' },
  { id: 232, name: 'Scheduled lease expiry - option to extend' },
  { id: 233, name: 'Scheduled lease expiry - option to extend - parked' },
  { id: 234, name: 'Scheduled lease expiry - parked' },
  { id: 327, name: 'Scheduled sub-lease expiry' },
  { id: 328, name: 'Scheduled sub-lease expiry - parked' },
  { id: 332, name: 'Scheduled sub-wet-lease expiry' },
  { id: 330, name: 'Scheduled wet-lease expiry' }
];

export const parkedOptions: IdNamePairModel[] = [
  { id: 354, name: 'Cancelled from aircraft register - parked' },
  { id: 353, name: 'Certificate of Airworthiness expired - parked' },
  { id: 165, name: 'Parked' },
  { id: 166, name: 'Parked - offered for sale or lease' },
  { id: 361, name: 'Parked - technical issue' },
  { id: 358, name: 'Reinstated to Aircraft Register' },
  { id: 357, name: 'Reinstated to Aircraft Register - parked' },
  { id: 195, name: 'Repaired - parked' },
  { id: 246, name: 'Scheduled to be parked' },
  { id: 273, name: 'Temporary suspension of type by operator' }
];

export const conversionsOptions: IdNamePairModel[] = [
  { id: 16, name: 'Conversion / modification commenced' },
  { id: 17, name: 'Converted - cargo door installed' },
  { id: 18, name: 'Converted - cargo door installed - parked' },
  { id: 19, name: 'Converted - change of sub series' },
  { id: 20, name: 'Converted - change of sub series - parked' },
  { id: 21, name: 'Converted - from different aircraft type' },
  { id: 22, name: 'Converted - new aircraft type' },
  { id: 23, name: 'Converted from piston engines' },
  { id: 24, name: 'Converted from piston engines - parked' },
  { id: 25, name: 'Converted to piston engines' },
  { id: 69, name: 'LoI to option - aircraft sub series changed' },
  { id: 80, name: 'LoI to order - aircraft sub series changed' },
  { id: 104, name: 'Modified to full freight use' },
  { id: 105, name: 'Modified to full freight use - parked' },
  { id: 295, name: 'Modifier installed / upgrade of minor variant' },
  { id: 296, name: 'Modifier installed / upgrade of minor variant - parked' },
  { id: 110, name: 'On option - aircraft sub series changed' },
  { id: 109, name: 'On option - aircraft variant announced' },
  { id: 119, name: 'On option - upgrade of aircraft minor variant' },
  { id: 123, name: 'On order - aircraft sub series announced' },
  { id: 124, name: 'On order - aircraft sub series changed' },
  { id: 145, name: 'On order - upgrade of minor variant' },
  { id: 156, name: 'Order changed from different aircraft type - later delivered' },
  { id: 158, name: 'Order changed to new aircraft type' },
  { id: 167, name: 'Parked for conversion / mod.' },
  { id: 216, name: 'Scheduled completion of conversion / mod.' },
  { id: 217, name: 'Scheduled completion of conversion / mod. - parked' },
  { id: 220, name: 'Scheduled completion of freight conversion/mod.' },
  { id: 221, name: 'Scheduled completion of freight conversion / mod. - parked' },
  { id: 314, name: 'Scheduled fit of winglets / sharklets - parked' },
  { id: 315, name: 'Scheduled fit of winglets / sharklets' },
  { id: 247, name: 'Scheduled to be parked for conversion / mod.' },
  { id: 312, name: 'Winglets / sharklets fitted' },
  { id: 313, name: 'Winglets / sharklets fitted - parked' }
];

export const retirementsOptions: IdNamePairModel[] = [
  { id: 173, name: 'Permanently withdrawn from use' },
  { id: 249, name: 'Scheduled to be permanently withdrawn from use' }
];
