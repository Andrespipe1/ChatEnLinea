import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { supabase } from 'src/app/supabase.client';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  email = '';
  messages: any[] = [];
  newMessage = '';
  private channel: any;

  constructor(private router: Router) {}

async ngOnInit() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error('Error de autenticación:', error);
      this.router.navigate(['/auth']);
      return;
    }
    
    this.email = data.user.email || '';
    await this.loadPreviousMessages();
    this.setupRealtimeChat();
  } catch (err) {
    console.error('Error inicializando:', err);
    this.router.navigate(['/auth']);
  }
}

  async loadPreviousMessages() {
    const { data, error } = await supabase
      .from('messagesChat')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) {
      this.messages = data;
    }
  }

  setupRealtimeChat() {
    this.channel = supabase
      .channel('public:messagesChat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messagesChat',
        },
        (payload) => {
          this.messages = [...this.messages, payload.new];
        }
      )
      .subscribe();
  }

async sendMessage() {
  if (!this.newMessage.trim()) return;

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Error de autenticación:', authError);
      this.router.navigate(['/auth']);
      return;
    }

    const { error } = await supabase
      .from('messagesChat')
      .insert({
        content: this.newMessage,
        email: user.email,
      });

    if (error) {
      console.error('Error al enviar mensaje:', error);
    } else {
      this.newMessage = '';
    }
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

  async logout() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }
    await supabase.auth.signOut();
    this.router.navigate(['/auth']);
  }
}