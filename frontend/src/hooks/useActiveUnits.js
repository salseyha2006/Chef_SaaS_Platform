import { useCallback, useEffect, useState } from 'react';
import { unitService } from '../services/unitService';

/** ខ្នាតសកម្មរបស់ចុងភៅ (ប្រើក្នុង Form គ្រឿងផ្សំ/Import). reload() → ត្រឡប់បញ្ជីថ្មី */
export function useActiveUnits() {
  const [units, setUnits] = useState([]);

  const reload = useCallback(async () => {
    try {
      const list = (await unitService.getMine()).filter((u) => u.isActive);
      setUnits(list);
      return list;
    } catch {
      return []; // Select ទទេ; User នៅតែបង្កើតខ្នាតថ្មីបាន
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { units, reload };
}