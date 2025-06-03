import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { supabase } from 'src/app/supabase.client';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';

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
  latitude: number | null = null;
  longitude: number | null = null;

  db = getFirestore();

  // --- CONSTRUCTOR ACTUALIZADO ---
  constructor(
    private router: Router,
    private http: HttpClient
  ) {}


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
      this.getCurrentLocation();
      this.listenFirebaseMessages();
  } catch (err) {
    console.error('Error inicializando:', err);
    this.router.navigate(['/auth']);
  }
}

// --- FIREBASE LOCATION ---
  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      },
      (error) => {
        alert('No se pudo obtener la ubicación');
      }
    );
  }

  async sendLocation() {
    if (!this.latitude || !this.longitude) {
      alert('Ubicación no disponible');
      return;
    }
    const url = `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    const messagesRef = collection(this.db, 'messages');
    await addDoc(messagesRef, {
      type: 'location',
      content: url,
      email: this.email,
      timestamp: new Date()
    });
  }

  listenFirebaseMessages() {
    const messagesRef = collection(this.db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
      const firebaseMessages = snapshot.docs.map(doc => doc.data());
      // Mezcla todos los mensajes (Supabase + Firebase) y ordénalos por fecha
      const allMessages = [
        ...this.messages.filter(m => !m.type || m.type !== 'location'),
        ...firebaseMessages
      ];
      // Ordena por timestamp o created_at
      this.messages = allMessages.sort((a: any, b: any) => {
        const aTime = a.created_at
          ? new Date(a.created_at).getTime()
          : a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : 0;
        const bTime = b.created_at
          ? new Date(b.created_at).getTime()
          : b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : 0;
        return aTime - bTime;
      });
    });
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
    // Fuerza recarga agregando un query param único
    const avatarUrl = publicUrlData.publicUrl + '?t=' + Date.now();

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


  // Utilidad para convertir base64 a Blob
  base64ToBlob(base64: string, contentType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
  // Selecciona una foto de la galería y la envía
async selectAndSendPhoto() {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 80,
    });

    if (!photo.base64String) {
      alert('No se pudo obtener la imagen');
      return;
    }

    await this.uploadAndSendPhoto(photo.base64String);
  } catch (err) {
    alert('Error al seleccionar la foto');
  }
}

// Toma una foto con la cámara y la envía
async takeAndSendPhoto() {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 80,
    });

    if (!photo.base64String) {
      alert('No se pudo obtener la imagen');
      return;
    }

    await this.uploadAndSendPhoto(photo.base64String);
  } catch (err) {
    alert('Error al tomar la foto');
  }
}

// Sube la imagen a Supabase y la envía al chat
async uploadAndSendPhoto(base64String: string) {
  const fileName = `chatphotos/${this.userId}_${Date.now()}.jpeg`;
  const { error: uploadError } = await supabase.storage
    .from('chatphotos')
    .upload(fileName, this.base64ToBlob(base64String, 'image/jpeg'));

  if (uploadError) {
    alert('Error subiendo la imagen');
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from('chatphotos')
    .getPublicUrl(fileName);
  const imageUrl = publicUrlData.publicUrl;

  const { error } = await supabase
    .from('messagesChat')
    .insert({
      content: imageUrl,
      email: this.email,
      avatar_url: this.avatarUrl,
      type: 'image',
    });

  if (error) {
    alert('Error enviando la imagen');
  }
  }
  async sendRandomPokemon() {
    // Elige un ID aleatorio entre 1 y 898 (Pokémon disponibles)
    const randomId = Math.floor(Math.random() * 898) + 1;
    try {
      const poke: any = await this.http.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`).toPromise();

      // Prepara los datos básicos
      const pokemonData = {
        name: poke.name,
        image: poke.sprites.front_default,
        stats: poke.stats.slice(0, 3).map((stat: any) => ({
          name: stat.stat.name,
          value: stat.base_stat
        }))
      };

      // Envía el mensaje a Firebase
      const messagesRef = collection(this.db, 'messages');
      await addDoc(messagesRef, {
        type: 'pokemon',
        content: pokemonData,
        email: this.email,
        timestamp: new Date()
      });
    } catch (err) {
      alert('No se pudo obtener el Pokémon');
    }
  }
}

