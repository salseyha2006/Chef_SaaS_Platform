import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';
import { normalizeName } from '../utils/catalog';

/**
 * Logic រួមរបស់ Tab ខ្នាត/ប្រភេទ (Preset Checklist + Import + Archive)
 * service ត្រូវមាន: getPresets, getMine, create, importPreset, archive
 *
 * Row: { key, presetId?, mineId, name, data, checked }
 *  - presetRows: ពី Preset (checked = មាន ChefItem សកម្មឈ្មោះដូចគ្នា)
 *  - customRows: ChefItem សកម្មដែលមិនមែនមកពី Preset (ចុងភៅបង្កើតខ្លួនឯង)
 */
export function useCatalogConfig(service) {
  const [presets, setPresets] = useState([]);
  const [mine, setMine] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState(null);
  const reqRef = useRef(0); // ការពារ Response ចាស់ជាន់ State ថ្មី

  const load = useCallback(async () => {
    const id = ++reqRef.current;
    try {
      const [p, m] = await Promise.all([service.getPresets(), service.getMine()]);
      if (id !== reqRef.current) return;
      setPresets(p);
      setMine(m);
      setError('');
      setStatus('ready');
    } catch (err) {
      if (id !== reqRef.current) return;
      setError(getErrorMessage(err));
      setStatus((s) => (s === 'ready' ? s : 'error')); // រក្សាទិន្នន័យចាស់ពេលបរាជ័យបណ្តោះអាសន្ន
    }
  }, [service]);

  useEffect(() => {
    setStatus('loading');
    load();
    return () => { reqRef.current += 1; };
  }, [load]);

  const { presetRows, customRows } = useMemo(() => {
    const active = mine.filter((m) => m.isActive);
    const byName = new Map(active.map((m) => [normalizeName(m.name), m]));
    const presetNames = new Set(presets.map((p) => normalizeName(p.name)));
    return {
      presetRows: presets.map((p) => {
        const hit = byName.get(normalizeName(p.name));
        return {
          key: `p:${p.id}`, presetId: p.id, mineId: hit?.id ?? null,
          name: p.name, data: hit || p, checked: Boolean(hit),
        };
      }),
      customRows: active
        .filter((m) => !presetNames.has(normalizeName(m.name)))
        .map((m) => ({ key: `m:${m.id}`, mineId: m.id, name: m.name, data: m, checked: true })),
    };
  }, [presets, mine]);

  /** Action + Reload; return true/false (Page ប្រើបង្ហាញ Toast) */
  const run = useCallback(async (key, fn) => {
    setBusyKey(key);
    setError('');
    try {
      await fn();
      await load();
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.code?.endsWith('_ALREADY_IMPORTED')) load(); // Sync State ពី Server
      return false;
    } finally {
      setBusyKey(null);
    }
  }, [load]);

  const importPreset = useCallback((row) => run(row.key, () => service.importPreset(row.presetId)), [run, service]);
  const archive = useCallback((row) => run(row.key, () => service.archive(row.mineId)), [run, service]);

  /** បង្កើតថ្មី: បោះ Error ឱ្យ Sheet ដោះស្រាយ (Validation/EXISTS) */
  const create = useCallback(async (values) => {
    const item = await service.create(values);
    await load();
    return item;
  }, [load, service]);

  return { status, error, busyKey, presetRows, customRows, reload: load, importPreset, archive, create };
}