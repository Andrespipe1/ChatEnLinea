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
  avatarUrl: string = '';
  selectedFile: File | null = null;
  userId: string = '';

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
      this.userId = data.user.id;
      await this.loadAvatar();
      await this.loadPreviousMessages();
      this.setupRealtimeChat();
  } catch (err) {
    console.error('Error inicializando:', err);
    this.router.navigate(['/auth']);
  }
}
async loadAvatar() {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', this.userId)
      .single();
    if (data && data.avatar_url) {
      this.avatarUrl = data.avatar_url;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async updateAvatar() {
    if (!this.selectedFile || !this.userId) return;
    const fileExt = this.selectedFile.name.split('.').pop();
    const filePath = `avatars/${this.userId}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, this.selectedFile, { upsert: true });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      const avatarUrl = publicUrlData.publicUrl;

      // Actualiza la URL en la tabla de perfiles
      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', this.userId);

      this.avatarUrl = avatarUrl;
      this.selectedFile = null;
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
        // Agrega el nuevo mensaje a la lista
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

    // Obtén el avatar_url del usuario
    let avatarUrl = '';
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    if (profile && profile.avatar_url) {
      avatarUrl = profile.avatar_url;
    }

    const { error } = await supabase
      .from('messagesChat')
      .insert({
        content: this.newMessage,
        email: user.email,
        avatar_url: avatarUrl, // <-- Guarda la URL aquí
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