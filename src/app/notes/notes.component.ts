import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  showNewNoteModal = false;

  supabase: SupabaseClient;
  notes: any[] = [];
  title = '';
  content = '';
  selectedNote: any = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  async ngOnInit() {
    await this.loadNotes();
  }

  // Load notes
  async loadNotes() {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notes:', error.message);
      return;
    }

    this.notes = data ?? [];
  }

  openNewNote() {
    this.title = '';
    this.content = '';
    this.showNewNoteModal = true;
  }
  closeNewNote() {
    this.showNewNoteModal = false;
  }
  
  async addNote() {
  if (!this.title.trim() || !this.content.trim()) return;

  const {
    data: { user }
  } = await this.supabase.auth.getUser();

  if (!user) return;

  //EDIT Note
  if (this.isEditing && this.editingNoteId) {
    const { error } = await this.supabase
      .from('notes')
      .update({
        title: this.title,
        content: this.content
      })
      .eq('id', this.editingNoteId)
      .eq('user_id', user.id);

    if (error) {
      console.error(error.message);
      return;
    }

    const note = this.notes.find(n => n.id === this.editingNoteId);
    if (note) {
      note.title = this.title;
      note.content = this.content;
    }
  }
  //ADD Note
  else {
    const { data, error } = await this.supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: this.title,
        content: this.content
      })
      .select()
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    this.notes.unshift(data);
  }

  // reset modal state
  this.isEditing = false;
  this.editingNoteId = null;
  this.closeNewNote();
}

  // Select a note to view separately
  selectNote(note: any) {
    this.selectedNote = note;
  }

  // Edit Notes
  isEditing = false;
  editingNoteId: string | null = null;
  editNote(note: any) {
    this.title = note.title;
    this.content = note.content;
    this.editingNoteId = note.id;
    this.isEditing = true;
    this.showNewNoteModal = true;
  }

  // Delete a note
  async deleteNote(id: string) {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;
    const {
      data: { user }
    } = await this.supabase.auth.getUser();
    if (!user) return;

    const { error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error.message);
      return;
    }

    this.notes = this.notes.filter(note => note.id !== id);

    if (this.selectedNote?.id === id) {
      this.selectedNote = null;
    }
  }

  // Logout
  async logout() {
    await this.supabase.auth.signOut();
    window.location.href = '/login';
  }
}
