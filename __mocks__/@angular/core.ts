// Mock pour @angular/core dans les tests Jest
export function Injectable(options?: any): any {
  return function(target: any) {
    return target;
  };
}

export function Component(options?: any): any {
  return function(target: any) {
    return target;
  };
}
