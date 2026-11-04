import { useState, useEffect } from 'react';
import { Save, Loader2, Building2, Mail, Palette, Database, Users, UserPlus, X, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  AppSettings,
  assetUrl,
  cancelInvitation,
  Collaborator,
  DEFAULT_SETTINGS,
  inviteCollaborator,
  Invitation,
  listCollaborators,
  listInvitations,
  loadAdminDb,
  removeCollaborator,
  saveSettings,
  uploadFile,
} from '../lib/api';
import { AdminSession, SessionExpiredError } from '../lib/auth';
import { REPO } from '../lib/config';

interface SettingsProps {
  session: AdminSession;
  onSettingsSaved?: (settings: AppSettings) => void;
  onSessionExpired?: () => void;
}

export function Settings({ session, onSettingsSaved, onSessionExpired }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Admin management: admins are collaborators with write access to the repo.
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [busyUser, setBusyUser] = useState<string | null>(null);

  const isPowerAdmin = session.isOwner;

  useEffect(() => {
    loadSettings();
    if (isPowerAdmin) {
      loadUsers();
    }
  }, [isPowerAdmin]);

  useEffect(() => {
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(logoFile);
    } else {
      setLogoPreview('');
    }
  }, [logoFile]);

  const handleError = (error: unknown, fallback: string) => {
    console.error(fallback, error);
    if (error instanceof SessionExpiredError) onSessionExpired?.();
    toast.error(error instanceof Error ? error.message : fallback);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const db = await loadAdminDb();
      setSettings(db.settings);
    } catch (error) {
      handleError(error, 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const organizationLogo = logoFile ? await uploadFile(logoFile, 'organization') : settings.organizationLogo;
      const saved = await saveSettings({ ...settings, organizationLogo });
      setSettings(saved);
      setLogoFile(null);
      toast.success('Settings saved. The public site updates in about a minute.');
      onSettingsSaved?.(saved);
    } catch (error) {
      handleError(error, 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const [people, invites] = await Promise.all([listCollaborators(), listInvitations()]);
      setCollaborators(people);
      setInvitations(invites);
    } catch (error) {
      handleError(error, 'Failed to load admins');
    } finally {
      setLoadingUsers(false);
    }
  };

  const addUser = async () => {
    const login = newUsername.trim().replace(/^@/, '');
    if (!login) return;
    setBusyUser('__new__');
    try {
      const result = await inviteCollaborator(login);
      toast.success(
        result === 'invited'
          ? `Invitation sent to @${login}. They become an admin once they accept it on GitHub.`
          : `@${login} already has access.`,
      );
      setNewUsername('');
      setShowAddUser(false);
      await loadUsers();
    } catch (error) {
      handleError(error, 'Failed to invite user');
    } finally {
      setBusyUser(null);
    }
  };

  const removeUser = async (login: string) => {
    if (!confirm(`Remove admin access for @${login}?`)) return;
    setBusyUser(login);
    try {
      await removeCollaborator(login);
      setCollaborators((current) => current.filter((c) => c.login !== login));
      toast.success(`@${login} no longer has admin access`);
    } catch (error) {
      handleError(error, 'Failed to remove user');
    } finally {
      setBusyUser(null);
    }
  };

  const cancelInvite = async (invite: Invitation) => {
    setBusyUser(`invite-${invite.id}`);
    try {
      await cancelInvitation(invite.id);
      setInvitations((current) => current.filter((i) => i.id !== invite.id));
      toast.success(`Invitation for @${invite.login} cancelled`);
    } catch (error) {
      handleError(error, 'Failed to cancel invitation');
    } finally {
      setBusyUser(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl">
        <div className="flex items-center justify-end mb-6">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Organization Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization Branding
              </CardTitle>
              <CardDescription>
                Customize your Brand Asset Manager with your organization's branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  placeholder="Brand Asset Manager"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be displayed in the sidebar
                </p>
              </div>

              <div>
                <Label htmlFor="orgLogo">Organization Logo</Label>
                <div className="flex items-start gap-4 mt-2">
                  <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : settings.organizationLogo ? (
                      <ImageWithFallback
                        src={assetUrl(settings.organizationLogo)}
                        alt="Organization logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No logo</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="orgLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a logo to display in the sidebar. Recommended size: 200x200px (transparent PNG or SVG)
                    </p>
                    {logoFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Admin Contact
              </CardTitle>
              <CardDescription>
                Contact information for administrative purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@company.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Primary contact for brand asset requests
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    id="accentColor"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Used for buttons and interactive elements (coming soon)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data & Hosting
              </CardTitle>
              <CardDescription>
                Products and files are stored in GitHub and published with GitHub Pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href={`https://github.com/${REPO.owner}/${REPO.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">Repository</p>
                    <p className="text-sm text-gray-500 truncate">{REPO.owner}/{REPO.name} — full history of every change</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                </a>
                <a
                  href={`https://github.com/${REPO.owner}/${REPO.name}/actions`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">Deployments</p>
                    <p className="text-sm text-gray-500">Each save republishes the public site in about a minute</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          {isPowerAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Admins
                </CardTitle>
                <CardDescription>
                  Admins are GitHub users with write access to {REPO.owner}/{REPO.name}. Invited users become admins once they accept the invitation on GitHub.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {showAddUser ? (
                    <form
                      className="p-4 bg-gray-50 rounded-lg space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        addUser();
                      }}
                    >
                      <div>
                        <Label htmlFor="newUsername">GitHub username</Label>
                        <Input
                          id="newUsername"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="octocat"
                          autoFocus
                        />
                        <p className="text-sm text-gray-500 mt-1">They need a free GitHub account to sign in.</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddUser(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={busyUser === '__new__' || !newUsername.trim()} className="gap-2">
                          {busyUser === '__new__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                          Send invite
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Add admin</p>
                        <p className="text-sm text-gray-500">Invite a GitHub user to manage assets</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAddUser(true)}>
                        <UserPlus className="w-4 h-4" />
                        Invite
                      </Button>
                    </div>
                  )}

                  {loadingUsers ? (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                    </div>
                  ) : (
                    <>
                      {collaborators.map((person) => (
                        <div key={person.login} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={person.avatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">@{person.login}</p>
                              <p className="text-sm text-gray-500">{person.isOwner ? 'Power admin' : 'Admin'}</p>
                            </div>
                          </div>
                          {!person.isOwner && person.login !== session.login && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeUser(person.login)}
                              disabled={busyUser === person.login}
                              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              {busyUser === person.login ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          )}
                        </div>
                      ))}
                      {invitations.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            {invite.avatarUrl ? (
                              <img src={invite.avatarUrl} alt="" className="w-9 h-9 rounded-full shrink-0 opacity-60" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">@{invite.login}</p>
                              <p className="text-sm text-amber-600 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Invitation pending
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelInvite(invite)}
                            disabled={busyUser === `invite-${invite.id}`}
                            className="gap-2"
                          >
                            {busyUser === `invite-${invite.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}