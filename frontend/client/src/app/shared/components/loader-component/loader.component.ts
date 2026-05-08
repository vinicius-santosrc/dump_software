import { Component, Input } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {

  @Input() width: string = '40px';
  @Input() height: string = '40px';
  @Input() theme: 'light' | 'dark' = 'dark';

  constructor(private readonly themeService: ThemeService) {
    this.theme = this.themeService.getTheme() == "light" ? 'dark' : 'light';
   }
}
