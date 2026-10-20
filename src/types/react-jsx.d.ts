declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [name: string]: any;
    }
  }
}

export {};
