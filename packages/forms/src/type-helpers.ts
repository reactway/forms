export type HTMLProps<TElement extends HTMLElement> = Omit<React.HTMLProps<TElement>, keyof TElement | "ref">;
