import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  error = '';

  private supabase: SupabaseClient;

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  async ngOnInit() {
    // If already logged in, go to notes
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.router.navigate(['/notes']);
    }
  }

  async login() {
    this.error = '';
    // 1️⃣ Try logging in
    const { error: loginError } =
      await this.supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password
      });
    // 2️⃣ If user doesn't exist, sign them up
    if (loginError) {
      const { error: signupError } =
        await this.supabase.auth.signUp({
          email: this.email,
          password: this.password
        });
      if (signupError) {
        this.error = signupError.message;
        return;
      }
    }
    // 3️⃣ Success → go to notes
    this.router.navigate(['/notes']);
  }

  // async login() {
  //   this.error = '';

  //   const { error } = await this.supabase.auth.signInWithPassword({
  //     email: this.email,
  //     password: this.password
  //   });

  //   if (error) {
  //     this.error = error.message;
  //   } else {
  //     this.router.navigate(['/notes']);
  //   }
  // }

  async loginWithGoogle() {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/notes'
      }
    });
  }
}
