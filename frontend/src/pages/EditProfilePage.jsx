import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/ui/Avatar';
import AuthInput from '../components/ui/AuthInput';
import ConfirmModal from '../components/ui/ConfirmModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import { AlertIcon, CameraIcon, UserIcon } from '../components/ui/Icons';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX = 5 * 1024 * 1024; // 5MB

export default function EditProfilePage() {
  const { t } = useTranslation('profile');
  const { chef, updateChef } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState(chef?.displayName || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [nameError, setNameError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [banner, setBanner] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  // Revoke Blob URL ពេល preview ប្តូរ/ចាកចេញ
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const nameChanged = name.trim() !== (chef?.displayName || '');
  const dirty = !!file || nameChanged;

  const onPick = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // អនុញ្ញាតជ្រើសឯកសារដដែលម្តងទៀត
    if (!picked) return;
    if (!AVATAR_TYPES.includes(picked.type)) return setAvatarError(t('edit.avatar.type'));
    if (picked.size > AVATAR_MAX) return setAvatarError(t('edit.avatar.size'));
    setAvatarError('');
    setBanner('');
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const validateName = () => {
    const v = name.trim();
    if (!v) return t('edit.validation.nameRequired');
    if (v.length < 2) return t('edit.validation.nameShort');
    return '';
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving || !dirty) return;
    const err = validateName();
    setNameError(err);
    if (err) return;

    setSaving(true);
    setBanner('');
    try {
      // 1) Upload រូប (endpoint ដាច់ដោយឡែក) 2) PATCH ឈ្មោះ
      if (file) {
        const { avatarUrl } = await authService.uploadAvatar(file);
        updateChef({ avatarUrl });
        setFile(null);
      }
      if (nameChanged) {
        const updated = await authService.updateProfile({ displayName: name.trim() });
        updateChef({ displayName: updated.displayName });
      }
      navigate('/profile', { replace: true, state: { toast: 'saved' } });
    } catch (ex) {
      if (ex.code === 'VALIDATION_FAILED' && ex.errors?.length) {
        const f = ex.errors.find((x) => x.field === 'displayName');
        if (f) setNameError(getErrorMessage({ code: f.code, params: f.params, message: f.message }));
        else setBanner(getErrorMessage(ex));
      } else if (String(ex.code || '').startsWith('AVATAR_')) {
        setAvatarError(getErrorMessage(ex));
      } else {
        setBanner(getErrorMessage(ex));
      }
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => (dirty ? setDiscardOpen(true) : navigate('/profile', { replace: true }));

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-10">
      <PageHeader title={t('edit.title')} onBack={goBack} backLabel={t('back')} />

      <main className="mx-auto max-w-md px-5 pt-6">
        <form onSubmit={onSave} noValidate className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          {banner && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
              <span>{banner}</span>
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={t('edit.changePhoto')}
              className="relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <Avatar src={preview || chef?.avatarUrl} name={name || chef?.displayName} size="lg" />
              <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white">
                <CameraIcon width={18} height={18} />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex h-11 items-center text-[15px] font-medium text-emerald-700"
            >
              {t('edit.changePhoto')}
            </button>
            <p
              className={`text-center text-sm ${avatarError ? 'text-red-600' : 'text-slate-400'}`}
              role={avatarError ? 'alert' : undefined}
            >
              {avatarError || t('edit.photoHint')}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <AuthInput
              label={t('edit.name')}
              type="text"
              name="displayName"
              icon={UserIcon}
              autoComplete="name"
              enterKeyHint="done"
              placeholder={t('edit.namePlaceholder')}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); setBanner(''); }}
              error={nameError}
            />

            {/* Email: read-only (UX Spec §2.5) */}
            <div>
              <span className="mb-1.5 block text-[15px] font-medium text-slate-700">{t('edit.email')}</span>
              <div className="flex h-[52px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-500">
                <span className="truncate">{chef?.email}</span>
              </div>
            </div>

            <PrimaryButton type="submit" loading={saving} disabled={!dirty}>
              {t('edit.save')}
            </PrimaryButton>
          </div>
        </form>
      </main>

      <ConfirmModal
        open={discardOpen}
        destructive
        title={t('edit.discardTitle')}
        message={t('edit.discardMessage')}
        confirmLabel={t('edit.discardConfirm')}
        cancelLabel={t('edit.keepEditing')}
        onConfirm={() => navigate('/profile', { replace: true })}
        onCancel={() => setDiscardOpen(false)}
      />
    </div>
  );
}
