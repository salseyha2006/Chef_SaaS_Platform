import { BasketIcon, BowlIcon, CalendarIcon } from '../components/ui/Icons';

/** បន្ថែមជំហានថ្មី = បន្ថែម Object ទីនេះ + `steps.<id>` ក្នុង onboarding.json ទាំងពីរភាសា */
export const ONBOARDING_STEPS = [
  { id: 'ingredients', icon: BasketIcon, tone: 'bg-emerald-100 text-emerald-600' },
  { id: 'dishes', icon: BowlIcon, tone: 'bg-amber-100 text-amber-600' },
  { id: 'events', icon: CalendarIcon, tone: 'bg-sky-100 text-sky-600' },
];
