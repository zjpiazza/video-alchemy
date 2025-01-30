declare module 'animejs' {
  function anime(params: any): any;
  
  namespace anime {
    function random(min: number, max: number): number;
    function stagger(value: number): any;
    function timeline(params?: any): any;
  }
  
  export = anime;
} 