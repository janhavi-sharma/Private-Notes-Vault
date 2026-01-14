import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { NotesComponent } from './notes/notes.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'notes', component: NotesComponent},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
