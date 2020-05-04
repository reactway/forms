export type HTMLProps<TElement extends HTMLElement, TBaseProps extends {} = {}> = Omit<React.HTMLProps<TElement>, keyof TBaseProps | "ref">;
