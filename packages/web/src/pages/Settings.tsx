import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, Lock, User as UserIcon, X, Check, Pencil } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { api, authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full h-11 px-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-colors";

const labelCls =
  "block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70 mb-1.5";

function strengthScore(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-400",
  "bg-lime-500",
  "bg-green-600",
];

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  tone = "default",
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={cn(
        "rounded-sm border bg-card p-6 space-y-5",
        tone === "danger"
          ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.03)]"
          : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0",
            tone === "danger"
              ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
              : "bg-muted text-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);

  // Profile fetched from API
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "—",
    email: user?.email ?? "—",
    country: user?.countryCode ?? "—",
    phone: (user as { phone?: string } | null)?.phone ?? "—",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    fullName: profile.fullName,
    phone: profile.phone,
    country: profile.country,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await authApi.me();
        if (cancelled) return;
        const next = {
          fullName: data.fullName ?? "—",
          email: data.email ?? "—",
          country: data.country ?? "—",
          phone: data.phone ?? "—",
        };
        setProfile(next);
        setEditProfile({
          fullName: next.fullName,
          phone: next.phone,
          country: next.country,
        });
      } catch {
        /* keep fallback */
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const score = useMemo(() => strengthScore(newPwd), [newPwd]);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErr(null);

    if (!editProfile.fullName.trim()) {
      setProfileErr("Full name is required");
      return;
    }
    if (editProfile.phone && editProfile.phone.length < 8) {
      setProfileErr("Phone must be at least 8 characters");
      return;
    }

    setProfileSaving(true);
    try {
      const payload: Partial<Pick<typeof editProfile, 'fullName' | 'phone' | 'country'>> = {};
      if (editProfile.fullName !== profile.fullName) payload.fullName = editProfile.fullName;
      if (editProfile.phone !== profile.phone) payload.phone = editProfile.phone;
      if (editProfile.country !== profile.country) payload.country = editProfile.country;

      const data = await authApi.updateMe(payload);
      const next = {
        fullName: data.fullName ?? editProfile.fullName,
        email: data.email ?? profile.email,
        country: data.country ?? editProfile.country,
        phone: data.phone ?? editProfile.phone,
      };
      setProfile(next);
      setEditProfile({ fullName: next.fullName, phone: next.phone, country: next.country });
      updateUser({ fullName: next.fullName, countryCode: next.country, phone: next.phone });
      toast.success("Profile updated");
      setIsEditingProfile(false);
    } catch {
      setProfileErr("Failed to update profile. Please try again.");
      toast.error("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({
      fullName: profile.fullName,
      phone: profile.phone,
      country: profile.country,
    });
    setProfileErr(null);
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr(null);

    if (!currentPwd || !newPwd) {
      setPwdErr("All fields are required");
      return;
    }
    if (newPwd.length < 8) {
      setPwdErr("New password must be at least 8 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdErr("Passwords do not match");
      return;
    }

    setPwdLoading(true);
    try {
      await api.post("/api/auth/change-password", {
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      toast.success("Password updated");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        setPwdErr("Current password is incorrect");
      } else {
        setPwdErr("Something went wrong. Please try again.");
        toast.error("Failed to update password");
      }
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteText !== "DELETE") return;
    setDeleteLoading(true);
    try {
      await api.delete("/api/auth/account");
      try {
        await authApi.logout();
      } catch {
        /* ignore */
      }
      logout();
      toast.success("Account deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete account");
      setDeleteLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, password, and account.
          </p>
        </div>

        {/* PROFILE */}
        <SectionCard
          icon={UserIcon}
          title="Profile"
          description="Your account information"
        >
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input
                    type="text"
                    value={editProfile.fullName}
                    onChange={(e) =>
                      setEditProfile((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className={inputCls}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <div className="h-11 px-3 flex items-center bg-muted/40 border border-border rounded-sm text-sm text-muted-foreground">
                    {profile.email}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input
                    type="text"
                    value={editProfile.country}
                    onChange={(e) =>
                      setEditProfile((p) => ({ ...p, country: e.target.value }))
                    }
                    className={inputCls}
                    autoComplete="country"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    type="tel"
                    value={editProfile.phone}
                    onChange={(e) =>
                      setEditProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    className={inputCls}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {profileErr && (
                <p className="text-xs text-destructive">{profileErr}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:bg-[hsl(354_65%_22%)] transition-colors disabled:opacity-60"
                >
                  {profileSaving ? (
                    "Saving…"
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Full name", profile.fullName],
                  ["Email", profile.email],
                  ["Country", profile.country],
                  ["Phone", profile.phone],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className={labelCls}>{label}</p>
                    <div className="h-11 px-3 flex items-center bg-muted/40 border border-border rounded-sm text-sm text-foreground">
                      {profileLoading ? (
                        <span className="inline-block h-3 w-24 bg-muted animate-pulse rounded-sm" />
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit profile
                </button>
              </div>
            </>
          )}
        </SectionCard>

        {/* PASSWORD */}
        <SectionCard
          icon={Lock}
          title="Password"
          description="Update your sign-in password"
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelCls}>Current password</label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className={labelCls}>New password</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
              {newPwd && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i < score ? STRENGTH_COLOR[score] : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono-ed uppercase tracking-widest text-muted-foreground">
                    {STRENGTH_LABEL[score]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Confirm new password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>

            {pwdErr && (
              <p className="text-xs text-destructive">{pwdErr}</p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:bg-[hsl(354_65%_22%)] transition-colors disabled:opacity-60"
              >
                {pwdLoading ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* DANGER ZONE */}
        <SectionCard
          icon={AlertTriangle}
          title="Danger Zone"
          description="Permanently delete your account and all associated data"
          tone="danger"
        >
          {!showDelete ? (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:bg-[hsl(354_65%_22%)] transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-foreground">
                This action cannot be undone. Type{" "}
                <span className="font-mono-ed font-bold">DELETE</span> to
                confirm.
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className={inputCls}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deleteText !== "DELETE" || deleteLoading}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:bg-[hsl(354_65%_22%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? "Deleting…" : "Permanently delete"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteText("");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm border border-border bg-card text-foreground text-xs font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
