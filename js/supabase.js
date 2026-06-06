// ─── Forgelux Supabase Client ────────────────────────────────────
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://xizckgqxdllbopsmbzis.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpemNrZ3F4ZGxsYm9wc21iemlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTE4NzIsImV4cCI6MjA5NjI2Nzg3Mn0.OkPjI4XGYiIbYO1Mf7DgVSkQrUfV__zZ1LinTnQjI28'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Auth helpers ──────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true, user: data.user, session: data.session }
}

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  })
  if (error) return { success: false, error: error.message }
  return { success: true, user: data.user }
}

export async function signOut() {
  await supabase.auth.signOut()
  sessionStorage.removeItem('flx_user')
  window.location.href = '/login'
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// ── Workspace helpers ─────────────────────────────────────────────

export async function getWorkspace(workspaceId) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()
  if (error) throw error
  return data
}

export async function getUserWorkspaces(userId) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
  if (error) throw error
  return data.map(m => ({ ...m.workspaces, role: m.role }))
}

export async function createWorkspace(name, ownerId) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, slug, owner_id: ownerId })
    .select()
    .single()
  if (error) throw error
  // Add owner as member
  await supabase.from('workspace_members').insert({
    workspace_id: data.id,
    user_id: ownerId,
    email: (await getCurrentUser()).email,
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString()
  })
  return data
}

// ── App helpers ───────────────────────────────────────────────────

export async function getApps(workspaceId) {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createApp(workspaceId, name, type = 'web') {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('apps')
    .insert({ workspace_id: workspaceId, name, slug, type, created_by: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveApp(appId, canvasJson) {
  const { data, error } = await supabase
    .from('apps')
    .update({ canvas_json: canvasJson, updated_at: new Date().toISOString() })
    .eq('id', appId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function publishApp(appId) {
  const { data, error } = await supabase
    .from('apps')
    .update({ status: 'live', published_at: new Date().toISOString() })
    .eq('id', appId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteApp(appId) {
  const { error } = await supabase.from('apps').delete().eq('id', appId)
  if (error) throw error
}

// ── Automation helpers ────────────────────────────────────────────

export async function getAutomations(workspaceId) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveAutomation(automationId, flowJson) {
  const { data, error } = await supabase
    .from('automations')
    .update({ flow_json: flowJson, updated_at: new Date().toISOString() })
    .eq('id', automationId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAutomationRuns(workspaceId, limit = 50) {
  const { data, error } = await supabase
    .from('automation_runs')
    .select('*, automations(name)')
    .eq('workspace_id', workspaceId)
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ── Team helpers ──────────────────────────────────────────────────

export async function getTeamMembers(workspaceId) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*, users(full_name, email, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data
}

export async function inviteMember(workspaceId, email, role = 'editor') {
  const { data, error } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspaceId, email, role, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMemberRole(memberId, role) {
  const { data, error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeMember(memberId) {
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', memberId)
  if (error) throw error
}

// ── Analytics helpers ─────────────────────────────────────────────

export async function getDashboardStats(workspaceId) {
  const [apps, automations, runs] = await Promise.all([
    supabase.from('apps').select('id, status').eq('workspace_id', workspaceId),
    supabase.from('automations').select('id, status').eq('workspace_id', workspaceId),
    supabase.from('automation_runs')
      .select('id, status, started_at')
      .eq('workspace_id', workspaceId)
      .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ])
  return {
    totalApps:      apps.data?.length || 0,
    liveApps:       apps.data?.filter(a => a.status === 'live').length || 0,
    totalRuns:      runs.data?.length || 0,
    failedRuns:     runs.data?.filter(r => r.status === 'failed').length || 0,
    totalAutomations: automations.data?.length || 0,
  }
}

window.FLXdb = {
  supabase, signIn, signUp, signOut, getSession, getCurrentUser,
  getWorkspace, getUserWorkspaces, createWorkspace,
  getApps, createApp, saveApp, publishApp, deleteApp,
  getAutomations, saveAutomation, getAutomationRuns,
  getTeamMembers, inviteMember, updateMemberRole, removeMember,
  getDashboardStats
}
