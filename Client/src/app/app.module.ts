import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/components/login/login.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './detail/detail.component';
import { AppRoutingModule } from './app-routing.module';
import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab
import {PasswordModule} from 'primeng/password';
import {InputTextModule} from 'primeng/inputtext';
import { HeaderHomeComponent } from './header-home/header-home.component';
import { MenubarModule } from 'primeng/menubar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { SidebarComponent } from './auth/components/sidebar/sidebar.component';
import { IdeaComponent } from './auth/components/idea/idea.component';
import { CardModule } from 'primeng/card';



@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        LoginComponent,
        ResetPasswordComponent,
        HomeComponent,
        DetailComponent,
        HeaderHomeComponent,
        SidebarComponent,
        IdeaComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AccordionModule,
        PasswordModule,
        InputTextModule,
        MenubarModule,
        SlideMenuModule,
        ButtonModule,
        SpeedDialModule,
        SidebarModule,
        CommonModule,
        FormsModule,
        TabViewModule,
        CardModule
    ]
})
export class AppModule { }

