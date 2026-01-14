import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';

const SUPABASE_URL = 'https://bwsvbpmjetkypstxomjs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c3ZicG1qZXRreXBzdHhvbWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjUwMTIsImV4cCI6MjA4MzgwMTAxMn0.yA9BipzH8tLmXADOmXb2CRndcLf6ZmT0zI8E0v_tV9E';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  public user: User | null = null;

  constructor(private router: Router) {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.checkSession();
  }

  private async checkSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.user = session?.user ?? null;

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user ?? null;
    });
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    this.router.navigate(['/notes']);
  }

  async signInWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.user = null;
    this.router.navigate(['/login']);
  }

  async fetchNotes() {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async addNote(title: string, content: string) {
    if (!this.user) throw new Error('User not logged in');
    const { data, error } = await this.supabase
      .from('notes')
      .insert({ title, content, user_id: this.user.id });
    if (error) throw error;
    return data ?? [];
  }

  async deleteNote(id: string) {
    const { data, error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data ?? [];
  }
}
