import { Pipe, PipeTransform, inject } from '@angular/core';
import { PrivacyService } from '../../core/services/privacy.service';

@Pipe({
  name: 'sensitive',
  standalone: true,
  pure: false
})
export class SensitivePipe implements PipeTransform {
  private privacyService = inject(PrivacyService);

  transform(value: any, mask = '••••'): any {
    return this.privacyService.isPrivate() ? mask : value;
  }
}
