/**
 * The JLPT level of each conversation, by code.
 *
 * Kept apart from the conversations themselves so assigning levels touched no
 * authored line. Every conversation used to be imported as N5 — the importer
 * hard-coded it — so a learner had no way to tell an easy exchange from a hard
 * one. A conversation's level is the level of the hardest grammar and
 * vocabulary a learner must produce or understand in it.
 */
export const DIALOGUE_LEVELS: Record<string, 'N5' | 'N4' | 'N3'> = {
  // original.ts
  'restaurant-order': 'N5',
  'restaurant-pay': 'N4',
  'konbini-buy': 'N5',
  'konbini-warm': 'N5',
  'station-ticket': 'N4',
  'station-lost': 'N4',

  // home.ts
  'home-morning': 'N4',
  'home-leaving': 'N4',
  'home-returning': 'N4',
  'home-bed': 'N4',
  'home-lost-item': 'N4',
  'home-rubbish': 'N4',
  'home-laundry': 'N4',
  'home-visitor': 'N4',

  // home2.ts
  'home-guest-arrive': 'N4',
  'home-guest-leave': 'N4',
  'home-weather': 'N4',
  'home-borrow': 'N4',
  'home-noise': 'N4',
  'cooking-recipe': 'N4',
  'shopping-supermarket': 'N4',
  'shopping-bag': 'N5',

  // cooking.ts
  'cooking-whats-for-dinner': 'N4',
  'cooking-fridge': 'N4',
  'cooking-table': 'N4',
  'cooking-taste': 'N4',
  'cooking-leftovers': 'N4',
  'bath-ready': 'N4',
  'bath-after': 'N4',
  'bath-asking': 'N4',

  // out.ts
  'shopping-size': 'N4',
  'shopping-try-on': 'N4',
  'services-post': 'N4',
  'services-haircut': 'N5',
  'travel-hotel-checkin': 'N4',
  'travel-taxi': 'N4',
  'travel-directions': 'N4',

  // people.ts
  'work-arriving': 'N4',
  'work-leaving': 'N4',
  'work-day-off': 'N4',
  'work-introduction': 'N4',
  'school-question': 'N4',
  'school-homework': 'N4',
  'social-plans': 'N4',
  'social-late': 'N4',
  'phone-answering': 'N4',
  'phone-absent': 'N4',

  // health.ts
  'health-dentist-booking': 'N4',
  'health-dentist-pain': 'N3',
  'health-doctor': 'N4',
  'health-pharmacy': 'N4',
  'health-cancel': 'N5',

  // more.ts
  'services-bank': 'N4',
  'cafe-order': 'N4',
  'services-drycleaner': 'N4',
  'gym-join': 'N4',
  'travel-airport': 'N4',
  'travel-bus': 'N4',
  'social-invite': 'N4',
  'social-cancel': 'N4',
  'work-meeting': 'N4',
  'school-absent': 'N4',

  // daily.ts
  'health-dentist-book': 'N4',
  'health-dentist-visit': 'N4',
  'health-pharmacy-book': 'N4',
  'health-symptoms': 'N4',
  'services-delivery': 'N4',
  'services-redeliver': 'N4',
  'home-repair': 'N4',
  'home-neighbour': 'N4',
  'home-rubbish-day': 'N4',
  'out-taxi': 'N4',

  // errands.ts
  'ward-moving-in': 'N3',
  'ward-insurance': 'N3',
  'ward-form-help': 'N4',
  'post-send': 'N4',
  'barber-cut': 'N4',
  'library-card': 'N4',
  'atm-trouble': 'N4',
  'phone-shop': 'N4',
  'laundry-coin': 'N4',
  'shop-return': 'N4',
  'shop-size': 'N4',
  'restaurant-allergy': 'N4',
  'restaurant-split': 'N4',
  'konbini-copy': 'N4',

  // life.ts
  'travel-hotel-checkout': 'N4',
  'travel-hotel-ask': 'N5',
  'bath-onsen': 'N4',
  'station-delay': 'N3',
  'station-lost-item': 'N4',
  'social-hobby': 'N4',
  'social-photo': 'N4',
  'work-apology': 'N4',
  'work-thanks': 'N4',
  'school-explain-again': 'N4',
  'school-homework-late': 'N4',
  'cooking-shopping-list': 'N4',
  'comings-late-home': 'N4',
  'comings-see-off': 'N4',

  // checkout.ts
  'konbini-bento-cash': 'N5',
  'konbini-credit-card': 'N4',
  'konbini-suica': 'N5',
  'konbini-zandaka-busoku': 'N4',
  'konbini-paypay': 'N5',
  'konbini-hot-cold-bags': 'N5',
  'konbini-rush-hour': 'N5',
  'supermarket-standard': 'N5',
  'supermarket-app-seisanki': 'N5',
  'supermarket-self-checkout': 'N4',

  // dining.ts
  'famiresu-entry-wait': 'N5',
  'izakaya-first-drinks': 'N5',
  'famiresu-order-button': 'N5',
  'teishoku-set-meal': 'N5',
  'allergy-and-changes': 'N4',
  'ramen-ticket-counter': 'N5',
  'cafe-counter': 'N5',
  'fast-food-set': 'N5',
  'during-meal-lastorder': 'N4',
  'paying-till-split': 'N5',

  // counters.ts
  'station-ticket-reserved': 'N4',
  'station-ic-charge': 'N4',
  'station-platform-type': 'N4',
  'station-line-suspended': 'N3',
  'station-lost-property': 'N4',
  'services-post-parcel': 'N4',
  'services-takkyubin': 'N4',
  'services-bank-passbook': 'N4',
  'services-pharmacy-prescription': 'N4'
}
