declare module "*.svg" {
    export interface SvgImage {
        src: string;
    }

    const image: SvgImage;
    // eslint-disable-next-line import/no-default-export
    export default image;
}

interface String {
    replaceAll(searchValue: string, replaceValue: string, ignoreCase?: boolean): string;
}
