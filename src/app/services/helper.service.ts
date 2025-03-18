export class HelperService {

  constructor() {}

  public static ToPascalCase(s: string): string {
    return s.replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();});
  }
}
