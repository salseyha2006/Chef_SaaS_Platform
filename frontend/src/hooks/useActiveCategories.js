import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

/** ប្រភេទសកម្មរបស់ចុងភៅ (Chips, Select). loaded=true ក្រោយព្យាយាមផ្ទុកម្តង */
export function useActiveCategories() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const list = (await categoryService.getMine()).filter((c) => c.isActive);
      setCategories(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { categories, loaded, reload };
}