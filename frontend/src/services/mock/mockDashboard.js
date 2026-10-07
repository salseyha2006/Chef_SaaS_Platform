import { mockEvents } from './mockEvents';
import { mockDishes } from './mockDishes';
import { mockMenuSets } from './mockMenuSets';

/**
 * Mock GET /dashboard — គណនាពី Mock ផ្សេងៗ ដើម្បីឆ្លុះបញ្ចាំងទិន្នន័យពិត
 * monthlySpending = Σ grandTotal នៃ Event ក្នុងខែបច្ចុប្បន្ន (ទាំងអតីត/អនាគត — និយមន័យ Backend មិនច្បាស់: Gap #104)
 * dishCount/menuSetCount = ចំនួនសកម្ម (មិនរាប់ Archived — Gap #106)
 */
export const mockDashboard = {
  async get() {
    const [events, dishes, menuSets] = await Promise.all([
      mockEvents.list(),
      mockDishes.list(),
      mockMenuSets.list(),
    ]);
    const now = new Date();
    const inMonth = events.filter((e) => {
      const d = new Date(e.eventDate);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const costs = await Promise.all(inMonth.map((e) => mockEvents.costCalculation(e.id)));
    return {
      upcomingEvents: events.filter((e) => new Date(e.eventDate) >= now).slice(0, 5),
      dishCount: dishes.length,
      menuSetCount: menuSets.length,
      monthlySpending: Number(costs.reduce((sum, c) => sum + c.grandTotal, 0).toFixed(2)),
      subscription: null,
    };
  },
};
