import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { supabase } from 'src/app/supabase.client';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async login() {
    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
    if (error) this.error = error.message;
    else this.router.navigate(['/home']);
  }

  async register() {
  const { data, error } = await supabase.auth.signUp({
    email: this.email,
    password: this.password,
  });
  if (error) {
    this.error = error.message;
    return;
  }

  // Insertar perfil vacío para el nuevo usuario
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      avatar_url: '',
    });
  }

  alert('Registro exitoso. Verifica tu email.');
  }
}