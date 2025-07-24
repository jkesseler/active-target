export interface NavItem {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}
