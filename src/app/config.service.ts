import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { config, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private storage: StorageMap) { }

  getConfig() : Observable<ConfigMap> {
    return this.storage.get("config") as Observable<ConfigMap>;
  }

  acceptTerms() : Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getConfig().subscribe(config => {
        if(!config) config = {acceptedTerms: true}
        else config.acceptedTerms = true;
        this.setConfig(config).subscribe(res => {
          observer.next(true);
          observer.complete();
        });
      })
    })
  }

  private setConfig(config: ConfigMap) {
    return this.storage.set("config", config);
  }
}

export interface ConfigMap {
  acceptedTerms: boolean
}
