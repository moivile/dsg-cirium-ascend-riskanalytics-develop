import {Injectable} from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import {AuthClientConfig} from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private generalConfiguration!: IGeneralConfiguration;
  private readonly httpClient: HttpClient;

  constructor(private readonly handler: HttpBackend, private readonly authClientConfig: AuthClientConfig) {
    this.httpClient = new HttpClient(this.handler);
  }

  get configuration(): IGeneralConfiguration {
    return this.generalConfiguration;
  }

  load(): Promise<void> {
    const jsonFile = '/api/riskanalytics/configuration/frontend';
    return new Promise<void>((resolve) => {
      this.httpClient.get<any>(jsonFile)
        .subscribe((response: IConfiguration) => {

          const {generalConfiguration, auth0Configuration} = response;

          this.authClientConfig.set({
            domain: auth0Configuration.domain,
            clientId: auth0Configuration.clientId,
            useRefreshTokens: true,
            useRefreshTokensFallback: true,
            authorizationParams:
              {
                redirect_uri: document.location.origin,
                audience: auth0Configuration.audience,
              },
            httpInterceptor: {
              allowedList: [
                {
                  uri: '/api/*',
                  tokenOptions: {
                    authorizationParams: {
                      audience: auth0Configuration.audience,
                    },
                  },
                },
                {
                  uri: generalConfiguration.myCiriumApiUrl + '/*',
                  tokenOptions: {
                    authorizationParams: { audience: 'my-cirium' },
                  },
                },
              ],
            },
          });

          this.generalConfiguration = generalConfiguration;

          resolve();
        });
    });
  }
}

export interface IGeneralConfiguration {
  noAccessUrl: string;
  myCiriumApiUrl: string;
  marketingUrl: string;
  fullStoryOrganisationId: string;
  supportEmailAddress: string;
}

interface IAuth0Configuration {
  clientId: string;
  domain: string;
  audience: string;
}

interface IConfiguration {
  auth0Configuration: IAuth0Configuration;
  generalConfiguration: IGeneralConfiguration;
}
