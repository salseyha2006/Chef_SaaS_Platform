import { Outlet } from 'react-router-dom';
import { useTextFieldFocus } from '../../hooks/useTextFieldFocus';
import BottomNavBar from './BottomNavBar';

/**
 * Layout Route សម្រាប់ទំព័រ Root ៥ (Home/Stock/Dishes/Events/More)
 * --bottom-nav-h = កម្ពស់ Nav (រួម Safe-area) ឬ 0 ពេលលាក់ → FAB/Toast លើកខ្លួនឡើងតាម
 * Padding ខាងក្រោម = កម្ពស់ Nav; min-h ទំព័រ (ជា <div> ដំបូងរបស់ Outlet) ត្រូវកាត់ដូចគ្នា កុំឱ្យ Scroll ហួស
 */
export default function MainTabsLayout() {
  const hidden = useTextFieldFocus();
  return (
    <div
      style={{ '--bottom-nav-h': hidden ? '0px' : 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      className="pb-[var(--bottom-nav-h)] [&>div]:min-h-[calc(100dvh_-_var(--bottom-nav-h))]"
    >
      <Outlet />
      {!hidden && <BottomNavBar />}
    </div>
  );
}
