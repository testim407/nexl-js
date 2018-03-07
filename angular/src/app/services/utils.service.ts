import {environment} from '../../environments/environment';

export class UtilsService {
  static prefixUrl(url: string) {
    return environment.nexlRootUrl + url;
  }

  static isPositiveIneger(str) {
    return str.match(/^[0-9]+$/) !== null;
  }
}
