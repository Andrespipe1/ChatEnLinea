import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app/app.component';
import { appRouting } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { firebaseConfig } from './environments/environment'; // o donde tengas tu config
import { initializeApp } from 'firebase/app'; 
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, locationOutline, send, logoOctocat } from 'ionicons/icons';

addIcons({
  'camera-outline': cameraOutline,
  'image-outline': imageOutline,
  'location-outline': locationOutline,
  'send': send,
  'logo-octocat': logoOctocat
});
initializeApp(firebaseConfig);
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(IonicModule.forRoot()),
    appRouting,
    provideHttpClient()
  ]
});